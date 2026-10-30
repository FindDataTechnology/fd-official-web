import type { APIRoute } from 'astro';
import { buildAcademyFeed } from '../lib/xingyan';

// Static build-time feed of the Xingyan (星研) academy courses — slug, level,
// order, both locales' title / summary / sources / claim skeleton / body, and
// the rendered page URLs. Same collection, same twins gate, one build: machine
// consumers (own agents, customer agents, answer engines) resolve claims and
// page addresses here instead of scraping HTML. No route params, so Astro runs
// GET once at build time.
export const GET: APIRoute = async () =>
  new Response(JSON.stringify(await buildAcademyFeed(), null, 2) + '\n', {
    headers: { 'Content-Type': 'application/json' },
  });
