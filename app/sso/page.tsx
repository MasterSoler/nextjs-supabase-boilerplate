'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { persistWorkspaceId } from '@/lib/oweb/workspace-storage';
import { verifyUserTenant } from '@/utils/auth-helpers';
import { createClient } from '@/utils/supabase/client';
import { useTenant } from '@/utils/tenant-context';

function SsoPageInner() {
  const searchParams = useSearchParams();
  const launchToken = searchParams.get('launch_token') ?? '';
  const [error, setError] = useState<string | null>(null);
  const { setCurrentTenant } = useTenant();

  useEffect(() => {
    if (!launchToken) {
      setError(
        'Missing launch token. Open Paystub Generator from the OWeb App Store or sign in again.'
      );
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/oweb/sso', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ launch_token: launchToken })
        });

        const payload = (await res.json().catch(() => ({}))) as {
          error?: string;
          workspace_id?: string;
        };

        if (!res.ok) {
          throw new Error(payload.error ?? 'SSO failed');
        }

        if (cancelled) return;

        if (payload.workspace_id) {
          persistWorkspaceId(payload.workspace_id);
        }

        const supabase = createClient();
        const {
          data: { user }
        } = await supabase.auth.getUser();

        if (user) {
          const defaultTenant = await verifyUserTenant(supabase, user.id);
          setCurrentTenant(defaultTenant);
          localStorage.setItem('currentTenant', JSON.stringify(defaultTenant));
        }

        window.location.assign('/');
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'SSO failed');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [launchToken, setCurrentTenant]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        {error ? (
          <>
            <h1 className="text-lg font-semibold">Could not sign you in</h1>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <Link
              href="/auth/signin"
              className="mt-4 inline-block text-sm text-primary underline-offset-4 hover:underline"
            >
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold">Signing you in…</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Completing secure handoff from OWeb.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function SsoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <p className="text-sm text-muted-foreground">Signing you in…</p>
        </div>
      }
    >
      <SsoPageInner />
    </Suspense>
  );
}
