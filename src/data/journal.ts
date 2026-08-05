/**
 * The journal. One source of truth for the index, the entry pages, the feed
 * and the sitemap.
 *
 * Posts go here when there is something worth showing — a feature, a fight, a
 * thing that now moves. Not a changelog, not a commit log.
 */

export type Block =
  | { kind: 'p'; text: string }
  | {
      kind: 'figure';
      src: string;
      alt: string;
      caption: string;
      /** The file's real pixel size. The page reserves the box from it, so
          nothing below the image jumps when it decodes. */
      width: number;
      height: number;
      pixelated?: boolean;
    }
  | { kind: 'strip'; caption: string; images: { src: string; alt: string; name: string }[] }
  | { kind: 'aside'; heading: string; text: string };

/** Which of the four glasses this pane is cut from. The hex lives in tokens.ts. */
export type Tint = 'indigo' | 'green' | 'rust' | 'amber';

export interface Entry {
  /** URL-safe, lowercase. Goes into the feed and the sitemap unescaped. */
  slug: string;
  /** `YYYY-MM-DD`. Read as UTC everywhere it is rendered. */
  date: string;
  title: string;
  /** One sentence. Card, feed and page description all read this. */
  blurb: string;
  /** Short label — what part of the game this is about. */
  tag: string;
  tint: Tint;
  body: Block[];
}

/** Write them in whatever order suits. `entries` below is what everything reads. */
const posts: Entry[] = [];

/**
 * Two things JavaScript will not fail on, so the build does instead:
 * `04-08-2026` for 4 August parses silently as 8 April, and a slug carrying an
 * `&` makes rss.xml and sitemap.xml unparseable rather than merely wrong.
 */
for (const p of posts) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date))
    throw new Error(`journal: "${p.slug}" needs a YYYY-MM-DD date, got "${p.date}"`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug))
    throw new Error(`journal: "${p.slug}" is not a URL-safe slug`);
}

/**
 * Newest first — the order the index, the feed, the 404 links and the onward
 * link on an entry all read. Sorted here so adding a post is only ever writing
 * one, never remembering where in the array it goes.
 */
export const entries: Entry[] = [...posts].sort((a, b) => b.date.localeCompare(a.date));

export const bySlug = (slug: string) => entries.find((e) => e.slug === slug);
