/**
 * Every internal URL on the site goes through here.
 *
 * GitHub Pages serves this repo from a subpath (`/ossuar-web`), so a bare
 * `/rss.xml` is a 404 and Astro does not rewrite paths in markup — only the
 * assets it bundles itself. `BASE_URL` comes from `base` in astro.config.mjs,
 * so that config option stays the single place the subpath is declared: moving
 * to a bare domain later is one line there and nothing here.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** A site-root-relative path (`/rss.xml`) → the path the browser must request. */
export const url = (path: string) => `${BASE}${path}`;
