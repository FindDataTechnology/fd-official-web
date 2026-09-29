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
    // Old four-line tabs → the five-line structure (five-product-lines-rebrand):
    // data split into wire (MCP/ontology) + facet (DAAS), token folded into
    // constellation.
    '/products/data': '/products/wire',
    '/products/legal': '/products/lex',
    '/products/paas': '/products/base',
    '/products/token': '/products/constellation',
    '/zh/products/data': '/zh/products/wire',
    '/zh/products/legal': '/zh/products/lex',
    '/zh/products/paas': '/zh/products/base',
    '/zh/products/token': '/zh/products/constellation',
  },
});

