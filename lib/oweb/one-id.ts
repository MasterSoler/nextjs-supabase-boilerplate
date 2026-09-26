import type { User } from '@supabase/supabase-js';

/** Display handle from OneID metadata (`@handle`). */
export function getOneIdHandle(user: User): string | null {
  const raw = user.user_metadata?.one_id;
  if (typeof raw !== 'string' || !raw.trim()) return null;
  const trimmed = raw.trim();
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
}
