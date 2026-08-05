/**
 * Takes the signup form from the static site and starts the double opt-in.
 *
 * Deployed with `verify_jwt = false`, because the caller is a plain HTML form
 * with no key and no JavaScript. Everything it answers with is a 303 to the
 * same page — a wrong address, a known address and a fresh one are
 * indistinguishable from outside, so the endpoint cannot be used to ask
 * whether someone is on the list.
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { env, functionsUrl, seeOther, send, site } from '../_shared/mail.ts';

const db = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'));

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

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });

  const form = await req.formData().catch(() => null);
  if (!form) return seeOther('/subscribed/');

  // The off-screen field. A person never sees it; a bot fills everything.
  if (String(form.get('quarry') ?? '').trim() !== '') return seeOther('/subscribed/');

  const email = String(form.get('email') ?? '')
    .trim()
    .toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) return seeOther('/subscribed/');

  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || null;

  if (ip) {
    const hourAgo = new Date(Date.now() - 3_600_000).toISOString();
    const { count } = await db
      .from('subscribers')
      .select('id', { count: 'exact', head: true })
      .eq('signup_ip', ip)
      .gte('created_at', hourAgo);
    if ((count ?? 0) >= HOURLY_LIMIT) return seeOther('/subscribed/');
  }

  const { data: existing } = await db
    .from('subscribers')
    .select('id, status, token')
    .eq('email', email)
    .maybeSingle();

  // Already confirmed: say nothing, send nothing. Re-confirming an address on
  // request would make this endpoint a way to mail-bomb someone else's inbox.
  if (existing?.status === 'confirmed') return seeOther('/subscribed/');

  const token = crypto.randomUUID();

  const { error } = existing
    ? await db
        .from('subscribers')
        .update({ status: 'pending', token, signup_ip: ip, created_at: new Date().toISOString() })
        .eq('id', existing.id)
    : await db.from('subscribers').insert({ email, token, signup_ip: ip });

  if (error) {
    console.error('subscribe: insert failed', error.message);
    return seeOther('/subscribed/');
  }

  try {
    await send({ to: email, ...confirmMail(token) });
  } catch (e) {
    console.error('subscribe: smtp failed', e instanceof Error ? e.message : e);
  }

  return seeOther('/subscribed/');
});
