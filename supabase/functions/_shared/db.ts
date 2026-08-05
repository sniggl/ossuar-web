/**
 * The service-role client, once. Every function needs it and all five had their
 * own identical copy, which makes adding a client option a five-file edit where
 * four-of-five is silent.
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { env } from './env.ts';

export const db = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'));
