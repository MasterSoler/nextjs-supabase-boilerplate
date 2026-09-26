import type { SupabaseClient } from '@supabase/supabase-js';

import { getUserTenants } from '@/utils/supabase/queries';

/** After OneID bootstrap, ensure paystub tenant rows exist and return default tenant. */
export async function resolveTenantAfterAuth(supabase: SupabaseClient, userId: string) {
  let userTenants = await getUserTenants(supabase, userId);

  if (!userTenants?.length) {
    await fetch('/api/oweb/workspaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sync_all: true })
    }).catch(() => null);
    userTenants = await getUserTenants(supabase, userId);
  }

  if (!userTenants?.length) {
    return { needsActivation: true as const, tenant: null };
  }

  return { needsActivation: false as const, tenant: userTenants[0].tenant };
}
