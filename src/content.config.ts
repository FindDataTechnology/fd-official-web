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

export const collections = { docs, repos, apps, roadmap, flagship, releases };
