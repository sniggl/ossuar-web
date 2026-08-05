import type { APIRoute } from 'astro';
import { entries } from '../data/journal';
import { url as path } from '../paths';

const esc = (s: string) =>
  s.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c]!);

export const GET: APIRoute = ({ site }) => {
  const base = site!.href.replace(/\/$/, '');

  const items = entries
    .map((e) => {
      /* not escaped, and does not need to be: journal.ts rejects any slug that
         is not [a-z0-9-] at build time, so this can hold no XML metacharacter. */
      const url = base + path(`/journal/${e.slug}/`);
      return `    <item>
      <title>${esc(e.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(e.date).toUTCString()}</pubDate>
      <category>${esc(e.tag)}</category>
      <description>${esc(e.blurb)}</description>
    </item>`;
    })
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Ossuar — development journal</title>
    <link>${base}${path('/')}</link>
    <atom:link href="${base}${path('/rss.xml')}" rel="self" type="application/rss+xml" />
    <description>A top-down action RPG built in the open, from the first commit.</description>
    <language>en</language>
${items}
  </channel>
</rss>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
  );
};
