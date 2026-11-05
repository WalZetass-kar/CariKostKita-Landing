import { cache } from 'react';

/**
 * Server-side access to the landing-page CMS content.
 *
 * The durable store (FastAPI -> Supabase) is the only source of truth. The
 * server HTML and the SEO tags must not lag behind an Admin save, so the read
 * is always uncached. The page itself is `force-dynamic`; React `cache()` only
 * deduplicates the read within one request.
 */
const rawUrl =
  process.env.NEXT_PUBLIC_CARIKOSTKITA_API_URL ||
  process.env.CARIKOSTKITA_API_URL ||
  'https://api.carikostkita.my.id';

export const publicApiUrl = (
  rawUrl.includes('carikostkitafastapi.vercel.app')
    ? 'https://api.carikostkita.my.id'
    : rawUrl
).replace(/\/+$/, '');

export const loadLandingSettings = cache(async (): Promise<Record<string, any> | null> => {
  try {
    const res = await fetch(`${publicApiUrl}/api/v1/public/settings`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data;
    return data && typeof data === 'object' ? data : null;
  } catch {
    return null;
  }
});

export const loadLandingAds = cache(async (): Promise<any[]> => {
  try {
    const res = await fetch(`${publicApiUrl}/api/v1/public/settings/ads`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json?.data;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
});

export const readSetting = (
  settings: Record<string, any> | null,
  camel: string,
  snake: string,
  fallback = ''
): string => {
  if (!settings) return fallback;
  const value = settings[camel] ?? settings[snake];
  if (value === undefined || value === null) return fallback;
  return String(value);
};
