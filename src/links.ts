/**
 * Every off-site channel, and the one endpoint the site posts to. The masthead,
 * the follow band and the footer all print these — which is the exact set of
 * files that had already drifted apart once before they were extracted.
 *
 * `handle` is how the channel is written wherever it is named in prose, so a
 * rename or a new invite is one edit here rather than a hunt through copy.
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

export const twitch = {
  href: 'https://www.twitch.tv/sniggl',
  handle: 'Twitch',
} as const;

export const reddit = {
  href: 'https://www.reddit.com/r/Ossuar/',
  handle: 'r/Ossuar',
} as const;

/**
 * The signup form posts straight to a Supabase Edge Function, because a static
 * site has nothing of its own to post to. The function is deployed with
 * `verify_jwt = false` so a plain HTML form — no key, no JavaScript — can reach
 * it, and it answers with a 303 back to `/subscribed`.
 *
 * Its own address is the only Supabase detail the site knows: the list, the
 * confirmation mail and the send loop all live on the other side of it.
 */
export const newsletter = {
  action: 'https://gxgsvusfefheybvlsllf.supabase.co/functions/v1/subscribe',
} as const;
