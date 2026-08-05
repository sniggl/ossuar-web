/**
 * Keeps the project awake.
 *
 * A free Supabase project with too little *database* activity over seven days
 * gets paused, and a paused project means the signup form fails silently until
 * someone notices. So this reads one row, and a scheduled workflow calls it
 * daily. Hitting a function that never touches the database would not count.
 */
import { db } from '../_shared/db.ts';

Deno.serve(async () => {
  const { error } = await db.from('subscribers').select('id').limit(1);

  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
  return Response.json({ ok: true });
});
