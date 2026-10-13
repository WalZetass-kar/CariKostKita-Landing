import { NextResponse } from 'next/server';

export async function GET() {
  const primaryApiUrl = (
    process.env.NEXT_PUBLIC_CARIKOSTKITA_API_URL ||
    'https://carikostkitafastapi.vercel.app'
  ).replace(/\/+$/, '');

  const fallbackAdminUrl = (
    process.env.ADMIN_GUE_API_URL ||
    'http://localhost:3000'
  ).replace(/\/+$/, '');

  // 1. Try FastAPI public ads
  try {
    const res = await fetch(`${primaryApiUrl}/api/v1/public/settings/ads`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const json = await res.json();
      return NextResponse.json(json);
    }
  } catch (err) {
    console.warn('Landing Page proxy failed to fetch FastAPI public ads:', err);
  }

  // 2. Try Admin-Gue public ads fallback
  try {
    const res = await fetch(`${fallbackAdminUrl}/api/public/ads?platform=website`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const json = await res.json();
      return NextResponse.json({
        success: true,
        data: json.ads || json.data || [],
      });
    }
  } catch (err) {
    console.warn('Landing Page proxy failed to fetch Admin-Gue public ads:', err);
  }

  return NextResponse.json({ success: true, data: [] });
}
