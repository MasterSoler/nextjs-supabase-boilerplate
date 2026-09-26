import type { SupabaseClient } from '@supabase/supabase-js';
import { paystubDb } from '@/utils/supabase/paystub-db';

/** Local profile projection for Paystub Generator (satellite onboarding). */
export async function ensurePaystubProfile(supabase: SupabaseClient, userId: string) {
  const { error } = await paystubDb(supabase)
    .from('profiles')
    .upsert({ id: userId, updated_at: new Date().toISOString() }, { onConflict: 'id' });

  if (error) {
    console.error('ensurePaystubProfile failed', error);
  }
}
