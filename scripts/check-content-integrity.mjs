#!/usr/bin/env node
// Content-integrity gate (official-web-content-truth): site-authored copy must
// never reference retired organizations, domains, or infrastructure.
//
// Plus (yizuo-course-system): academy courses declaring `level: use` are gated
// to reader-facing language — no console deep-links (url-path), no technical
// identifiers (tech-identifier), no error codes (error-code), no code blocks
// (code-block). Codes and code blocks are allowed under a 「如果没成功」-style
// heading (the designated troubleshooting section, tasks 5.3). Per-course
// exceptions go in front-matter `gate_exceptions` — a bare rule id
// (`"code-block"`) disables that rule for the whole file; any other string
// (e.g. `"A2A"`) exempts every line containing it. Note fetch-strapi
// regenerates course front-matter, so an exception that must survive a
// re-fetch needs a CMS field (not wired yet).
//
// Out of scope on purpose: src/content/repos/ is the build-time GitHub mirror
// (regenerated from upstream READMEs every build) — retirements there are
// handled on GitHub itself (see the change's repo-descriptions deliverable).
//
// Usage:
//   node scripts/check-content-integrity.mjs [paths...]   # default: src
//   node scripts/check-content-integrity.mjs --self-test  # matcher sanity check
//
// Extending: add an entry to RETIRED (retired identifiers) or USE_RULES
// (use-layer language) below — no other change needed.

import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join, sep } from 'node:path';

const RETIRED = [
  { id: 'FindDataOfficial', pattern: /FindDataOfficial/ },
  { id: 'craw.finddatatech.cloud', pattern: /craw\.finddatatech\.cloud/i },
  { id: 'Scrapyd (retired crawl stack)', pattern: /scrapyd/i },
];

// use-layer language rules (yizuo-course-system). Matched per line, only for
// academy files whose front-matter says `level: use`.
const USE_RULES = [
  // Console deep-links — any console-rooted URL path, optionally with host,
  // at line start or after a spacer / opening quote / backtick.
  { id: 'url-path', pattern: /(?:^|[\s(`>「『【（])\/(?:settings|admin|console|workbench|facet|platform|wanxing)\/[^\s)》」】]*/ },
  // Technical identifiers. Names listed verbatim (no \b so longer names win
  // over shorter prefixes); token-like ids (MCP/A2A) use word boundaries.
  { id: 'tech-identifier', pattern: /(?:\b(?:MCP|A2A)\b|Logto|dsh|finddatatech\.cloud|sk-[A-Za-z0-9_-]{4,})/ },
  // Error/status codes — keyword-anchored so a plain count ("上传 500 条记录")
  // stays clean: the number must sit next to an error word, or be an
  // E-constant / server-error phrase.
  {
    id: 'error-code',
    pattern:
      /(?:\b[45]\d{2}\s*(?:错误|报错|Bad Gateway|Internal Server Error)|\b(?:HTTP|状态码|错误码)\s*[:：]?\s*[45]\d{2}\b|\bE(?:CONNREFUSED|CONNRESET|AUTH|INVAL)\b|Internal Server Error|Connection refused)/,
  },
];

const USE_RULE_IDS = new Set(USE_RULES.map((r) => r.id).concat('code-block'));

// Lines starting a troubleshooting section: below these, error-code (and any
// code blocks inside) are tolerated in use-layer courses — tasks 5.3 puts
// error mechanics exactly there.
const TROUBLESHOOT_HEADING = /^(#{1,6}\s+.*(如果没成功|排障|故障排查|troubleshooting)|\*\*如果没成功\*\*)/i;

// Directory names skipped when scanned directly under src/content/.
const MIRROR_DIR = join('src', 'content', 'repos'); // build-time GitHub mirror — out of scope
const EXTS = new Set(['.md', '.mdx', '.astro', '.ts', '.mts', '.js', '.mjs', '.json', '.html']);

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if (p === MIRROR_DIR || p.endsWith(`/${MIRROR_DIR}`)) continue;
      yield* walk(p);
    } else if (EXTS.has(extname(e.name))) {
      yield p;
    }
  }
}

function scanText(file, text) {
  const hits = [];
  text.split('\n').forEach((line, i) => {
    for (const r of RETIRED) {
      if (r.pattern.test(line)) {
        hits.push({ file, line: i + 1, id: r.id, snippet: line.trim().slice(0, 120) });
      }
    }
  });
  return hits;
}

// ── use-layer language gate (yizuo-course-system) ───────────────────────────

// Minimal front-matter reader: the site's md front-matter is a closed field
// set (see fetch-strapi.mjs) — top-level `key: value` plus simple flow lists.
function parseFrontMatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!m) return null;
  const fm = {};
  for (const raw of m[1].split('\n')) {
    const kv = raw.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    let [, k, v] = kv;
    v = v.trim();
    if (v.startsWith('[') && v.endsWith(']')) {
      fm[k] = v
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean);
    } else {
      fm[k] = v.replace(/^['"]|['"]$/g, '');
    }
  }
  return fm;
}

// Split body into line kinds. Fence-opening/closing lines are flagged
// 'fence'; interior lines 'in-fence'. Each fence block is reported once (its
// opening line) as a code-block hit; interior lines stay silent so one block
// is one finding, while remaining exempt from the other rules.
function classifyLines(bodyLines) {
  const kinds = [];
  let fence = null;
  for (const line of bodyLines) {
    const open = line.match(/^(\s{0,3})(`{3,}|~{3,})/);
    if (fence) {
      kinds.push('in-fence');
      if (open && open[2][0] === fence[0] && open[2].length >= fence.length) fence = null;
    } else if (open) {
      kinds.push('fence');
      fence = open[2];
    } else {
      kinds.push('text');
    }
  }
  return kinds;
}

function scanUseLayer(file, text) {
  const fm = parseFrontMatter(text);
  if (!fm || fm.level !== 'use') return [];
  const exceptions = Array.isArray(fm.gate_exceptions) ? fm.gate_exceptions : [];
  const ruleOff = (id) => exceptions.includes(id);
  // Any exception token that is not a rule id exempts lines containing it
  // verbatim (e.g. `gate_exceptions: ["A2A"]` lets the course explain A2A).
  const literals = exceptions.filter((e) => !USE_RULE_IDS.has(e));

  const bodyStart = text.match(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n)?/);
  const body = bodyStart ? text.slice(bodyStart[0].length) : text;
  const bodyLines = body.split('\n');
  const kinds = classifyLines(bodyLines);

  const hits = [];
  let inTroubleshoot = false;
  let inBlock = false;
  bodyLines.forEach((line, i) => {
    if (kinds[i] === 'fence' || kinds[i] === 'in-fence') {
      // One hit per fence block, on its opening line; tolerated inside a
      // troubleshooting section (tasks 5.3 puts command snippets exactly there).
      if (kinds[i] === 'fence' && !inBlock && !ruleOff('code-block') && !inTroubleshoot) {
        hits.push({ file, line: i + 1, id: 'code-block', snippet: line.trim().slice(0, 120) });
      }
      inBlock = kinds[i] === 'fence';
      return;
    }
    if (TROUBLESHOOT_HEADING.test(line.trim())) inTroubleshoot = true;
    if (literals.some((lit) => line.includes(lit))) return;
    for (const r of USE_RULES) {
      if (ruleOff(r.id)) continue;
      // Error codes and shell output belong in the troubleshooting section.
      if (r.id === 'error-code' && inTroubleshoot) continue;
      if (r.pattern.test(line)) {
        hits.push({ file, line: i + 1, id: r.id, snippet: line.trim().slice(0, 120) });
      }
    }
  });
  return hits;
}

async function selfTest() {
  const samples = [
    ['FindDataOfficial', 'the code lives on the FindDataOfficial GitHub org', true],
    ['craw.finddatatech.cloud', 'see https://CRAW.FindDataTech.Cloud/entry', true],
    ['Scrapyd', 'runs as a CronJob on a Scrapyd crawl stack', true],
    ['negative control', 'the FindDataTechnology org, at platform.finddatatech.cloud', false],
  ];
  let ok = true;
  for (const [id, sample, expect] of samples) {
    const hit = RETIRED.some((r) => r.pattern.test(sample));
    const pass = hit === expect;
    ok = ok && pass;
    console.log(`  ${pass ? 'ok  ' : 'FAIL'} ${expect ? 'detect' : 'clean'}: ${id}`);
  }

  // Fixed counter-examples for the use-layer gate (yizuo-course-system):
  // legitimate business concepts must NOT be flagged; real violations MUST be.
  const course = (body, extra = '') =>
    ['---', 'title: "t"', 'summary: "s"', 'level: use', 'source_material: "m"', ...(extra ? [extra] : []), '---', '', body.trimEnd(), ''].join('\n');
  const useHits = (text) => scanUseLayer('self-test.md', text);
  const cases = [
    // —— negative: legitimate business language ——
    ['business concept 功能集', '在谦面市场订阅一个功能集，技能就会出现在你的壹座里。', 0],
    ['business concept 技能/预设', '把常用技能组装成预设，一次配置、处处调用。', 0],
    ['big number not error code', '支持批量上传，一次可导入 500 条记录，上限 404 个条目。', 0],
    ['generic url not console path', '官网教程见 /research/academy，公开目录见首页。', 0],
    // —— positive: real violations ——
    ['console deep-link', '打开控制台的 `/settings/packs` 页面安装。', 1],
    ['tech identifier MCP', '这一步会校验 MCP 引用是否可用。', 1],
    ['tech identifier Logto', '登录由 Logto 统一处理。', 1],
    ['error code with keyword', '若提示 502 错误，请重试。', 1],
    ['code block', '在终端执行：\n\n```\ncurl -H "Authorization: Bearer sk-xxx" ...\n```', 1],
  ];
  for (const [id, body, expect] of cases) {
    const hits = useHits(course(body));
    const pass = hits.length === expect;
    ok = ok && pass;
    console.log(`  ${pass ? 'ok  ' : 'FAIL'} ${expect ? 'detect' : 'clean'}: ${id}${pass ? '' : ` (got ${hits.length}: ${JSON.stringify(hits.map((h) => h.id))})`}`);
  }

  // Counter-example machinery: a gate_exceptions literal exempts its lines; a
  // rule id turns the rule off file-wide; troubleshooting sections tolerate
  // error codes and fenced snippets.
  const exemptOk = useHits(course('调用走 A2A 协议。', 'gate_exceptions: ["A2A"]\n')).length === 0;
  const ruleOffOk =
    useHits(course('在 `/settings/packs` 安装。', 'gate_exceptions: ["url-path"]\n')).length === 0;
  const troubleOk = useHits(
    course('### 如果没成功\n\n看到 502 错误时：\n\n```\ncurl https://api.example.com/health\n```\n'),
  ).length === 0;
  for (const [id, pass] of [['exceptions: literal', exemptOk], ['exceptions: rule id', ruleOffOk], ['troubleshooting tolerance', troubleOk]]) {
    ok = ok && pass;
    console.log(`  ${pass ? 'ok  ' : 'FAIL'} ${pass ? 'clean' : 'detect'}: ${id}`);
  }
  process.exit(ok ? 0 : 1);
}

const args = process.argv.slice(2);
if (args.includes('--self-test')) await selfTest();

const targets = args.filter((a) => !a.startsWith('--'));
if (!targets.length) targets.push('src');

const files = [];
for (const t of targets) {
  const s = await stat(t).catch(() => null);
  if (!s) {
    console.error(`[content-integrity] path not found: ${t}`);
    process.exit(2);
  }
  if (s.isDirectory()) {
    for await (const f of walk(t)) files.push(f);
  } else {
    files.push(t);
  }
}
files.sort();

const hits = [];
const staleCourses = []; // academy courses missing `updated` — warn only (3.5)
for (const f of files) {
  const text = await readFile(f, 'utf8').catch(() => null);
  if (text == null) continue;
  hits.push(...scanText(f, text));
  // use-layer gate is defined for course markdown; .astro files also open with
  // `---` (JS front-matter) and must not be parsed as course front-matter.
  if (/\.mdx?$/.test(f)) hits.push(...scanUseLayer(f, text));
  // yizuo-course-system: every course must carry `updated` (spec: 更新时间),
  // but until task 5.5 backfills the存量 three, absence warns without blocking.
  if (f.split(sep).includes('academy') && extname(f) === '.md') {
    const fm = parseFrontMatter(text);
    if (fm && !fm.updated) staleCourses.push(f);
  }
}

if (staleCourses.length) {
  console.warn(`[content-integrity] warning: ${staleCourses.length} academy course(s) missing front-matter \`updated\` (displays as never-updated; non-blocking):`);
  for (const f of staleCourses) console.warn(`  ${f}`);
}

if (hits.length) {
  console.error(`[content-integrity] ${hits.length} hit(s):`);
  for (const h of hits) console.error(`  ${h.file}:${h.line}  [${h.id}]  ${h.snippet}`);
  console.error('\nRetired surfaces are defined in official-web-content-truth (specs/content-integrity);');
  console.error('use-layer language rules in yizuo-course-system (specs/xingyan-academy).');
  process.exit(1);
}
console.log(
  `[content-integrity] clean — ${files.length} file(s) scanned against ${RETIRED.length} retired identifiers + ${USE_RULES.length + 1} use-layer rules, 0 hits`,
);
