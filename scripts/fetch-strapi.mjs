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
// `updates` dimensions (official-web-surface-refresh). `xingyan` joins the five
// product lines so a research-line update can be filed without a sixth tab.
const UPDATE_LINES = ['base', 'lex', 'wire', 'facet', 'constellation', 'xingyan'];
const UPDATE_KINDS = ['release', 'feature', 'fix', 'note'];

// ── collection registry ──────────────────────────────────────────────────────
// One row per CMS content type. Adding a type = adding a row (plus a serializer
// when its frontmatter shape is not the default) — no other file changes.
//
//   api       Strapi content-type API endpoint
//   dir       target directory under src/content/
//   kind      serializer/validator key
//   label     human label for logs and violations
//   twin      'locale' — one entry per locale under <dir>/<locale>/<slug>.md,
//                        documentId pairs enforced (twins gate)
//             'fields' — one entry per record at <dir>/<slug>.md carrying both
//                        languages as separate fields (roadmap precedent)
//   required  non-empty string fields (zod-required plus documentId/slug/locale)
//   optional  non-string or nullable fields this type may carry
//   serialize (e) => markdown; defaults to serializeDefault
//   validate  (e, where, violations) => void; type-specific rules beyond the
//             generic required/locale/slug checks
const COLLECTIONS = [
  {
    api: 'briefings',
    dir: 'briefings',
    kind: 'briefings',
    label: '内参 briefings',
    twin: 'locale',
    required: ['documentId', 'slug', 'locale', 'title', 'body', 'date', 'summary'],
    optional: [],
    serialize: (e) => serializeFeed('briefings', e),
    validate: validateFeedFields,
  },
  {
    api: 'courses',
    dir: 'academy',
    kind: 'academy',
    label: '学院 academy',
    twin: 'locale',
    required: ['documentId', 'slug', 'locale', 'title', 'body', 'summary', 'source_material'],
    // yizuo-course-system: level（use|build 读者分层）/ track（轨，预留）/
    // updated（YYYY-MM-DD，课程更新时间）——CMS 侧均可空，空值不出 front-matter。
    optional: ['level', 'track', 'updated'],
    serialize: serializeAcademy,
    validate: (e, where, violations) => {
      if (e.order != null && typeof e.order !== 'number') {
        violations.push(`${where}：order 必须是数字`);
      }
    },
  },
  {
    api: 'research-articles',
    dir: 'research',
    kind: 'research',
    label: '研究 research',
    twin: 'locale',
    required: ['documentId', 'slug', 'locale', 'title', 'body', 'date', 'summary', 'kind'],
    optional: [],
    serialize: (e) => serializeFeed('research', e),
    validate: (e, where, violations) => {
      validateFeedFields(e, where, violations);
      if (e.kind != null && !KINDS.includes(e.kind)) {
        violations.push(`${where}：kind "${e.kind}" 不在 ${KINDS.join('/')} 内`);
      }
    },
  },
  {
    // official-web-surface-refresh: 项目动态. Field-paired — one record carries
    // both languages, so there is no locale split and no twins gate; the four
    // language fields are required instead. Strapi's i18n is off for this type.
    api: 'updates',
    dir: 'updates',
    kind: 'updates',
    label: '项目动态 updates',
    twin: 'fields',
    required: ['documentId', 'slug', 'title_zh', 'title_en', 'summary_zh', 'summary_en'],
    optional: ['date', 'line', 'kind', 'version', 'url'],
    serialize: serializeUpdate,
    validate: (e, where, violations) => {
      if (e.date == null || !DATE_RE.test(e.date)) {
        violations.push(`${where}：date "${e.date}" 不符合 YYYY-MM-DD`);
      }
      if (!UPDATE_LINES.includes(e.line)) {
        violations.push(`${where}：line "${e.line}" 不在 ${UPDATE_LINES.join('/')} 内`);
      }
      if (!UPDATE_KINDS.includes(e.kind)) {
        violations.push(`${where}：kind "${e.kind}" 不在 ${UPDATE_KINDS.join('/')} 内`);
      }
    },
  },
];

// ── frontmatter serialization ────────────────────────────────────────────────
// Hand-rolled on purpose (no new dependencies — the field set is closed), and
// frozen against the committed files: per-collection quoting profiles that
// `--fixture scripts/fixtures/strapi` must reproduce byte for byte.
//   briefings: minimal quoting — plain unless YAML forces quotes (values with
//              ": " etc.); committed style.
//   academy:   title / summary / source_material always double-quoted,
//              pack_url '' (empty) or double-quoted, order bare; level bare
//              (use|build) / track double-quoted / updated double-quoted
//              YYYY-MM-DD (unquoted rides the YAML timestamp schema → Date) —
//              each emitted only when present (yizuo-course-system 读者分层).
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

// Shared tail: body with trailing newlines normalized to exactly one.
const bodyOf = (e) => String(e.body ?? '').replace(/\n+$/, '') + '\n';
const md = (fm, body) => `---\n${fm.join('\n')}\n---\n\n${body}`;

// `academy` frontmatter: title/summary/source_material always double-quoted,
// pack_url '' or quoted, order bare; level bare (use|build) / track quoted /
// updated quoted YYYY-MM-DD (an unquoted date rides the YAML timestamp schema
// and arrives at zod as a Date object) — each emitted only when present.
function serializeAcademy(e) {
  const fm = [`title: ${dq(e.title)}`, `summary: ${dq(e.summary)}`];
  if (e.order != null) fm.push(`order: ${e.order}`);
  if (e.level != null && e.level !== '') fm.push(`level: ${e.level}`);
  if (e.track != null && e.track !== '') fm.push(`track: ${dq(e.track)}`);
  if (e.updated != null && e.updated !== '') fm.push(`updated: ${dq(e.updated)}`);
  fm.push(`source_material: ${dq(e.source_material)}`);
  fm.push(`pack_url: ${e.pack_url ? dq(e.pack_url) : "''"}`);
  return md(fm, bodyOf(e));
}

// Dated feed types (briefings / research). `research` double-quotes title and
// summary and quotes source items carrying ASCII parens (the committed en
// sources annotate the Chinese original in parens); briefings stay minimal.
function serializeFeed(kind, e) {
  const quote = (s) => (kind === 'research' ? dq(s) : scalar(s));
  const fm = [`date: ${dq(e.date)}`, `title: ${quote(e.title)}`, `summary: ${quote(e.summary)}`];
  if (kind === 'research') fm.push(`kind: ${e.kind}`);
  fm.push(`tags: ${flowList(e.tags)}`);
  fm.push(sourcesBlock(kind, e.sources));
  return md(fm, bodyOf(e));
}

// Default serializer used when a registry row omits `serialize`.
const serializeDefault = (e) => serializeFeed('briefings', e);

// `updates` — field-paired frontmatter. Every language field is quoted (they
// are prose), `date` is quoted (bare dates become Date objects in YAML), the
// dimensions are bare enumerations, and version/url are emitted only when set.
function serializeUpdate(e) {
  const fm = [
    `date: ${dq(e.date)}`,
    `line: ${e.line}`,
    `kind: ${e.kind}`,
    `title_zh: ${dq(e.title_zh)}`,
    `title_en: ${dq(e.title_en)}`,
    `summary_zh: ${dq(e.summary_zh)}`,
    `summary_en: ${dq(e.summary_en)}`,
  ];
  if (e.version != null && e.version !== '') fm.push(`version: ${dq(e.version)}`);
  if (e.url != null && e.url !== '') fm.push(`url: ${dq(e.url)}`);
  return md(fm, bodyOf(e));
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

function validateStructure(row, entries, violations) {
  const { label } = row;
  for (const e of entries) {
    const where = `${label} 条目 ${entryName(e)}`;
    for (const f of row.required) {
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
    if (e.sources != null) {
      if (!Array.isArray(e.sources)) violations.push(`${where}：sources 必须是字符串数组`);
      else if (e.sources.some((s) => typeof s !== 'string' || s === ''))
        violations.push(`${where}：sources 含非字符串或空项`);
    }
    // Type-specific rules (date/tags/kind/order/…), declared on the registry row.
    row.validate?.(e, where, violations);
  }
}

// Shared rules for the dated feed types: date format + tags shape.
function validateFeedFields(e, where, violations) {
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

// D4: group published entries by documentId — every group must carry both a
// zh and an en entry, with one shared slug across locales (otherwise the
// file-level twins gate would fail the build later with a worse message).
// `twin: 'fields'` types carry both languages on one record: there are no
// pairs to check, only the per-locale file-collision guard below.
function validateTwins(row, entries, violations) {
  const { label } = row;
  if (row.twin === 'fields') {
    validateSlugCollisions(entries, label, violations);
    return;
  }
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
  validateSlugCollisions(entries, label, violations);
}

// Two records writing the same `<locale>/<slug>.md` silently overwrite one
// another — always a violation, for both twin strategies.
function validateSlugCollisions(entries, label, violations) {
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

// Path for one entry under its collection row: paired types nest by locale,
// field-paired types are flat (`<dir>/<slug>.md`, the roadmap precedent).
const relPath = (row, e) =>
  row.twin === 'fields'
    ? `src/content/${row.dir}/${e.slug}.md`
    : `src/content/${row.dir}/${e.locale}/${e.slug}.md`;

// The directory holding one row's files (all of them, for field-paired types).
const rowDirs = (row) =>
  row.twin === 'fields' ? [``] : LOCALES.map((l) => `${l}/`);

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

  // 2. Commit: rewrite every target dir as the full pulled set, deleting
  //    committed files that are no longer published.
  const summary = [];
  for (const c of COLLECTIONS) {
    for (const locale of rowDirs(c)) {
      const prefix = `src/content/${c.dir}/${locale}`;
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
      summary.push({ label: c.label, dir: c.dir, locale: locale || '—', written: wanted.length, deleted });
    }
  }

  // 3. Drop the staging area.
  await rm(staging, { recursive: true, force: true });
  return summary;
}

// ── self-test (registry strategies) ──────────────────────────────────────────
// Exercises both twin strategies against fixed cases, so the registry's
// validation path is proven before any type that uses it ships. Run with
// `node scripts/fetch-strapi.mjs --self-test`; no network, no writes.
function selfTest() {
  const paired = COLLECTIONS.find((c) => c.twin === 'locale');
  // A synthetic field-paired row: same code path `updates` will take.
  const fields = {
    api: 'fields-probe',
    dir: 'fields-probe',
    kind: 'fields-probe',
    label: '自测 fields',
    twin: 'fields',
    required: ['documentId', 'slug', 'locale', 'title_zh', 'title_en'],
    optional: ['date'],
    validate: (e, where, violations) => {
      if (e.date != null && !DATE_RE.test(e.date)) {
        violations.push(`${where}：date "${e.date}" 不符合 YYYY-MM-DD`);
      }
    },
  };
  // Field-paired entries carry both languages on one record.
  const entry = (over = {}) => ({
    documentId: 'doc1',
    slug: 'one',
    locale: 'zh',
    title_zh: '标题',
    title_en: 'Title',
    ...over,
  });
  // Paired entries must satisfy the paired row's full required set (the
  // briefings set today: title/body/date/summary/tags/…).
  const pairedEntry = (over = {}) => ({
    documentId: 'doc1',
    slug: 'one',
    locale: 'zh',
    title: '标题',
    body: '正文',
    date: '2026-10-17',
    summary: '摘要',
    tags: ['产品'],
    sources: [],
    ...over,
  });

  const cases = [
    // —— locale-paired strategy ——
    ['paired: 双语成对通过', paired, [pairedEntry({ locale: 'zh' }), pairedEntry({ locale: 'en' })], 0],
    ['paired: 缺 en 被点名', paired, [pairedEntry({ locale: 'zh' })], 1],
    ['paired: 必填缺失被点名', paired, [pairedEntry({ locale: 'zh', title: '' }), pairedEntry({ locale: 'en' })], 1],
    // —— field-paired strategy ——
    ['fields: 单条双语通过', fields, [entry()], 0],
    ['fields: 缺 en 字段被点名', fields, [entry({ title_en: '' })], 1],
    ['fields: 日期格式非法被点名', fields, [entry({ date: '2026/10/17' })], 1],
    // —— shared slug-collision guard (both strategies) ——
    ['fields: 同 slug 冲突被点名', fields, [entry(), entry({ documentId: 'doc2' })], 1],
    [
      'paired: 同 locale 同 slug 冲突被点名',
      paired,
      // Both documents are complete pairs, so the pairing rule is satisfied
      // and the only violations left are the two file collisions (zh/one.md
      // and en/one.md each claimed by both documents) — one per locale.
      [
        pairedEntry({ locale: 'zh', documentId: 'doc1' }),
        pairedEntry({ locale: 'en', documentId: 'doc1' }),
        pairedEntry({ locale: 'zh', documentId: 'doc2' }),
        pairedEntry({ locale: 'en', documentId: 'doc2' }),
      ],
      2,
    ],
  ];

  let ok = true;
  for (const [id, row, entries, expected] of cases) {
    const violations = [];
    validateStructure(row, entries, violations);
    validateTwins(row, entries, violations);
    const pass = violations.length === expected;
    ok = ok && pass;
    console.log(
      `  ${pass ? 'ok  ' : 'FAIL'} ${id}${pass ? '' : ` — 期望 ${expected} 条违例，实得 ${violations.length}: ${JSON.stringify(violations)}`}`,
    );
  }
  // Path shape per strategy.
  const pairedPath = relPath(paired, { locale: 'zh', slug: 'x' });
  const fieldsPath = relPath(fields, { locale: 'zh', slug: 'x' });
  const pathsOk = pairedPath === 'src/content/briefings/zh/x.md' && fieldsPath === 'src/content/fields-probe/x.md';
  ok = ok && pathsOk;
  console.log(`  ${pathsOk ? 'ok  ' : 'FAIL'} 路径形状（paired 按 locale 分目录 / fields 平铺）`);

  process.exit(ok ? 0 : 1);
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--self-test')) selfTest();
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
    validateStructure(c, pulled[c.kind], violations);
    validateTwins(c, pulled[c.kind], violations);
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
    const serialize = c.serialize ?? serializeDefault;
    for (const e of pulled[c.kind]) {
      files.set(relPath(c, e), serialize(e));
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
