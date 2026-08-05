/**
 * Every off-site channel. There is exactly one, and both the masthead and the
 * footer print it — which is the precise pair of files that had already drifted
 * apart once before they were extracted into components.
 *
 * `handle` is how the community is written wherever it is named in prose, so a
 * rename is one edit here rather than a hunt through copy.
 */
export const reddit = {
  href: 'https://www.reddit.com/r/Ossuar/',
  handle: 'r/Ossuar',
} as const;
