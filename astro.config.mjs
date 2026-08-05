import { defineConfig } from 'astro/config';

export default defineConfig({
  /**
   * GitHub Pages serves a project repo from `<user>.github.io/<repo>`, so the
   * site lives at a subpath. `base` is the only place that subpath is declared
   * — `src/paths.ts` reads it back out, and every internal link, asset and
   * canonical goes through there. When ossuar.dev is pointed at Pages: set
   * `site` to the domain, drop `base`, add a CNAME. Nothing else changes.
   */
  site: 'https://sniggl.github.io',
  base: '/ossuar-web',
  build: { inlineStylesheets: 'auto' },
});
