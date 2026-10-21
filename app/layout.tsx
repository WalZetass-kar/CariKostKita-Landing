import type { Metadata, Viewport } from 'next';
import { DM_Sans } from 'next/font/google';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import './globals.css';
import { loadLandingSettings, readSetting } from '../lib/landing-server';

config.autoAddCss = false;

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const SITE_URL = 'https://carikostkita.com';

const FALLBACK_TITLE = 'CariKostKita — Download Aplikasi Pencarian Kost Pekanbaru (APK)';
const FALLBACK_DESCRIPTION =
  'Aplikasi Android ringan untuk mencari kost di Pekanbaru. Foto asli, lokasi Google Maps presisi, dan kontak langsung ke pemilik kost tanpa perantara.';
const FALLBACK_KEYWORDS =
  'cari kost pekanbaru, kost UIR, kost UNRI, kost Bukit Raya, APK CariKostKita, kost mahasiswa pekanbaru';

/**
 * Metadata is generated from the CMS so the SEO tags, the Open Graph preview
 * and the rendered page always describe the same content. A static export
 * could not: the published title and description would keep pointing at the
 * built-in defaults.
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await loadLandingSettings();

  const siteName = readSetting(settings, 'appName', 'app_name', 'CariKostKita');
  const title = readSetting(settings, 'siteTitle', 'site_title', FALLBACK_TITLE);
  const description = readSetting(settings, 'siteDescription', 'site_description', FALLBACK_DESCRIPTION);
  const rawKeywords = readSetting(settings, 'metaKeywords', 'meta_keywords', FALLBACK_KEYWORDS);
  const ogImage = readSetting(settings, 'ogImageUrl', 'og_image_url', '/og-placeholder.svg');

  const keywords = rawKeywords
    .split(',')
    .map((keyword) => keyword.trim())
    .filter(Boolean);

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    keywords,
    authors: [{ name: 'Tim CariKostKita' }],
    openGraph: {
      type: 'website',
      url: `${SITE_URL}/`,
      title,
      description,
      siteName,
      images: [{ url: ogImage, width: 1200, height: 630, alt: `Pratinjau Aplikasi ${siteName}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#6D0808',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`scroll-smooth ${dmSans.variable}`}>
      <body className={`${dmSans.className} antialiased bg-[#FBFAF4] text-[#261B19]`}>
        {children}
      </body>
    </html>
  );
}
