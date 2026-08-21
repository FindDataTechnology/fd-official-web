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

export const collections = { docs, repos, roadmap, flagship };
