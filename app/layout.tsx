import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://carikostkita.com'),
  title: 'CariKostKita — Download Aplikasi Pencarian Kost Pekanbaru (APK)',
  description: 'Aplikasi Android ringan untuk mencari kost di Pekanbaru. Foto asli, lokasi Google Maps presisi, dan kontak langsung ke pemilik kost tanpa perantara.',
  keywords: ['cari kost pekanbaru', 'kost UIR', 'kost UNRI', 'kost Bukit Raya', 'APK CariKostKita'],
  openGraph: { type: 'website', url: 'https://carikostkita.com/', title: 'CariKostKita — Download Aplikasi Pencarian Kost Pekanbaru', description: 'Temukan kamar kost di sekitar kampus Pekanbaru dengan foto asli dan lokasi presisi. Download APK beta gratis.', siteName: 'CariKostKita', images: [{ url: '/og-placeholder.svg', width: 1200, height: 630, alt: 'Placeholder pratinjau CariKostKita' }] },
  twitter: { card: 'summary_large_image', title: 'CariKostKita — Cari Kost Pekanbaru', description: 'Aplikasi Android pencarian kost mahasiswa & perantau di Pekanbaru.', images: ['/og-placeholder.svg'] }
};

export const viewport: Viewport = { themeColor: '#A30D18' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="id"><body>{children}</body></html>; }
