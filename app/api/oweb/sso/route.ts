import { NextResponse } from 'next/server';

import { bootstrapOwebSession } from '@/lib/oweb/bootstrap-session';
import { redeemEcosystemLaunchToken } from '@/lib/oweb/redeem-launch-token';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  let launchToken: string | undefined;
  try {
    const body = (await request.json()) as { launch_token?: string };
    launchToken = body.launch_token;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!launchToken?.trim()) {
    return NextResponse.json({ error: 'missing_launch_token' }, { status: 400 });
  }

  try {
    const redeemed = await redeemEcosystemLaunchToken(launchToken);
    const supabase = await createClient();

    const { error: sessionError } = await supabase.auth.setSession({
      access_token: redeemed.accessToken,
      refresh_token: redeemed.refreshToken ?? ''
    });

    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 401 });
    }

    const { workspaceId } = await bootstrapOwebSession(supabase, {
      accessToken: redeemed.accessToken,
      userId: redeemed.userId,
      activationKind: 'sso_launch',
      workspaceId: redeemed.orgId
    });

    return NextResponse.json({
      ok: true,
      workspace_id: workspaceId ?? redeemed.orgId
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'sso_failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
