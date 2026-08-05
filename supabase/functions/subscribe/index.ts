/**
 * Takes the signup form from the static site and starts the double opt-in.
 *
 * Deployed with `verify_jwt = false`, because the caller is a plain HTML form
 * with no key and no JavaScript. Every path answers with the same 303 — a wrong
 * address, a known address and a fresh one are indistinguishable from outside,
 * so the endpoint cannot be used to ask whether someone is on the list. That is
 * why `enroll` returns nothing and the handler owns the only response.
 */
import { db } from '../_shared/db.ts';
import { clientIp, functionsUrl, LANDING, seeOther, site } from '../_shared/env.ts';
import { send } from '../_shared/mail.ts';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const HOURLY_LIMIT = 5;

const confirmMail = (token: string) => ({
  subject: 'Confirm your address — Ossuar',
  text: [
    'Someone (probably you) asked for the Ossuar journal by email.',
    '',
    'Confirm the address and you are on the list:',
    `${functionsUrl()}/confirm?t=${token}`,
    '',
    'One mail per journal entry, nothing else, and every one of them has an',
    'unsubscribe link at the bottom. If this was not you, ignore this — nothing',
    'is sent to an address that never confirms.',
    '',
    `— sniggl · ${site()}`,
  ].join('\n'),
});

const enroll = async (req: Request): Promise<void> => {
  const form = await req.formData().catch(() => null);
  if (!form) return;

  // The off-screen field. A person never sees it; a bot fills everything.
  if (String(form.get('quarry') ?? '').trim() !== '') return;

  const email = String(form.get('email') ?? '')
    .trim()
    .toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) return;

  const ip = clientIp(req);
  const hourAgo = new Date(Date.now() - 3_600_000).toISOString();

  // Independent questions, so one round trip rather than two.
  const [recent, { data: existing }] = await Promise.all([
    ip
      ? db
          .from('subscribers')
          .select('id', { count: 'exact', head: true })
          .eq('signup_ip', ip)
          .gte('created_at', hourAgo)
      : Promise.resolve({ count: 0 }),
    db.from('subscribers').select('id, status').eq('email', email).maybeSingle(),
  ]);

  if ((recent.count ?? 0) >= HOURLY_LIMIT) return;

  // Already confirmed: say nothing, send nothing. Re-confirming an address on
  // request would make this endpoint a way to mail-bomb someone else's inbox.
  if (existing?.status === 'confirmed') return;

  const token = crypto.randomUUID();

  const { error } = existing
    ? await db
        .from('subscribers')
        .update({ status: 'pending', token, signup_ip: ip, created_at: new Date().toISOString() })
        .eq('id', existing.id)
    : await db.from('subscribers').insert({ email, token, signup_ip: ip });

  if (error) {
    console.error('subscribe: write failed', error.message);
    return;
  }

  await send({ to: email, ...confirmMail(token) });
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });

  try {
    await enroll(req);
  } catch (e) {
    console.error('subscribe failed', e instanceof Error ? e.message : e);
  }

  return seeOther(LANDING.pending);
});
