// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // ponytail: site feeds canonical/sitemap URLs; live post-HTTPS domain (cutover 2026-08-21)
  site: 'https://www.finddatatech.cloud',
  i18n: {
    locales: ['en', 'zh'],
    defaultLocale: 'en',
  },
  // Legacy catalog URLs → /products. The dynamic /apps/[slug] redirects live
  // as meta-refresh stub pages under src/pages/apps/[slug].astro instead:
  // this Astro version's config redirects take no `paths` for static output.
  redirects: {
    '/apps': '/products',
    '/zh/apps': '/zh/products',
  },
});

