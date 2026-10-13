import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const primaryApiUrl = (
    process.env.NEXT_PUBLIC_CARIKOSTKITA_API_URL ||
    'https://carikostkitafastapi.vercel.app'
  ).replace(/\/+$/, '');

  const fallbackAdminUrl = (
    process.env.ADMIN_GUE_API_URL ||
    'http://localhost:3000'
  ).replace(/\/+$/, '');

  let adminLocalSettings: Record<string, any> = {};

  // 1. Direct filesystem check for Admin-Gue data/db.json (instant local sync)
  const cwd = process.cwd();
  const possibleDbPaths = [
    path.resolve(cwd, '../Admin-Gue/data/db.json'),
    path.resolve(cwd, 'Admin-Gue/data/db.json'),
    'D:/projek java dan web/CariKostKita_FastAPI_Docs/Admin-Gue/data/db.json',
  ];

  for (const dbPath of possibleDbPaths) {
    try {
      if (fs.existsSync(dbPath)) {
        const raw = fs.readFileSync(dbPath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.system && typeof parsed.system === 'object') {
          adminLocalSettings = parsed.system;
          break;
        }
      }
    } catch {}
  }

  // 2. HTTP check for Admin-Gue public settings endpoint
  let adminHttpSettings: Record<string, any> = {};
  try {
    const res = await fetch(`${fallbackAdminUrl}/api/public/settings`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const json = await res.json();
      adminHttpSettings = json.settings || json.data || json || {};
    }
  } catch {}

  // 3. HTTP check for FastAPI public settings endpoint
  let fastApiSettings: Record<string, any> = {};
  try {
    const res = await fetch(`${primaryApiUrl}/api/v1/public/settings`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const json = await res.json();
      fastApiSettings = json.data || json || {};
    }
  } catch {}

  const defaults = {
    appName: 'CariKostKita',
    tagline: 'Temukan Kost Nyaman & Terpercaya di Pekanbaru',
    siteDescription: 'Platform pencarian kost terverifikasi dengan info harga, lokasi, dan fasilitas akurat.',
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
    logoUrl: '',
    githubUrl: 'https://github.com/g-423/KosKita',
    instagram: 'https://instagram.com/carikostkita',
    facebook: 'https://facebook.com/carikostkita',
    tiktok: 'https://tiktok.com/@carikostkita',
  };

  // Merge hierarchy: defaults -> FastAPI -> Admin-Gue HTTP -> Admin-Gue local filesystem
  const merged: Record<string, any> = {
    ...defaults,
    ...fastApiSettings,
    ...adminHttpSettings,
    ...adminLocalSettings,
  };

  // Normalize all fields for both camelCase and snake_case consumption
  const normalized = {
    ...merged,
    appName: merged.appName || merged.app_name || defaults.appName,
    app_name: merged.app_name || merged.appName || defaults.appName,
    tagline: merged.tagline || defaults.tagline,
    whatsapp: merged.whatsapp || merged.contact_whatsapp || defaults.whatsapp,
    contact_whatsapp: merged.contact_whatsapp || merged.whatsapp || defaults.whatsapp,
    apkUrl: merged.apkUrl || merged.apk_url || defaults.apkUrl,
    apk_url: merged.apk_url || merged.apkUrl || defaults.apkUrl,
    versionName: merged.versionName || merged.version_name || defaults.versionName,
    version_name: merged.version_name || merged.version_name || defaults.versionName,
    releaseNotes: merged.releaseNotes || merged.release_notes || defaults.releaseNotes,
    release_notes: merged.release_notes || merged.releaseNotes || defaults.releaseNotes,
    supportEmail: merged.supportEmail || merged.support_email || defaults.supportEmail,
    support_email: merged.support_email || merged.supportEmail || defaults.supportEmail,
    contactPhone: merged.contactPhone || merged.contact_phone || defaults.contactPhone,
    contact_phone: merged.contact_phone || merged.contactPhone || defaults.contactPhone,
    address: merged.address || merged.office_address || defaults.address,
    office_address: merged.office_address || merged.address || defaults.address,
    siteTitle: merged.siteTitle || merged.site_title || defaults.siteTitle,
    site_title: merged.site_title || merged.siteTitle || defaults.siteTitle,
    siteDescription: merged.siteDescription || merged.site_description || defaults.siteDescription,
    site_description: merged.site_description || merged.siteDescription || defaults.siteDescription,
    targetCity: merged.targetCity || merged.target_city || defaults.targetCity,
    target_city: merged.target_city || merged.targetCity || defaults.targetCity,
    apkSize: merged.apkSize || merged.apk_size || defaults.apkSize,
    apk_size: merged.apk_size || merged.apkSize || defaults.apkSize,
    minAndroid: merged.minAndroid || merged.min_android || defaults.minAndroid,
    min_android: merged.min_android || merged.minAndroid || defaults.minAndroid,
    heroBadge1: merged.heroBadge1 || merged.hero_badge_1 || defaults.heroBadge1,
    hero_badge_1: merged.hero_badge_1 || merged.heroBadge1 || defaults.heroBadge1,
    heroBadge2: merged.heroBadge2 || merged.hero_badge_2 || defaults.heroBadge2,
    hero_badge_2: merged.hero_badge_2 || merged.heroBadge2 || defaults.heroBadge2,
    bannerActive: Boolean(merged.bannerActive ?? merged.banner_active ?? defaults.bannerActive),
    banner_active: Boolean(merged.banner_active ?? merged.bannerActive ?? defaults.bannerActive),
    bannerText: merged.bannerText ?? merged.banner_text ?? defaults.bannerText,
    banner_text: merged.banner_text ?? merged.bannerText ?? defaults.bannerText,
    bannerLink: merged.bannerLink ?? merged.banner_link ?? defaults.bannerLink,
    banner_link: merged.banner_link ?? merged.bannerLink ?? defaults.bannerLink,
    bannerType: merged.bannerType || merged.banner_type || defaults.bannerType,
    banner_type: merged.banner_type || merged.bannerType || defaults.bannerType,
    heroImageUrl: merged.heroImageUrl ?? merged.hero_image_url ?? defaults.heroImageUrl,
    hero_image_url: merged.hero_image_url ?? merged.heroImageUrl ?? defaults.heroImageUrl,
    logoUrl: merged.logoUrl ?? merged.logo_url ?? defaults.logoUrl,
    logo_url: merged.logo_url ?? merged.logoUrl ?? defaults.logoUrl,
    githubUrl: merged.githubUrl || merged.github_url || defaults.githubUrl,
    github_url: merged.github_url || merged.githubUrl || defaults.githubUrl,
    instagram: merged.instagram || defaults.instagram,
    facebook: merged.facebook || defaults.facebook,
    tiktok: merged.tiktok || defaults.tiktok,
  };

  return NextResponse.json({
    success: true,
    data: normalized,
  });
}
