import type { APIRoute } from 'astro';
import { url } from '../paths';

/**
 * Only honoured at a domain root, so while the site lives at
 * <user>.github.io/ossuar-web this file is decoration — /og-card is kept out of
 * the index by its own `noindex` meta, which does not depend on it.
 */
export const GET: APIRoute = ({ site }) => {
  const base = site!.href.replace(/\/$/, '');
  return new Response(
    `User-agent: *\nAllow: ${url('/')}\nDisallow: ${url('/og-card')}\n\nSitemap: ${base}${url('/sitemap.xml')}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
  );
};
