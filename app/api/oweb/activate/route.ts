import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import type { ActivationKind } from '@/lib/oweb/activate';
import { bootstrapOwebSession } from '@/lib/oweb/bootstrap-session';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.access_token || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let activationKind: ActivationKind = 'sign_in';
  try {
    const body = (await request.json().catch(() => ({}))) as {
      activation_kind?: ActivationKind;
    };
    if (body.activation_kind) activationKind = body.activation_kind;
  } catch {
    /* empty body is fine */
  }

  const { workspaceId } = await bootstrapOwebSession(supabase, {
    accessToken: session.access_token,
    userId: session.user.id,
    activationKind
  });

  return NextResponse.json({ ok: true, workspace_id: workspaceId });
}
