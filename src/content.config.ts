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

export const collections = { docs };
