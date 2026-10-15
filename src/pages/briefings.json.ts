import type { APIRoute } from 'astro';
import { buildBriefingsFeed } from '../lib/xingyan';

// Static build-time feed of the Xingyan (星研) briefings (内参) — slug, date,
// tags, both locales' title / summary / sources / body, and the rendered page
// URLs. Same collection (and same bilingual twins gate) as the pages, one
// build: the distribution pipeline consumes this instead of scraping HTML,
// exactly as it does for /releases.json. No route params, so Astro runs GET
// once at build time.
export const GET: APIRoute = async () =>
  new Response(JSON.stringify(await buildBriefingsFeed(), null, 2) + '\n', {
    headers: { 'Content-Type': 'application/json' },
  });
