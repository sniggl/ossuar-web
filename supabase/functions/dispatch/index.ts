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
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { env, send, site, unsubscribeHeaders } from '../_shared/mail.ts';

const db = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'));

interface Entry {
  slug: string;
  title: string;
  blurb: string;
  date: string;
}

/**
 * The sender is somebody's mailbox, and a mailbox has a daily quota that other
 * things may be relying on. So: never more than this many recipients in a run,
 * and never faster than one every half second.
 *
 * Past the ceiling it refuses the entry outright rather than mailing half the
 * list — a half-sent entry is unrecoverable, since the ledger cannot say which
 * half. Reaching it means the list has outgrown mailbox SMTP, which is a
 * decision to make, not something a cron should quietly paper over.
 */
const MAX_RECIPIENTS = 100;
const PACE_MS = 500;

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const body = (entry: Entry, token: string) =>
  [
    entry.blurb,
    '',
    `Read it: ${site()}/journal/${entry.slug}/`,
    '',
    '—',
    `sniggl · ${site()}`,
    `Unsubscribe: ${env('SUPABASE_URL').replace(/\/+$/, '')}/functions/v1/unsubscribe?t=${token}`,
  ].join('\n');

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });
  if (req.headers.get('x-dispatch-secret') !== env('DISPATCH_SECRET')) {
    return new Response('forbidden', { status: 403 });
  }

  const { entries = [] } = (await req.json().catch(() => ({}))) as { entries?: Entry[] };
  if (entries.length === 0) return Response.json({ sent: [] });

  const { data: alreadySent } = await db.from('sends').select('slug');
  const sentSlugs = new Set((alreadySent ?? []).map((r) => r.slug));

  // Oldest first, so a first run that finds three unsent entries delivers them
  // in the order they were written rather than newest-first.
  const pending = entries
    .filter((e) => !sentSlugs.has(e.slug))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (pending.length === 0) return Response.json({ sent: [] });

  const { data: subscribers } = await db
    .from('subscribers')
    .select('email, token')
    .eq('status', 'confirmed');

  const recipients = subscribers ?? [];

  if (recipients.length > MAX_RECIPIENTS) {
    console.error(
      `dispatch: ${recipients.length} recipients is past the ${MAX_RECIPIENTS} ceiling — refusing to send. The list has outgrown a mailbox's SMTP.`,
    );
    return Response.json({ sent: [], blocked: recipients.length });
  }

  const sent: string[] = [];

  for (const entry of pending) {
    let delivered = 0;

    for (const person of recipients) {
      await pause(PACE_MS);

      try {
        await send({
          to: person.email,
          subject: entry.title,
          text: body(entry, person.token),
          headers: unsubscribeHeaders(person.token),
        });
        delivered += 1;
      } catch (e) {
        // One bad address must not cost the rest of the list this entry.
        console.error(`dispatch: ${entry.slug} failed for one recipient`, e instanceof Error ? e.message : e);
      }
    }

    // Recorded even when the list is empty: the entry has had its moment, and
    // nobody who subscribes tomorrow wants last week's post as their welcome.
    const { error } = await db.from('sends').insert({ slug: entry.slug, recipients: delivered });
    if (error) {
      console.error('dispatch: ledger insert failed', error.message);
      break;
    }

    sent.push(entry.slug);
  }

  return Response.json({ sent, recipients: recipients.length });
});
