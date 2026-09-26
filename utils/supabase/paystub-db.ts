import type { SupabaseClient } from '@supabase/supabase-js';

/** Postgres schema for Paystub Generator on One OS. */
export const PAYSTUB_SCHEMA =
  process.env.NEXT_PUBLIC_PAYSTUB_DB_SCHEMA?.trim() || 'paystub';

export function paystubDb(supabase: SupabaseClient) {
  return supabase.schema(PAYSTUB_SCHEMA);
}
