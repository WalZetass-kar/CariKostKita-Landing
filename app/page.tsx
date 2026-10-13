import LandingPageClient, { defaultConfig, AppConfigState } from './LandingPageClient';

export const dynamic = 'force-dynamic';

async function getPlatformSettings(): Promise<Partial<AppConfigState>> {
  const publicApiUrl = (
    process.env.NEXT_PUBLIC_CARIKOSTKITA_API_URL ||
    'https://carikostkitafastapi.vercel.app'
  ).replace(/\/+$/, '');

  try {
    const res = await fetch(`${publicApiUrl}/api/v1/public/settings`, {
      cache: 'no-store',
      // Allow fast timeout on server render if remote is slow
      next: { revalidate: 0 },
    });

    if (res.ok) {
      const json = await res.json();
      const full = json?.data || {};
      return {
        appName: full.appName || full.app_name || defaultConfig.appName,
        tagline: full.tagline || defaultConfig.tagline,
        heroText: full.siteDescription || full.site_description || defaultConfig.heroText,
        versionName: full.versionName || full.version_name || defaultConfig.versionName,
        releaseNotes: full.releaseNotes || full.release_notes || defaultConfig.releaseNotes,
        supportEmail: full.supportEmail || full.support_email || defaultConfig.supportEmail,
        contactPhone: full.contactPhone || full.contact_phone || defaultConfig.contactPhone,
        address: full.address || full.office_address || defaultConfig.address,
        siteTitle: full.siteTitle || full.site_title || defaultConfig.siteTitle,
        siteDescription: full.siteDescription || full.site_description || defaultConfig.siteDescription,
        targetCity: full.targetCity || full.target_city || defaultConfig.targetCity,
        apkSize: full.apkSize || full.apk_size || defaultConfig.apkSize,
        minAndroid: full.minAndroid || full.min_android || defaultConfig.minAndroid,
        heroBadge1: full.heroBadge1 || full.hero_badge_1 || defaultConfig.heroBadge1,
        heroBadge2: full.heroBadge2 || full.hero_badge_2 || defaultConfig.heroBadge2,
        apk: full.apkUrl || full.apk_url || defaultConfig.apk,
        waNumber: full.whatsapp || full.contact_whatsapp || defaultConfig.waNumber,
      };
    }
  } catch (err) {
    console.error('Failed to pre-fetch server platform settings:', err);
  }

  return defaultConfig;
}

export default async function Page() {
  const initialConfig = await getPlatformSettings();
  return <LandingPageClient initialConfig={initialConfig} />;
}
