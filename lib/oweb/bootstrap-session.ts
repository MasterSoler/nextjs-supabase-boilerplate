import type { SupabaseClient } from '@supabase/supabase-js';

import { activatePaystubApp, type ActivationKind } from '@/lib/oweb/activate';
import {
  activatePaystubWorkspace,
  type WorkspaceActivationKind
} from '@/lib/oweb/activate-workspace';
import { ensurePaystubProfile } from '@/lib/oweb/ensure-profile';
import { ensurePaystubTenantForWorkspace } from '@/lib/oweb/ensure-tenants';
import { resolvePrimaryWorkspaceId } from '@/lib/oweb/resolve-workspace';

export type BootstrapSessionInput = {
  accessToken: string;
  userId: string;
  activationKind: ActivationKind;
  workspaceId?: string | null;
};

function workspaceKindFor(activationKind: ActivationKind): WorkspaceActivationKind {
  if (activationKind === 'sso_launch') return 'sso_launch';
  if (activationKind === 'signup') return 'personal_bootstrap';
  return 'sign_in';
}

/** First-login sequence: app activation, workspace activation, local profile. */
export async function bootstrapOwebSession(
  supabase: SupabaseClient,
  input: BootstrapSessionInput
): Promise<{ workspaceId: string | null }> {
  await activatePaystubApp(input.accessToken, input.activationKind);
  await ensurePaystubProfile(supabase, input.userId);

  const workspaceId =
    input.workspaceId ?? (await resolvePrimaryWorkspaceId(supabase, input.userId));

  if (workspaceId) {
    await activatePaystubWorkspace(
      input.accessToken,
      workspaceId,
      workspaceKindFor(input.activationKind)
    );
    await ensurePaystubTenantForWorkspace(input.userId, workspaceId);
  }

  return { workspaceId };
}
