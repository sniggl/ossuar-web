/**
 * Every off-site channel, and the one endpoint the site posts to.
 *
 * `channels` is the list every consumer maps — the masthead, the follow band
 * and the mail landings. They each used to enumerate the same three by hand,
 * which is the mistake this file exists to prevent: adding one is a line here,
 * not four edits in files nobody remembers to open.
 *
 * `handle` is how the channel is written in prose, `label` the shorter name the
 * nav uses — "Reddit" is a place in a menu, `r/Ossuar` is a community in a
 * sentence — and `note` the one line the follow band prints beside it.
 */
const discord = {
  /**
   * A permanent invite: the API reports `expires_at: null` and no use limit.
   * It can still be revoked server-side, so a dead link is a new invite here,
   * never a new server — the old one takes the members with it.
   */
  href: 'https://discord.gg/7TmmJvpAjT',
  handle: 'Discord',
  label: 'Discord',
  note: 'the room where I build it',
} as const;

const twitch = {
  href: 'https://www.twitch.tv/sniggl',
  handle: 'Twitch',
  label: 'Twitch',
  note: 'sometimes I build it live',
} as const;

const reddit = {
  href: 'https://www.reddit.com/r/Ossuar/',
  handle: 'r/Ossuar',
  label: 'Reddit',
  note: 'posts, questions, arguments',
} as const;

export const channels = [discord, twitch, reddit] as const;

/**
 * The feed is a channel too, and it is printed in both the follow band and the
 * foot of every journal entry. The `href` is an internal path, so a consumer
 * wraps it in `url()` the way it wraps every other internal link — that is the
 * only reason it is not simply part of `channels`.
 */
export const feed = { href: '/rss.xml', handle: 'RSS', note: 'the raw feed, no middleman' } as const;

/** The Supabase project behind the list. Stated once; the workflows read it from a secret. */
const functionsBase = 'https://gxgsvusfefheybvlsllf.supabase.co/functions/v1';

/**
 * `live` is false until Ossuar has its own domain. Collecting addresses against
 * a temporary one means migrating every subscriber days later, and the first
 * thing they would get is a "we moved" mail — so the band shows the slot and
 * says so, and the hero reads the same flag rather than promising mail the site
 * refuses to take.
 *
 * Turning it on is this constant plus the secrets on the `subscribe` function.
 * The form, the endpoints, the tables and the landing pages are all shipped.
 *
 * The form posts straight to that function, because a static site has nothing
 * of its own to post to. It is deployed with `verify_jwt = false` so plain HTML
 * — no key, no JavaScript — can reach it, and it answers with a 303.
 */
export const newsletter = {
  live: false,
  action: `${functionsBase}/subscribe`,
} as const;
