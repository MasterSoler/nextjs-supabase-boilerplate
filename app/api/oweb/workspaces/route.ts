import { NextResponse } from 'next/server';

import {
  ensurePaystubTenantForWorkspace,
  listOwebWorkspacesForUser,
  syncPaystubTenantsFromWorkspaces
} from '@/lib/oweb/ensure-tenants';
import { activatePaystubWorkspace } from '@/lib/oweb/activate-workspace';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workspaces = await listOwebWorkspacesForUser(supabase, session.user.id);
  return NextResponse.json({ workspaces });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.access_token || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let workspaceId: string | undefined;
  let syncAll = false;
  try {
    const body = (await request.json()) as { workspace_id?: string; sync_all?: boolean };
    workspaceId = body.workspace_id;
    syncAll = Boolean(body.sync_all);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (syncAll) {
    const tenants = await syncPaystubTenantsFromWorkspaces(session.user.id);
    return NextResponse.json({ ok: true, tenants });
  }

  if (!workspaceId) {
    return NextResponse.json({ error: 'workspace_id required' }, { status: 400 });
  }

  await activatePaystubWorkspace(session.access_token, workspaceId, 'sign_in');
  const tenant = await ensurePaystubTenantForWorkspace(session.user.id, workspaceId);

  if (!tenant) {
    return NextResponse.json({ error: 'activation_failed' }, { status: 403 });
  }

  return NextResponse.json({ ok: true, tenant });
}
