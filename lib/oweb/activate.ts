import { OWEB_APP_ID, OWEB_BASE_URL } from '@/lib/oweb/config';

export type ActivationKind = 'signup' | 'sign_in' | 'sso_launch';

export async function activatePaystubApp(
  accessToken: string,
  activationKind: ActivationKind = 'sign_in'
) {
  const res = await fetch(`${OWEB_BASE_URL}/api/v1/oneid/activate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ app_id: OWEB_APP_ID, activation_kind: activationKind })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error('OneID app activation failed', res.status, text);
  }
}
