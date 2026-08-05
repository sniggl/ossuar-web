/**
 * Sends journal entries that have not gone out yet.
 *
 * Called by the deploy workflow after every push, with the whole journal in the
 * body — the workflow does not track what is new, this does. `sends` is the
 * ledger: an entry recorded there is never mailed again, so re-running a deploy,
 * or ten of them, sends nothing twice.
 *
 * Authentication is a shared secret in a header, not a JWT, because the caller
 * is a GitHub Action rather than a signed-in user.
 */
import { db } from '../_shared/db.ts';
import { site, unsubscribeUrl } from '../_shared/env.ts';
import { openMailer, sendVia, unsubscribeHeaders } from '../_shared/mail.ts';

interface Entry {
  slug: string;
  title: string;
  blurb: string;
  date: string;
}

interface Recipient {
  email: string;
  token: string;
}

/**
 * The sender is somebody's mailbox, and a mailbox has a daily quota that other
 * things may be relying on. So: never more than this many recipients in a run,
 * and never faster than one every half second.
 *
 * Past the ceiling it refuses the entry outright rather than mailing half the
 * list — a half-sent entry is unrecoverable, since the ledger records slugs, not
 * addresses. Reaching it means the list has outgrown mailbox SMTP, which is a
 * decision to make, not something a cron should quietly paper over.
 */
const MAX_RECIPIENTS = 100;
const PACE_MS = 500;

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const body = (entry: Entry, token: string, origin: string) =>
  [
    entry.blurb,
    '',
    `Read it: ${origin}/journal/${entry.slug}/`,
    '',
    '—',
    `sniggl · ${origin}`,
    `Unsubscribe: ${unsubscribeUrl(token)}`,
  ].join('\n');

/** Oldest first, so a first run delivers a backlog in the order it was written. */
const unsent = async (entries: Entry[]): Promise<Entry[]> => {
  const { data } = await db
    .from('sends')
    .select('slug')
    .in(
      'slug',
      entries.map((e) => e.slug),
    );

  const already = new Set((data ?? []).map((row) => row.slug));
  return entries.filter((e) => !already.has(e.slug)).sort((a, b) => a.date.localeCompare(b.date));
};

const mailEntry = async (
  client: ReturnType<typeof openMailer>,
  entry: Entry,
  recipients: Recipient[],
  origin: string,
): Promise<number> => {
  let delivered = 0;

  for (const person of recipients) {
    await pause(PACE_MS);

    try {
      await sendVia(client, {
        to: person.email,
        subject: entry.title,
        text: body(entry, person.token, origin),
        headers: unsubscribeHeaders(person.token),
      });
      delivered += 1;
    } catch (e) {
      // One bad address must not cost the rest of the list this entry.
      console.error(`dispatch: ${entry.slug} failed for one recipient`, e instanceof Error ? e.message : e);
    }
  }

  return delivered;
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });

  // Read rather than require: an unset secret means the list is not configured
  // yet, which is a state to refuse from — not one to answer with a 500 and a
  // stack trace for anyone who knocks.
  const expected = Deno.env.get('DISPATCH_SECRET');
  if (!expected || req.headers.get('x-dispatch-secret') !== expected) {
    return new Response('forbidden', { status: 403 });
  }

  const { entries = [] } = (await req.json().catch(() => ({}))) as { entries?: Entry[] };
  if (entries.length === 0) return Response.json({ sent: [] });

  const pending = await unsent(entries);
  if (pending.length === 0) return Response.json({ sent: [] });

  const { data: subscribers } = await db
    .from('subscribers')
    .select('email, token')
    .eq('status', 'confirmed');

  const recipients = (subscribers ?? []) as Recipient[];

  if (recipients.length > MAX_RECIPIENTS) {
    console.error(
      `dispatch: ${recipients.length} recipients is past the ${MAX_RECIPIENTS} ceiling — refusing to send. The list has outgrown a mailbox's SMTP.`,
    );
    return Response.json({ sent: [], blocked: recipients.length });
  }

  // One connection for the whole run: a handshake per recipient is wasted wall
  // clock, and holding one across invocations would wake up on a dead socket.
  const origin = site();
  const client = openMailer();
  const sent: string[] = [];

  try {
    for (const entry of pending) {
      const delivered = await mailEntry(client, entry, recipients, origin);

      // Recorded even when the list is empty: the entry has had its moment, and
      // nobody who subscribes tomorrow wants last week's post as their welcome.
      const { error } = await db.from('sends').insert({ slug: entry.slug, recipients: delivered });
      if (error) {
        console.error('dispatch: ledger insert failed', error.message);
        break;
      }

      sent.push(entry.slug);
    }
  } finally {
    await client.close();
  }

  return Response.json({ sent, recipients: recipients.length });
});
