import type { Metadata, Viewport } from 'next';
import { DM_Sans } from 'next/font/google';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import './globals.css';

config.autoAddCss = false;

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://carikostkita.com'),
  title: 'CariKostKita — Download Aplikasi Pencarian Kost Pekanbaru (APK)',
  description: 'Aplikasi Android ringan untuk mencari kost di Pekanbaru. Foto asli, lokasi Google Maps presisi, dan kontak langsung ke pemilik kost tanpa perantara.',
  keywords: ['cari kost pekanbaru', 'kost UIR', 'kost UNRI', 'kost Bukit Raya', 'APK CariKostKita', 'kost mahasiswa pekanbaru'],
  authors: [{ name: 'Tim CariKostKita' }],
  openGraph: {
    type: 'website',
    url: 'https://carikostkita.com/',
    title: 'CariKostKita — Download Aplikasi Pencarian Kost Pekanbaru (APK Bebas Iklan)',
    description: 'Temukan kamar kost di sekitar kampus Pekanbaru dengan foto asli dan lokasi presisi. Download APK beta resmi gratis.',
    siteName: 'CariKostKita',
    images: [{ url: '/og-placeholder.svg', width: 1200, height: 630, alt: 'Pratinjau Aplikasi CariKostKita' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CariKostKita — Cari Kost Pekanbaru',
    description: 'Aplikasi Android pencarian kost mahasiswa & perantau di Pekanbaru.',
    images: ['/og-placeholder.svg']
  }
};

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
