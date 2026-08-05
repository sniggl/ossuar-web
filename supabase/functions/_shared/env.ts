/**
 * Configuration, URLs and the redirect helper — everything that is not mail.
 *
 * Kept out of `mail.ts` because that module top-level-imports an SMTP client:
 * `confirm`, `unsubscribe` and `health` need `env` and `seeOther` and never send
 * anything, and there is no reason for them to pull denomailer into their graph
 * on every cold start.
 */
export const env = (key: string): string => {
  const value = Deno.env.get(key);
  if (!value) throw new Error(`missing env: ${key}`);
  return value;
};

/** The site's origin without a trailing slash, so `${site()}${LANDING.ok}` is safe. */
export const site = (): string => env('SITE_URL').replace(/\/+$/, '');

export const functionsUrl = (): string => `${env('SUPABASE_URL').replace(/\/+$/, '')}/functions/v1`;

/**
 * The one place the unsubscribe link is built. It goes into the visible line at
 * the bottom of a mail *and* into the RFC 8058 header, and two hand-built copies
 * of one URL diverge the day the route moves — the visible one being the copy
 * that, when broken, gets you reported as spam instead.
 */
export const unsubscribeUrl = (token: string): string =>
  `${functionsUrl()}/unsubscribe?t=${token}`;

/**
 * The contract between these functions and `src/pages/`. The functions cannot
 * import `src/paths.ts` across the Deno boundary, so the four routes are named
 * here once rather than typed at eight call sites with drifting slashes.
 */
export const LANDING = {
  pending: '/subscribed/',
  confirmed: '/confirmed/',
  unsubscribed: '/unsubscribed/',
  unknown: '/404',
} as const;

/** 303 so the browser turns a form POST into a GET of the landing page. */
export const seeOther = (path: string): Response =>
  new Response(null, { status: 303, headers: { Location: `${site()}${path}` } });

/**
 * Consent evidence is a pair — the address that signed up and the one that
 * confirmed — so both sides have to read the header the same way. Two copies of
 * this expression would record two different things the day a proxy changes.
 */
export const clientIp = (req: Request): string | null =>
  (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || null;
