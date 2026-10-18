import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

// One `docs` collection via the Content Layer API (Astro 6+).
// Locale is the leading path segment of the id (en/quickstart, zh/quickstart);
// doc pages filter by locale prefix.
const docs = defineCollection({
  loader: glob({ base: './src/content/docs', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    order: z.number().optional().default(100),
    description: z.string().optional(),
  }),
});

// `repos` — per-repo READMEs fetched at build time by scripts/fetch-repos.mjs.
// Written to src/content/repos/{name}.md (gitignored); regenerated each build
// so the site stays in sync with each repo's README on GitHub.
const repos = defineCollection({
  loader: glob({ base: './src/content/repos', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    repo: z.string(),
    url: z.string(),
    description: z.string().optional(),
    language: z.string().optional(),
    stars: z.number().optional(),
    updated: z.string().optional(),
    order: z.number().optional().default(100),
  }),
});

// The five product lines — one vocabulary shared by the apps schema, the
// products catalog tabs, and the homepage card wall (add-product-portal).
// Order is the magnitude ladder 一十百千万 (five-product-lines-rebrand); slugs
// are a public contract and must never be renamed.
export const PRODUCT_LINES = ['base', 'lex', 'wire', 'facet', 'constellation'] as const;

// The ladder characters behind the line marks (ui-refine D4 / ADR-0003):
// 壹 and 萬 write their numbers openly in formal script, 识/柏/谦 hide theirs
// in plain speech — 识/谦 in simplified forms matching the line names.
// Same order as PRODUCT_LINES; consumed by the LineMark component.
export const LADDER_CHARS = ['壹', '识', '柏', '谦', '萬'] as const;

// The plain numerals behind the ladder (一十百千万): rendered as low-contrast
// watermarks on the homepage rungs, so the scale reads at a glance without
// competing with the seal marks. Same order as PRODUCT_LINES.
export const LADDER_NUMERALS = ['一', '十', '百', '千', '万'] as const;

// `apps` — hand-written product/app pages for deployed apps that are not
// public GitHub repos (e.g. the legal line, hosted only in private Gitee
// mirrors). Committed, not fetched: renders with no network access. One file
// per app per locale, `<locale>/<slug>.md`; locale is the leading id segment
// (same convention as `docs`). `line` is required and must be one of the five
// product lines; slugs must never equal a line name (guarded in the products
// pages' getStaticPaths — a colliding slug would shadow a line tab page).
const apps = defineCollection({
  loader: glob({ base: './src/content/apps', pattern: '**/*.md' }),
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    kind: z.string().optional(),
    demoUrl: z.string().optional(),
    line: z.enum(PRODUCT_LINES),
    order: z.number().optional().default(100),
  }),
});

// `roadmap` — one md per development phase. Bilingual fields in a single file
// (goal_en/goal_zh etc.) so status/period stay single-source; progress updates
// are frontmatter-only edits.
const roadmap = defineCollection({
  loader: glob({ base: './src/content/roadmap', pattern: '**/*.md' }),
  schema: z.object({
    name: z.string(),
    pinyin: z.string(),
    period_en: z.string(),
    period_zh: z.string(),
    goal_en: z.string(),
    goal_zh: z.string(),
    status: z.enum(['in-progress', 'planned', 'done']),
    order: z.number(),
    items_en: z.array(z.string()).optional(),
    items_zh: z.array(z.string()).optional(),
  }),
});

// `flagship` — curated bilingual copy for the flagship product page
// (en.md / zh.md), hand-written narrative distinct from the raw README.
const flagship = defineCollection({
  loader: glob({ base: './src/content/flagship', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
  }),
});

// `releases` — customer-facing release notes, one paired file per issue per
// locale (`<locale>/<slug>.md`, slug = the issue's period end date YYYY-MM-DD,
// which sorts naturally). Committed hand-written content, like `apps`: the
// pages render with no network access. `lines` lists the product lines the
// issue covers (only lines with progress — see the release-notes spec); the
// body's `## <line label>` sections carry the narrative.
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const releases = defineCollection({
  loader: glob({ base: './src/content/releases', pattern: '**/*.md' }),
  schema: z.object({
    label: z.string(),
    period_start: z.string().regex(DATE, 'period_start must be YYYY-MM-DD'),
    period_end: z.string().regex(DATE, 'period_end must be YYYY-MM-DD'),
    headline: z.string(),
    lines: z.array(z.enum(PRODUCT_LINES)),
  }),
});

// ── Xingyan (星研) research line — xingyan-research-line ─────────────────────
// Three paired collections behind /research (学院 / 内参 / 研究). Same
// convention as `releases`: committed hand-written markdown, one file per
// entry per locale (`<locale>/<slug>.md`), twins enforced at load time by
// lib/xingyan.ts (a single-locale entry fails the build naming the slug).
// The five product lines above are untouched: Xingyan is a parallel research
// surface, not a sixth line tab.

// A source entry: either plain text (statement only, not clickable) or a
// labelled pointer to a publicly reachable location (xingyan-source-links: a
// page must not claim a full text is available without giving an address).
// Both forms coexist so the existing string-only entries need no rewrite.
const SOURCE_ITEM = z.union([
  z.string(),
  z.object({
    label: z.string(),
    url: z.string().url('source url must be absolute (https://…)'),
  }),
]);

// `briefings` — 内参: event-driven single entries (no issue numbers, no
// calendar promise). `sources` carries the traceable references behind the
// entry's claims (briefing-feed spec: every assertion must be traceable).
const briefings = defineCollection({
  loader: glob({ base: './src/content/briefings', pattern: '**/*.md' }),
  schema: z.object({
    date: z.string().regex(DATE, 'date must be YYYY-MM-DD'),
    title: z.string(),
    summary: z.string(),
    tags: z.array(z.string()),
    sources: z.array(SOURCE_ITEM).optional().default([]),
  }),
});

// `academy` — 学院: free web courses, each paired with a Facet-market pack
// (`pack_url`; empty string = pack not published yet). Canonical source is the
// web course (academy spec: single source, two carriers).
// 读者分层（yizuo-course-system）: `level` 标记课程受众——`use`（无技术能力
// 的普通用户）或 `build`（自建工作流的重度用户）；缺省 = 存量未回填（构建期
// 对 use 层正文跑语言判据，缺 level 不跑、只随 3.5 告警 updated 缺失）。
// `track` 预留轨分组（本 change 只加字段不启用）；`updated` 是课程自身更新
// 时间（长期项目的可信度信号，缺失告警不阻断）。
const academy = defineCollection({
  loader: glob({ base: './src/content/academy', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    order: z.number().optional().default(10),
    level: z.enum(['use', 'build']).optional(),
    track: z.string().optional().default(''),
    updated: z.string().regex(DATE, 'updated must be YYYY-MM-DD').optional(),
    source_material: z.string(),
    pack_url: z.string().optional().default(''),
  }),
});

// `research` — 研究: long-form pieces, `kind` distinguishes papers, case
// studies and notes. Served under /research/articles/<slug>.
const research = defineCollection({
  loader: glob({ base: './src/content/research', pattern: '**/*.md' }),
  schema: z.object({
    date: z.string().regex(DATE, 'date must be YYYY-MM-DD'),
    title: z.string(),
    summary: z.string(),
    kind: z.enum(['paper', 'casestudy', 'note']),
    tags: z.array(z.string()),
    sources: z.array(SOURCE_ITEM).optional().default([]),
  }),
});

// `updates` — 项目动态: editorial project updates authored in the CMS
// (official-web-surface-refresh). Field-paired, not locale-paired: one record
// carries both languages, so a single file sits at src/content/updates/<slug>.md
// and there is no twins gate — the four language fields are required instead.
// `line` drives the page filter; `kind` is the entry label.
const updates = defineCollection({
  loader: glob({ base: './src/content/updates', pattern: '*.md' }),
  schema: z.object({
    date: z.string().regex(DATE, 'date must be YYYY-MM-DD'),
    line: z.enum([...PRODUCT_LINES, 'xingyan']),
    kind: z.enum(['release', 'feature', 'fix', 'note']),
    title_zh: z.string(),
    title_en: z.string(),
    summary_zh: z.string(),
    summary_en: z.string(),
    version: z.string().optional().default(''),
    url: z.string().optional().default(''),
  }),
});

export const collections = {
  docs,
  repos,
  apps,
  roadmap,
  flagship,
  releases,
  briefings,
  academy,
  research,
  updates,
};

// Repo → product line (brand judgment, one source for /repos and /updates).
// A repo absent here renders in the "other" group / without a line mark —
// never dropped.
export const REPO_LINES: Record<string, string> = {
  platform: 'base',
  'law-bench': 'lex',
  'fd-open-data-mcp': 'wire',
  'fd-open-data-protocol': 'wire',
  'fd-cn-report': 'wire',
  'fd-industry-data': 'wire',
  'fd-cn-gov': 'wire',
  'scraw-fd-open-data-mcp': 'wire',
  'fd-daas-mcp': 'facet',
  'fd-vaas-skills': 'facet',
  'fd-vertical-packs': 'constellation',
};
