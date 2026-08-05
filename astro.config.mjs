import { defineConfig } from 'astro/config';

export default defineConfig({
  /**
   * The site is served from the root of its own domain, so no `base` is set and
   * `src/paths.ts` reads back `/`. `site` is the only place the origin is
   * declared — every canonical, sitemap `<loc>`, RSS link and `og:url` derives
   * from it. Moving to another domain is this one line; the subpath machinery
   * in `paths.ts` stays, so moving back under a `/<repo>` prefix is one line
   * too. The workflow deploy ignores any CNAME file: the custom domain lives in
   * the repo's Pages settings, and changing `site` here does not move it.
   */
  site: 'https://ossuar.braend.io',
  build: { inlineStylesheets: 'auto' },
});
