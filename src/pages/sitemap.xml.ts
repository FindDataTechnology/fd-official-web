import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { slugOf } from '../lib/xingyan';

// sitemap.xml — built from the same collections the pages render from, so a new
// entry appears here in the same build it appears on the site. The Xingyan three
// zones are covered in both languages (the spec requires every zone's pages in
// both locales); the remaining static routes are listed once per locale.
const SITE = 'https://www.finddatatech.cloud';

const STATIC = [
  '',
  'products',
  'research',
  'updates',
  'demo',
  'data',
  'indicators',
  'showcase',
  'repos',
  'docs',
  'roadmap',
  'releases',
  'crm',
];

const ZONES: Record<string, string> = {
  briefings: 'briefings',
  academy: 'academy',
  research: 'articles',
};

export const GET: APIRoute = async () => {
  const urls: { loc: string; lastmod?: string }[] = [];

  for (const p of STATIC) {
    urls.push({ loc: `${SITE}/${p}`.replace(/\/$/, '/') });
    if (p) urls.push({ loc: `${SITE}/zh/${p}` });
    else urls.push({ loc: `${SITE}/zh/` });
  }

  const collections = ['briefings', 'academy', 'research'] as const;
  for (const collection of collections) {
    const entries = await getCollection(collection);
    for (const entry of entries) {
      const [locale, ...rest] = entry.id.split('/');
      const slug = rest.join('/').replace(/\.md$/, '') || slugOf(entry);
      const zone = ZONES[collection];
      const prefix = locale === 'zh' ? '/zh' : '';
      const lastmod = (entry.data as Record<string, unknown>).updated ?? (entry.data as Record<string, unknown>).date;
      urls.push({
        loc: `${SITE}${prefix}/research/${zone}/${slug}`,
        lastmod: typeof lastmod === 'string' ? lastmod : undefined,
      });
    }
  }

  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls
      .map(
        ({ loc, lastmod }) =>
          `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`,
      )
      .join('\n') +
    '\n</urlset>\n';

  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
