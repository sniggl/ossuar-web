/**
 * Every internal URL on the site goes through here.
 *
 * The site now serves from a domain root, so `base` is unset and this is an
 * identity function — kept, not inlined, because Astro does not rewrite paths
 * in markup (only the assets it bundles itself). Should the site ever move back
 * under a subpath, setting `base` in astro.config.mjs is the whole change;
 * without this indirection it would be a hand-edit of every internal link.
 */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** A site-root-relative path (`/rss.xml`) → the path the browser must request. */
export const url = (path: string) => `${BASE}${path}`;
