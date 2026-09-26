import { SupabaseClient } from '@supabase/supabase-js';
import { getUserTenants } from './supabase/queries';

export async function verifyUserTenant(supabase: SupabaseClient, userId: string) {
  const userTenants = await getUserTenants(supabase, userId);

  if (!userTenants?.length) {
    throw new Error('NEEDS_PAYSTUB_ACTIVATION');
  }

  return userTenants[0].tenant;
} 