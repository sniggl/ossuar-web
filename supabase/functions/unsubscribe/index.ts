/**
 * The link at the bottom of every mail, and the endpoint behind the
 * `List-Unsubscribe-Post` header.
 *
 * GET is a person clicking; POST is the mail client doing it for them under
 * RFC 8058, which wants a 200 and no redirect. Both take effect on the first
 * hit — an unsubscribe that needs a second confirmation is an unsubscribe that
 * gets reported as spam instead.
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { env, seeOther } from '../_shared/mail.ts';

const db = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'));

Deno.serve(async (req) => {
  const token = new URL(req.url).searchParams.get('t') ?? '';
  const oneClick = req.method === 'POST';

  if (!token) return oneClick ? new Response('ok') : seeOther('/404');

  const { error } = await db
    .from('subscribers')
    .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() })
    .eq('token', token);

  if (error) console.error('unsubscribe: update failed', error.message);

  return oneClick ? new Response('ok') : seeOther('/unsubscribed/');
});
