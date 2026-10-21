import { cache } from 'react';

/**
 * Server-side access to the landing-page CMS content.
 *
 * The durable store (FastAPI -> Supabase) is the only source of truth. The
 * request is cached for a short window so the rendered HTML and the SEO tags
 * stay close to the published content, while the client component corrects
 * the page immediately after hydration.
 */
export const publicApiUrl = (
  process.env.NEXT_PUBLIC_CARIKOSTKITA_API_URL ||
  'https://carikostkitafastapi.vercel.app'
).replace(/\/+$/, '');

export const loadLandingSettings = cache(async (): Promise<Record<string, any> | null> => {
  try {
    const res = await fetch(`${publicApiUrl}/api/v1/public/settings`, {
      next: { revalidate: 60 },
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
