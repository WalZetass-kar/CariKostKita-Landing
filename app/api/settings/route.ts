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

  // 1. Try FastAPI public settings
  try {
    const res = await fetch(`${primaryApiUrl}/api/v1/public/settings`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const json = await res.json();
      return NextResponse.json(json);
    }
  } catch (err) {
    console.warn('Landing Page proxy failed to fetch FastAPI public settings:', err);
  }

  // 2. Try Admin-Gue public settings fallback
  try {
    const res = await fetch(`${fallbackAdminUrl}/api/public/settings`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const json = await res.json();
      return NextResponse.json({
        success: true,
        data: json.settings || json.data || json,
      });
    }
  } catch (err) {
    console.warn('Landing Page proxy failed to fetch Admin-Gue fallback settings:', err);
  }

  // 3. Fallback defaults
  return NextResponse.json({
    success: true,
    data: {
      appName: 'CariKostKita',
      tagline: 'Temukan Kost Nyaman & Terpercaya di Pekanbaru',
      siteDescription: 'CariKostKita hadir untuk memudahkan kamu menemukan kost terbaik di Pekanbaru.',
      versionName: 'v1.0.1',
      releaseNotes: 'Rilis beta resmi CariKostKita untuk mahasiswa dan warga Pekanbaru.',
      supportEmail: 'support@carikostkita.id',
      contactPhone: '0761-555-0123',
      address: 'Jl. Soekarno Hatta No. 1, Pekanbaru, Riau',
      siteTitle: 'CariKostKita - Cari Kost Terpercaya di Pekanbaru',
      targetCity: 'Pekanbaru',
      apkSize: '6.9 MB',
      minAndroid: 'Android 8.0+',
      heroBadge1: 'Lokasi dekat kampus & area strategis',
      heroBadge2: 'Detail kost & foto kamar lengkap',
      apkUrl: 'https://github.com/g-423/KosKita/releases/download/v1.0.0-beta/CariKostKita-v1.0.0-beta.apk',
      whatsapp: '6281270008899',
      bannerActive: false,
      bannerText: '',
      bannerLink: '',
      bannerType: 'promo',
      heroImageUrl: '',
      githubUrl: 'https://github.com/g-423/KosKita',
    },
  });
}
