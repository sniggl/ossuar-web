/**
 * The link in the opt-in mail. Turns a pending row into a confirmed one and
 * records where and when that happened, which is the consent evidence the
 * whole double opt-in exists to produce.
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { env, seeOther } from '../_shared/mail.ts';

const db = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'));

Deno.serve(async (req) => {
  const token = new URL(req.url).searchParams.get('t') ?? '';
  if (!token) return seeOther('/404');

  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || null;

  const { data, error } = await db
    .from('subscribers')
    .update({ status: 'confirmed', confirmed_at: new Date().toISOString(), confirm_ip: ip })
    .eq('token', token)
    .neq('status', 'unsubscribed')
    .select('id')
    .maybeSingle();

  if (error) console.error('confirm: update failed', error.message);

  // An unknown or spent token lands on the 404 rather than claiming success —
  // a page that says "you are on the list" when nobody is would be a lie the
  // reader has no way to check.
  return seeOther(data ? '/confirmed/' : '/404');
});
