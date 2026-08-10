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

export const collections = { docs, repos };
