import { NextResponse } from 'next/server';

const NO_STORE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

/**
 * Browser-safe Realtime wiring for the landing page.
 *
 * The backend only publishes a Supabase key whose JWT role is exactly
 * `anon`, so this endpoint can never leak a service-role credential. It
 * removes the dependency on build-time `NEXT_PUBLIC_SUPABASE_*` variables,
 * which is why the realtime push path was previously dormant.
 */
export async function GET() {
  const apiUrl = (
    process.env.NEXT_PUBLIC_CARIKOSTKITA_API_URL ||
    'https://carikostkitafastapi.vercel.app'
  ).replace(/\/+$/, '');

  try {
    const res = await fetch(`${apiUrl}/api/v1/public/settings/realtime`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const json = await res.json();
      return NextResponse.json(json, { headers: NO_STORE });
    }
  } catch (err) {
    console.warn('Landing Page proxy failed to fetch realtime config:', err);
  }

  return NextResponse.json({ success: true, data: {} }, { headers: NO_STORE });
}
