import type { APIRoute } from 'astro';
import { buildReleaseFeed } from '../lib/releases';

// Static build-time feed of the release issues (label, period, headline,
// per-line summaries, coverage delta) — what the sales one-pager and the
// social distribution pipeline consume instead of scraping HTML. Same
// collection + committed snapshots as the rendered pages, one build.
// No route params, so Astro runs GET once at build time.
export const GET: APIRoute = async () =>
  new Response(JSON.stringify(await buildReleaseFeed(), null, 2) + '\n', {
    headers: { 'Content-Type': 'application/json' },
  });
