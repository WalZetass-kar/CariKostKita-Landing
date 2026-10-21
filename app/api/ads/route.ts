import { NextResponse } from 'next/server';

const NO_STORE = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

async function safeJson(res: Response | null | undefined) {
  if (!res || !res.ok) return null;
  try {
    const text = await res.text();
    if (!text || !text.trim()) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function GET() {
  const primaryApiUrl = (
    process.env.NEXT_PUBLIC_CARIKOSTKITA_API_URL ||
    'https://carikostkitafastapi.vercel.app'
  ).replace(/\/+$/, '');

  const fallbackAdminUrl = (
    process.env.ADMIN_GUE_API_URL ||
    'http://localhost:3001'
  ).replace(/\/+$/, '');

  const toList = (payload: any): any[] => {
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.ads)) return payload.ads;
    return [];
  };

  // 1. FastAPI public ads (authoritative)
  let fastApiAds: any[] = [];
  try {
    const res = await fetch(`${primaryApiUrl}/api/v1/public/settings/ads`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    const json = await safeJson(res);
    fastApiAds = toList(json);
  } catch (err) {
    console.warn('Landing Page proxy failed to fetch FastAPI public ads:', err);
  }

  if (fastApiAds.length > 0) {
    return NextResponse.json({ success: true, data: fastApiAds }, { headers: NO_STORE });
  }

  // 2. Admin-Gue public ads fallback. It is only reached when the
  //    authoritative source has no rows - previously an empty array was
  //    returned immediately, so advertisements created in the dashboard
  //    (which live in the admin store) never reached the landing page.
  let adminAds: any[] = [];
  try {
    const res = await fetch(`${fallbackAdminUrl}/api/public/ads?platform=website`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    const json = await safeJson(res);
    adminAds = toList(json);
  } catch (err) {
    console.warn('Landing Page proxy failed to fetch Admin-Gue public ads:', err);
  }

  if (adminAds.length > 0) {
    return NextResponse.json({ success: true, data: adminAds }, { headers: NO_STORE });
  }

  return NextResponse.json({ success: true, data: fastApiAds }, { headers: NO_STORE });
}
