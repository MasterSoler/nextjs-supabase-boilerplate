'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ContinueWithOweb } from '@/components/misc/ContinueWithOweb';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { persistWorkspaceId } from '@/lib/oweb/workspace-storage';
import { useTenant } from '@/utils/tenant-context';

type WorkspaceRow = {
  id: string;
  name: string;
  slug: string | null;
  paystub_provisioned: boolean;
};

export default function ActivatePaystubAccount() {
  const router = useRouter();
  const { setCurrentTenant, setUserTenants } = useTenant();
  const [workspaces, setWorkspaces] = useState<WorkspaceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/oweb/workspaces');
        const data = (await res.json()) as { workspaces?: WorkspaceRow[]; error?: string };
        if (!res.ok) throw new Error(data.error ?? 'Failed to load workspaces');
        setWorkspaces(data.workspaces ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load workspaces');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const enterApp = (tenant: { id: string; name: string; subdomain: string }) => {
    setCurrentTenant(tenant);
    setUserTenants([tenant]);
    localStorage.setItem('currentTenant', JSON.stringify(tenant));
    localStorage.setItem('userTenants', JSON.stringify([tenant]));
    persistWorkspaceId(tenant.id);
    router.push('/');
    router.refresh();
  };

  const activateWorkspace = async (workspaceId: string) => {
    setActivatingId(workspaceId);
    setError(null);
    try {
      const res = await fetch('/api/oweb/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace_id: workspaceId })
      });
      const data = (await res.json()) as {
        error?: string;
        tenant?: { id: string; name: string; subdomain: string };
      };
      if (!res.ok) throw new Error(data.error ?? 'Activation failed');
      if (data.tenant) enterApp(data.tenant);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Activation failed');
    } finally {
      setActivatingId(null);
    }
  };

  const openWorkspace = (ws: WorkspaceRow) => {
    enterApp({
      id: ws.id,
      name: ws.name,
      subdomain: ws.slug ?? ws.id.slice(0, 8)
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activate Paystub Generator</CardTitle>
        <CardDescription>
          Choose an OWeb workspace to enable Paystub for your OneID. Each workspace must be
          activated separately (satellite Layer 3).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ContinueWithOweb label="Sign in with OWeb" />
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading your workspaces…</p>
        ) : workspaces.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No OWeb workspaces found for this account. Complete onboarding at oweb.one, then return
            here.
          </p>
        ) : (
          <ul className="space-y-2">
            {workspaces.map((ws) => (
              <li
                key={ws.id}
                className="flex items-center justify-between gap-3 rounded-md border p-3"
              >
                <div>
                  <p className="font-medium">{ws.name}</p>
                  {ws.slug ? (
                    <p className="text-xs text-muted-foreground">{ws.slug}</p>
                  ) : null}
                </div>
                {ws.paystub_provisioned ? (
                  <Button type="button" variant="secondary" onClick={() => openWorkspace(ws)}>
                    Open
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={activatingId === ws.id}
                    onClick={() => activateWorkspace(ws.id)}
                  >
                    {activatingId === ws.id ? 'Activating…' : 'Activate'}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
