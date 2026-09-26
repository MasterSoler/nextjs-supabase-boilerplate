import type { SupabaseClient } from '@supabase/supabase-js';

import { paystubDb } from '@/utils/supabase/paystub-db';
import { createAdminClient } from '@/utils/supabase/admin';

export type PaystubTenant = {
  id: string;
  name: string;
  subdomain: string;
};

type AoOrgRow = {
  id: string;
  name: string | null;
  slug: string | null;
  plan: string | null;
};

function slugForOrg(org: AoOrgRow): string {
  const base = (org.slug ?? org.name ?? org.id).toLowerCase().replace(/[^a-z0-9-]/g, '-');
  return base.slice(0, 100) || org.id.replace(/-/g, '').slice(0, 12);
}

/** Mirror one OWeb workspace (`ao_orgs`) into paystub `Tenants` + `UserTenants`. Tenant id = workspace id. */
export async function ensurePaystubTenantForWorkspace(
  userId: string,
  workspaceId: string
): Promise<PaystubTenant | null> {
  const admin = createAdminClient();

  const { data: membership, error: memberError } = await admin
    .from('ao_org_members')
    .select('org_id')
    .eq('user_id', userId)
    .eq('org_id', workspaceId)
    .is('left_at', null)
    .maybeSingle();

  if (memberError) {
    console.error('ensurePaystubTenantForWorkspace membership', memberError);
    return null;
  }
  if (!membership) return null;

  const { data: org, error: orgError } = await admin
    .from('ao_orgs')
    .select('id, name, slug, plan')
    .eq('id', workspaceId)
    .maybeSingle();

  if (orgError || !org) {
    console.error('ensurePaystubTenantForWorkspace org', orgError);
    return null;
  }

  const tenantRow = {
    id: org.id,
    name: org.name ?? 'Workspace',
    subdomain: slugForOrg(org as AoOrgRow),
    plan: org.plan ?? 'starter',
    is_active: true,
    is_deleted: false,
    updated_at: new Date().toISOString()
  };

  const { error: tenantError } = await paystubDb(admin)
    .from('Tenants')
    .upsert(tenantRow, { onConflict: 'id' });

  if (tenantError) {
    console.error('ensurePaystubTenantForWorkspace tenant upsert', tenantError);
    return null;
  }

  const { error: linkError } = await paystubDb(admin).from('UserTenants').upsert(
    {
      user_id: userId,
      tenant_id: org.id,
      updated_at: new Date().toISOString()
    },
    { onConflict: 'user_id,tenant_id' }
  );

  if (linkError) {
    console.error('ensurePaystubTenantForWorkspace user link', linkError);
    return null;
  }

  return {
    id: tenantRow.id,
    name: tenantRow.name,
    subdomain: tenantRow.subdomain
  };
}

/** Provision paystub tenants for every active OWeb workspace membership. */
export async function syncPaystubTenantsFromWorkspaces(userId: string): Promise<PaystubTenant[]> {
  const admin = createAdminClient();
  const { data: memberships, error } = await admin
    .from('ao_org_members')
    .select('org_id')
    .eq('user_id', userId)
    .is('left_at', null);

  if (error || !memberships?.length) return [];

  const tenants: PaystubTenant[] = [];
  for (const row of memberships) {
    const tenant = await ensurePaystubTenantForWorkspace(userId, row.org_id);
    if (tenant) tenants.push(tenant);
  }
  return tenants;
}

export async function listOwebWorkspacesForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<
  Array<{
    id: string;
    name: string;
    slug: string | null;
    paystub_provisioned: boolean;
  }>
> {
  const { data: memberships, error } = await supabase
    .from('ao_org_members')
    .select('org_id')
    .eq('user_id', userId)
    .is('left_at', null);

  if (error || !memberships?.length) return [];

  const orgIds = memberships.map((m) => m.org_id as string);
  const { data: orgs } = await supabase
    .from('ao_orgs')
    .select('id, name, slug')
    .in('id', orgIds);

  const { data: userTenants } = await paystubDb(supabase)
    .from('UserTenants')
    .select('tenant_id')
    .eq('user_id', userId);

  const provisioned = new Set((userTenants ?? []).map((r) => r.tenant_id as string));
  const orgById = new Map((orgs ?? []).map((o) => [o.id as string, o]));

  return orgIds
    .map((id) => {
      const org = orgById.get(id);
      if (!org) return null;
      return {
        id: org.id as string,
        name: (org.name as string) ?? 'Workspace',
        slug: (org.slug as string | null) ?? null,
        paystub_provisioned: provisioned.has(id)
      };
    })
    .filter(Boolean) as Array<{
    id: string;
    name: string;
    slug: string | null;
    paystub_provisioned: boolean;
  }>;
}
