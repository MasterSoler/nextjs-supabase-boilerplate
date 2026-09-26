/** Shared Supabase Auth options for OWeb One OS (auth.oweb.one). */
export const SUPABASE_AUTH_STORAGE_KEY = 'ao-supabase-auth';

export const supabaseAuthOptions = {
  auth: {
    storageKey: SUPABASE_AUTH_STORAGE_KEY
  }
} as const;
