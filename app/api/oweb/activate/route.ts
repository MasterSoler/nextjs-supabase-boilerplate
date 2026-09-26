import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { activatePaystubApp } from '@/lib/oweb/activate';
import { ensurePaystubProfile } from '@/lib/oweb/ensure-profile';

export async function POST() {
  const supabase = await createClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await activatePaystubApp(session.access_token, 'sign_in');
  if (session.user?.id) {
    await ensurePaystubProfile(supabase, session.user.id);
  }

  return NextResponse.json({ ok: true });
}
