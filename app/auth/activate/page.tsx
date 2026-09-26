import { redirect } from 'next/navigation';

import ActivatePaystubAccount from '@/components/misc/ActivatePaystubAccount';
import { createClient } from '@/utils/supabase/server';

export default async function ActivatePage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/signin');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        <ActivatePaystubAccount />
      </div>
    </div>
  );
}
