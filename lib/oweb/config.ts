/** OWeb constellation app registration for Paystub Generator. */
export const OWEB_APP_ID = 'paystub' as const;
export const OWEB_APP_NAME = 'Paystub Generator';

export const OWEB_BASE_URL =
  process.env.NEXT_PUBLIC_OWEB_URL?.replace(/\/$/, '') || 'https://oweb.one';

export const OWEB_AUTH_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '') ||
  'https://auth.oweb.one';

export function owebLoginUrl(options?: { launch?: boolean }) {
  const url = new URL('/login', OWEB_BASE_URL);
  if (options?.launch !== false) {
    url.searchParams.set('launch', OWEB_APP_ID);
  }
  return url.toString();
}
