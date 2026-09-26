export const OWEB_WORKSPACE_STORAGE_KEY = 'oweb_workspace_id';

export function persistWorkspaceId(workspaceId: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(OWEB_WORKSPACE_STORAGE_KEY, workspaceId);
}

export function readStoredWorkspaceId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(OWEB_WORKSPACE_STORAGE_KEY);
}
