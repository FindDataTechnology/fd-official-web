import type { APIRoute } from 'astro';
import { buildResearchFeed } from '../lib/xingyan';

// Static build-time feed of the Xingyan (星研) research pieces — slug, kind,
// date, both locales' title / summary / sources / claim skeleton / body, and
// the rendered page URLs. Same collection, same twins gate, one build: the
// machine consumers read claim skeletons here rather than parsing prose. No
// route params, so Astro runs GET once at build time.
export const GET: APIRoute = async () =>
  new Response(JSON.stringify(await buildResearchFeed(), null, 2) + '\n', {
    headers: { 'Content-Type': 'application/json' },
  });
