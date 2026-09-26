import { createHash } from 'node:crypto';

import { OWEB_APP_ID } from '@/lib/oweb/config';
import { createAdminClient } from '@/utils/supabase/admin';

export type RedeemLaunchTokenResult = {
  accessToken: string;
  refreshToken: string | null;
  orgId: string;
  userId: string;
};

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Redeem a one-time OWeb ecosystem launch token (minted by App Store / SSO). */
export async function redeemEcosystemLaunchToken(
  launchToken: string
): Promise<RedeemLaunchTokenResult> {
  const trimmed = launchToken.trim();
  if (!trimmed) throw new Error('missing_launch_token');

  const supabaseAdmin = createAdminClient();
  const tokenHash = hashToken(trimmed);
  const now = new Date().toISOString();

  const { data: row, error } = await supabaseAdmin
    .from('ao_ecosystem_launch_tokens')
    .select(
      'id, app_id, org_id, user_id, access_token, refresh_token, expires_at, consumed_at'
    )
    .eq('token_hash', tokenHash)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!row) throw new Error('invalid_launch_token');
  if (row.consumed_at) throw new Error('launch_token_consumed');
  if (row.expires_at <= now) throw new Error('launch_token_expired');
  if (row.app_id !== OWEB_APP_ID) throw new Error('launch_token_wrong_app');

  const { error: consumeError } = await supabaseAdmin
    .from('ao_ecosystem_launch_tokens')
    .update({ consumed_at: now })
    .eq('id', row.id)
    .is('consumed_at', null);

  if (consumeError) throw new Error(consumeError.message);

  return {
    accessToken: row.access_token,
    refreshToken: row.refresh_token,
    orgId: row.org_id,
    userId: row.user_id
  };
}
