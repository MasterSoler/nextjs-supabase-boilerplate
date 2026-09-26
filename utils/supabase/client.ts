import { createBrowserClient } from '@supabase/ssr';
import { supabaseAuthOptions } from '@/utils/supabase/auth-options';

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    supabaseAuthOptions
  );
};
