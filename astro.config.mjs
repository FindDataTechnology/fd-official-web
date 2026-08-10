// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // ponytail: site feeds canonical/sitemap URLs; final value is the post-HTTPS domain
  site: 'https://finddata.cn',
  i18n: {
    locales: ['en', 'zh'],
    defaultLocale: 'en',
  },
});
