import type { APIRoute } from 'astro';
import { url } from '../paths';

/**
 * Honoured now that the site serves from a domain root. /og-card is also kept
 * out of the index by its own `noindex` meta, which does not depend on this.
 */
export const GET: APIRoute = ({ site }) => {
  const base = site!.href.replace(/\/$/, '');
  return new Response(
    `User-agent: *\nAllow: ${url('/')}\nDisallow: ${url('/og-card')}\n\nSitemap: ${base}${url('/sitemap.xml')}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
  );
};
