#!/usr/bin/env node
// Build-time pull of the Xingyan (星研) editorial collections (内参 briefings /
// 学院 academy / 研究 research) from the self-hosted Strapi v5 into exactly the
// md shape the glob loaders already consume — pull-to-files (strapi-content-
// publishing D1): src/content/<collection>/<locale>/<slug>.md. The zod schemas
// (content.config.ts), the bilingual twins gate (lib/xingyan.ts) and the
// retired-identifier check (check-content-integrity.mjs) then run on the
// pulled files unchanged, one step later in the build chain.
//
// Modes:
//   node scripts/fetch-strapi.mjs
//     Online pull. Env: STRAPI_URL (base address, no trailing slash; unset →
//     print the local-dev skip line and exit 0, keeping the committed
//     snapshot), STRAPI_READ_TOKEN (optional Bearer; public reads work
//     without it — a 401 names the token as the likely cause).
//   node scripts/fetch-strapi.mjs --fixture <dir>
//     Offline contract test: read briefings.json / courses.json /
//     research-articles.json (REST-shaped { data, meta }) from <dir>, no HTTP.
//     Everything after the fetch (preflight, serialization, write) is
//     identical to the online mode. The shipped fixtures under
//     scripts/fixtures/strapi must round-trip the committed md byte for byte
//     (git status stays clean) — that diff=0 is the Strapi cutover criterion
//     (design D8).
//
// Fail-closed (D2): unreachable host / 401 / malformed response / bilingual
// pair missing / >50% shrink / missing required fields all exit 1 BEFORE any
// file is written. A red build simply does not deploy; the site never falls
// back to a stale snapshot silently. The full new set is staged under
// node_modules/.cache first and committed into src/content only after every
// preflight passes; files absent from the pull are deleted (unpublish takes
// effect). Write phase starts by removing node_modules/.astro — the Astro
// data-store keeps stale entries when collection files change under it.

import { rm, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PAGE_SIZE = 100;
const MAX_PAGES = 100;
const LOCALES = ['zh', 'en'];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const KINDS = ['paper', 'casestudy', 'note'];

// Strapi content-type API endpoint → content dir + serializer kind.
const COLLECTIONS = [
  { api: 'briefings', dir: 'briefings', kind: 'briefings', label: '内参 briefings' },
  { api: 'courses', dir: 'academy', kind: 'academy', label: '学院 academy' },
  { api: 'research-articles', dir: 'research', kind: 'research', label: '研究 research' },
];

// Required non-empty string fields per kind (zod-required fields plus the
// keys the writer needs: documentId / slug / locale / body).
const STRING_FIELDS = {
  briefings: ['documentId', 'slug', 'locale', 'title', 'body', 'date', 'summary'],
  academy: ['documentId', 'slug', 'locale', 'title', 'body', 'summary', 'source_material'],
  research: ['documentId', 'slug', 'locale', 'title', 'body', 'date', 'summary', 'kind'],
};

// ── frontmatter serialization ────────────────────────────────────────────────
// Hand-rolled on purpose (no new dependencies — the field set is closed), and
// frozen against the committed files: per-collection quoting profiles that
// `--fixture scripts/fixtures/strapi` must reproduce byte for byte.
//   briefings: minimal quoting — plain unless YAML forces quotes (values with
//              ": " etc.); committed style.
//   academy:   title / summary / source_material always double-quoted,
//              pack_url '' (empty) or double-quoted, order bare.
//   research:  title / summary always double-quoted; source items quoted when
//              they carry ASCII parens (the committed en sources annotate the
//              Chinese original in parens; zh sources are bare), else plain.

// True when s can be a YAML plain (unquoted) scalar in a block-mapping value.
// Conservative: anything ambiguous falls back to double quotes.
function plainSafe(s) {
  return (
    typeof s === 'string' &&
    s !== '' &&
    !/^[\s\-?:,[\]{}#&*!|>'"%@`]/.test(s) &&
    !s.includes(': ') &&
    !s.includes(' #') &&
    !/[:#]$/.test(s) &&
    !/\s$/m.test(s) &&
    !s.includes('\n') &&
    !s.includes('\t')
  );
}

function dq(s) {
  return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n') + '"';
}

const scalar = (s) => (plainSafe(s) ? s : dq(s));

// Flow-style list for tags (`tags: [a, b]`): items are short bare words.
function flowItem(s) {
  return /^[\w\u4e00-\u9fff][\w\u4e00-\u9fff ·_.\/-]*$/.test(s) ? s : dq(s);
}
const flowList = (arr) => '[' + arr.map(flowItem).join(', ') + ']';

function sourceItem(kind, s) {
  if (kind === 'research' && /[()]/.test(s)) return dq(s);
  return scalar(s);
}

function sourcesBlock(kind, arr) {
  if (!arr || arr.length === 0) return 'sources: []';
  return 'sources:\n' + arr.map((s) => '  - ' + sourceItem(kind, s)).join('\n');
}

function toMarkdown(kind, e) {
  const fm = [];
  if (kind === 'academy') {
    fm.push(`title: ${dq(e.title)}`);
    fm.push(`summary: ${dq(e.summary)}`);
    if (e.order != null) fm.push(`order: ${e.order}`);
    fm.push(`source_material: ${dq(e.source_material)}`);
    fm.push(`pack_url: ${e.pack_url ? dq(e.pack_url) : "''"}`);
  } else {
    fm.push(`date: ${dq(e.date)}`);
    fm.push(`title: ${kind === 'research' ? dq(e.title) : scalar(e.title)}`);
    fm.push(`summary: ${kind === 'research' ? dq(e.summary) : scalar(e.summary)}`);
    if (kind === 'research') fm.push(`kind: ${e.kind}`);
    fm.push(`tags: ${flowList(e.tags)}`);
    fm.push(sourcesBlock(kind, e.sources));
  }
  const body = String(e.body ?? '').replace(/\n+$/, '') + '\n';
  return `---\n${fm.join('\n')}\n---\n\n${body}`;
}

// ── fetch ────────────────────────────────────────────────────────────────────

// Strapi v5 returns entry fields flat on the item (no attributes wrapper);
// v4-style { attributes } responses are flattened too, so either shape works.
function normalizeEntry(e) {
  if (!e || typeof e !== 'object' || !e.attributes || typeof e.attributes !== 'object') return e;
  return {
    ...e.attributes,
    id: e.id,
    documentId: e.documentId ?? e.attributes.documentId,
    locale: e.locale ?? e.attributes.locale,
    publishedAt: e.publishedAt ?? e.attributes.publishedAt,
  };
}

async function fetchPage(url, token) {
  let lastErr = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: AbortSignal.timeout(30_000),
      });
      const text = await res.text();
      if (!res.ok) {
        const hint = res.status === 401 ? '（401 未授权——检查 STRAPI_READ_TOKEN）' : '';
        throw new Error(`HTTP ${res.status}${hint}: ${text.slice(0, 200)}`);
      }
      return JSON.parse(text);
    } catch (err) {
      lastErr = err;
      if (attempt === 0) await new Promise((r) => setTimeout(r, 1500));
    }
  }
  throw lastErr;
}

async function fetchCollection(base, token, api) {
  const out = [];
  let page = 1;
  let pageCount = 1;
  do {
    // v5.58 实测：locale=all 返回 200 + 空 data（静默）；取全部 locale 必须 locale=*
    const url = `${base}/api/${api}?locale=*&pagination[pageSize]=${PAGE_SIZE}&pagination[page]=${page}`;
    const payload = await fetchPage(url, token);
    if (!payload || !Array.isArray(payload.data)) {
      throw new Error(`${api} 第 ${page} 页应答畸形：data 不是数组`);
    }
    out.push(...payload.data.map(normalizeEntry));
    const pc = Number(payload.meta?.pagination?.pageCount);
    pageCount = Number.isFinite(pc) && pc >= 1 ? Math.trunc(pc) : 1;
    page++;
    if (page > MAX_PAGES) throw new Error(`${api} 翻页超过 ${MAX_PAGES} 页，中止`);
  } while (page <= pageCount);
  return out;
}

async function loadFixtureDir(fixtureDir, api) {
  const p = join(fixtureDir, `${api}.json`);
  let payload;
  try {
    payload = JSON.parse(await readFile(p, 'utf8'));
  } catch (err) {
    throw new Error(`fixture ${p} 读取失败：${err.message}`);
  }
  if (!payload || !Array.isArray(payload.data)) {
    throw new Error(`fixture ${p} 应答畸形：data 不是数组`);
  }
  return payload.data.map(normalizeEntry);
}

// ── preflight (all fail-closed, nothing written until every check passes) ────

function entryName(e) {
  if (typeof e.slug === 'string' && e.slug) return `"${e.slug}"`;
  if (typeof e.title === 'string' && e.title) return `"${e.title}"`;
  return `(无 slug，documentId=${e.documentId ?? e.id ?? '未知'})`;
}

function validateStructure(kind, entries, label, violations) {
  for (const e of entries) {
    const where = `${label} 条目 ${entryName(e)}`;
    for (const f of STRING_FIELDS[kind]) {
      if (typeof e[f] !== 'string' || e[f] === '') {
        violations.push(`${where}：缺少必填字段 ${f}`);
      }
    }
    if (typeof e.locale === 'string' && e.locale !== '' && !LOCALES.includes(e.locale)) {
      violations.push(`${where}：locale "${e.locale}" 不在 ${LOCALES.join('/')} 内`);
    }
    if (typeof e.slug === 'string' && e.slug !== '' && !SLUG_RE.test(e.slug)) {
      violations.push(`${where}：slug "${e.slug}" 不是合法文件名（仅限字母数字 . _ -）`);
    }
    if (kind === 'briefings' || kind === 'research') {
      if (e.date != null && !DATE_RE.test(e.date)) {
        violations.push(`${where}：date "${e.date}" 不符合 YYYY-MM-DD`);
      }
      const tags = e.tags;
      if (!Array.isArray(tags)) {
        violations.push(`${where}：tags 必须是字符串数组`);
      } else if (tags.some((t) => typeof t !== 'string' || t === '')) {
        violations.push(`${where}：tags 含非字符串或空项`);
      }
    }
    if (kind === 'research' && e.kind != null && !KINDS.includes(e.kind)) {
      violations.push(`${where}：kind "${e.kind}" 不在 ${KINDS.join('/')} 内`);
    }
    if (e.sources != null) {
      if (!Array.isArray(e.sources)) violations.push(`${where}：sources 必须是字符串数组`);
      else if (e.sources.some((s) => typeof s !== 'string' || s === ''))
        violations.push(`${where}：sources 含非字符串或空项`);
    }
    if (kind === 'academy' && e.order != null && typeof e.order !== 'number') {
      violations.push(`${where}：order 必须是数字`);
    }
  }
}

// D4: group published entries by documentId — every group must carry both a
// zh and an en entry, with one shared slug across locales (otherwise the
// file-level twins gate would fail the build later with a worse message).
function validateTwins(entries, label, violations) {
  const groups = new Map();
  for (const e of entries) {
    const key = String(e.documentId ?? '');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(e);
  }
  for (const [docId, group] of groups) {
    const locales = new Set(group.map((e) => e.locale));
    for (const missing of LOCALES) {
      if (!locales.has(missing)) {
        const have = group.map((e) => entryName(e)).join('、');
        violations.push(`${label} ${have}（documentId=${docId}）：缺少 ${missing} 已发布条目`);
      }
    }
    const slugs = new Set(group.filter((e) => typeof e.slug === 'string').map((e) => e.slug));
    if (locales.has('zh') && locales.has('en') && slugs.size > 1) {
      violations.push(
        `${label} documentId=${docId}：zh/en 两个 locale 的 slug 不一致（${[...slugs].join(' vs ')}），双语文件无法成对`,
      );
    }
  }
  const seen = new Map(); // `${locale}/${slug}` → documentId
  for (const e of entries) {
    if (typeof e.slug !== 'string' || !LOCALES.includes(e.locale)) continue;
    const key = `${e.locale}/${e.slug}`;
    const docId = String(e.documentId ?? '');
    if (seen.has(key) && seen.get(key) !== docId) {
      violations.push(
        `${label} 条目 ${entryName(e)}：${e.locale}/${e.slug}.md 会覆盖另一个 documentId=${seen.get(key)} 的同名条目`,
      );
    } else {
      seen.set(key, docId);
    }
  }
}

async function countExistingMd() {
  let n = 0;
  for (const c of COLLECTIONS) {
    const dir = join(ROOT, 'src/content', c.dir);
    let stack = [dir];
    while (stack.length) {
      const d = stack.pop();
      const entries = await readdir(d, { withFileTypes: true }).catch(() => []);
      for (const ent of entries) {
        const p = join(d, ent.name);
        if (ent.isDirectory()) stack.push(p);
        else if (ent.name.endsWith('.md')) n++;
      }
    }
  }
  return n;
}

// ── write ────────────────────────────────────────────────────────────────────

async function writeAll(files) {
  // Astro data-store pitfall first (see header).
  await rm(join(ROOT, 'node_modules/.astro'), { recursive: true, force: true });

  // 1. Stage the complete new set under node_modules/.cache — a serialization
  //    or disk error here leaves src/content untouched.
  const staging = join(ROOT, 'node_modules/.cache/fd-strapi-fetch');
  await rm(staging, { recursive: true, force: true });
  for (const [rel, content] of files) {
    const p = join(staging, rel);
    await mkdir(dirname(p), { recursive: true });
    await writeFile(p, content);
  }

  // 2. Commit: rewrite every locale dir as the full pulled set, deleting
  //    committed files that are no longer published.
  const summary = [];
  for (const c of COLLECTIONS) {
    for (const locale of LOCALES) {
      const prefix = `src/content/${c.dir}/${locale}/`;
      const wanted = [...files.keys()].filter((rel) => rel.startsWith(prefix));
      const targetDir = join(ROOT, prefix);
      for (const rel of wanted) {
        await mkdir(dirname(join(ROOT, rel)), { recursive: true });
        await writeFile(join(ROOT, rel), files.get(rel));
      }
      let deleted = 0;
      const onDisk = await readdir(targetDir, { withFileTypes: true }).catch(() => []);
      const wantedNames = new Set(wanted.map((rel) => rel.slice(prefix.length)));
      for (const ent of onDisk) {
        if (ent.isFile() && ent.name.endsWith('.md') && !wantedNames.has(ent.name)) {
          await rm(join(targetDir, ent.name));
          deleted++;
        }
      }
      summary.push({ label: c.label, dir: c.dir, locale, written: wanted.length, deleted });
    }
  }

  // 3. Drop the staging area.
  await rm(staging, { recursive: true, force: true });
  return summary;
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const fi = args.indexOf('--fixture');
  const fixtureDir = fi >= 0 ? args[fi + 1] : null;
  if (fi >= 0 && !fixtureDir) {
    throw new Error('--fixture 需要一个目录参数（含 briefings/courses/research-articles.json）');
  }
  const base = (process.env.STRAPI_URL ?? '').replace(/\/+$/, '');
  const token = process.env.STRAPI_READ_TOKEN ?? '';

  if (!fixtureDir && !base) {
    console.log('STRAPI_URL 未设置，跳过拉取，使用仓内快照（本地开发模式）');
    process.exit(0);
  }

  // 1. Pull (or read fixtures).
  const pulled = {};
  if (fixtureDir) {
    console.log(`[strapi] fixture 模式：${fixtureDir}`);
    for (const c of COLLECTIONS) pulled[c.kind] = await loadFixtureDir(fixtureDir, c.api);
  } else {
    console.log(`[strapi] 在线拉取：${base}（briefings / courses / research-articles，仅已发布条目）`);
    for (const c of COLLECTIONS) pulled[c.kind] = await fetchCollection(base, token, c.api);
  }
  const total = Object.values(pulled).reduce((n, arr) => n + arr.length, 0);

  // 2. Preflight: structure → bilingual pairs → volume guard. Collect every
  //    violation, then fail closed.
  const violations = [];
  for (const c of COLLECTIONS) {
    validateStructure(c.kind, pulled[c.kind], c.label, violations);
    validateTwins(pulled[c.kind], c.label, violations);
  }
  const existing = await countExistingMd();
  if (total === 0) {
    violations.push('量级护栏：拉取结果为 0 条，拒绝写入（疑似应答畸形或服务异常）');
  } else if (total * 2 < existing) {
    violations.push(
      `量级护栏：本次拉到 ${total} 条，低于三集合现有 ${existing} 个 md 文件的 50%（${Math.ceil(existing / 2)} 条），拒绝写入（疑似应答畸形或半拉取）`,
    );
  }
  if (violations.length) {
    console.error(`[strapi] 预检未通过，共 ${violations.length} 条违例（fail-closed，未写入任何文件）：`);
    for (const v of violations) console.error(`  ✗ ${v}`);
    process.exit(1);
  }

  // 3. Serialize the full set, stage it, commit, print the summary.
  const files = new Map();
  for (const c of COLLECTIONS) {
    for (const e of pulled[c.kind]) {
      files.set(`src/content/${c.dir}/${e.locale}/${e.slug}.md`, toMarkdown(c.kind, e));
    }
  }
  const summary = await writeAll(files);

  const mode = fixtureDir ? 'fixture' : '在线';
  console.log(`[strapi] 写入完成（${mode} 模式，共 ${files.size} 个文件）：`);
  for (const s of summary) {
    console.log(`  ${s.dir.padEnd(10)} ${s.locale} 写入 ${s.written} / 删除 ${s.deleted}`);
  }
}

try {
  await main();
} catch (err) {
  console.error(`[strapi] 拉取失败（fail-closed，未改动任何内容文件）：${err.message}`);
  process.exit(1);
}
