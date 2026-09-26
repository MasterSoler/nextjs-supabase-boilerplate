import { OWEB_BASE_URL } from '@/lib/oweb/config';

export type WorkspaceActivationKind =
  | 'personal_bootstrap'
  | 'created'
  | 'sign_in'
  | 'sso_launch'
  | 'invite_accept'
  | 'provisioned'
  | 'import_reconciled';

export async function activatePaystubWorkspace(
  accessToken: string,
  workspaceId: string,
  activationKind: WorkspaceActivationKind = 'sign_in'
) {
  const res = await fetch(`${OWEB_BASE_URL}/api/v1/oneid/activate-workspace`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      workspace_id: workspaceId,
      activation_kind: activationKind
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('OneID workspace activation failed', res.status, text);
  }
}
