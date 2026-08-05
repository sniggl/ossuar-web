/**
 * Hands the journal to the mailer after a deploy.
 *
 * It sends the whole list every time and lets the `dispatch` function decide
 * what is new — the workflow holds no state, so a re-run, a revert or a manual
 * dispatch can never double-send. Same reason the site derives every other
 * count: nothing here is remembered by hand.
 *
 * Run by .github/workflows/deploy.yml. Without the secrets it prints why and
 * exits 0, because a repo without them is a repo that has not set the
 * newsletter up yet — not a broken deploy.
 */
import { entries } from '../src/data/journal';

/* Declared rather than installed: `@types/node` would be a dependency the site
   does not otherwise have, for the two globals one build script uses. */
declare const process: {
  env: Record<string, string | undefined>;
  exit(code: number): never;
};

const url = process.env.DISPATCH_URL;
const secret = process.env.DISPATCH_SECRET;

if (!url || !secret) {
  console.log('notify: DISPATCH_URL or DISPATCH_SECRET is unset — skipping the mail step.');
  process.exit(0);
}

const payload = entries.map(({ slug, title, blurb, date }) => ({ slug, title, blurb, date }));

const response = await fetch(url, {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'x-dispatch-secret': secret },
  body: JSON.stringify({ entries: payload }),
});

const text = await response.text();

if (!response.ok) {
  console.error(`notify: dispatch answered ${response.status}: ${text}`);
  process.exit(1);
}

console.log(`notify: ${text}`);
