import type { APIRoute } from 'astro';
import { entries } from '../data/journal';
import { url } from '../paths';

/** Hand-rolled rather than a plugin: two route shapes do not need a dependency. */
export const GET: APIRoute = ({ site }) => {
  const base = site!.href.replace(/\/$/, '');
  /* <loc> is unescaped, and safe: journal.ts rejects any slug outside [a-z0-9-]. */
  const urls = ['/', ...entries.map((e) => `/journal/${e.slug}/`)].map(url);

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${base}${u}</loc></url>`).join('\n')}
</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
  );
};
