/**
 * Every off-site channel. The masthead and the footer both print all of them —
 * which is the precise pair of files that had already drifted apart once before
 * they were extracted into components.
 *
 * `handle` is how the channel is written wherever it is named in prose, so a
 * rename is one edit here rather than a hunt through copy.
 */
export const discord = {
  /**
   * A permanent invite: the API reports `expires_at: null` and no use limit.
   * It can still be revoked server-side, so a dead link is a new invite here,
   * never a new server — the old one takes the members with it.
   */
  href: 'https://discord.gg/7TmmJvpAjT',
  handle: 'Discord',
} as const;

export const reddit = {
  href: 'https://www.reddit.com/r/Ossuar/',
  handle: 'r/Ossuar',
} as const;
