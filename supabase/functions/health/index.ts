/**
 * Keeps the project awake.
 *
 * A free Supabase project with too little *database* activity over seven days
 * gets paused, and a paused project means the signup form fails silently until
 * someone notices. So this reads one row, and a scheduled workflow calls it
 * daily. Hitting a function that never touches the database would not count.
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { env } from '../_shared/mail.ts';

const db = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'));

Deno.serve(async () => {
  const { count, error } = await db
    .from('subscribers')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'confirmed');

  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
  return Response.json({ ok: true, confirmed: count ?? 0 });
});
