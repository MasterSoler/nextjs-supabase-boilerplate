import { createClient } from '@supabase/supabase-js';
import { supabaseAuthOptions } from '@/utils/supabase/auth-options';

/** Service-role client for server-only One OS operations (e.g. SSO token redeem). */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(url, serviceKey, {
    ...supabaseAuthOptions,
    auth: {
      ...supabaseAuthOptions.auth,
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
