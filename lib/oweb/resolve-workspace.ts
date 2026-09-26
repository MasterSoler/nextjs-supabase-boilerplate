import type { SupabaseClient } from '@supabase/supabase-js';

/** Earliest active OWeb workspace membership for the user (personal workspace first). */
export async function resolvePrimaryWorkspaceId(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('ao_org_members')
    .select('org_id')
    .eq('user_id', userId)
    .is('left_at', null)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('resolvePrimaryWorkspaceId failed', error);
    return null;
  }

  return data?.org_id ?? null;
}
