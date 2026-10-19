import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

/**
 * Reads the public parts of Our Stories the way any visitor does: the anon key, so RLS shows
 * published stories only. It carries no cookies, which lets it run inside unstable_cache, and
 * one instance serves every request.
 */
export function getPublicClient(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }
  return client;
}
