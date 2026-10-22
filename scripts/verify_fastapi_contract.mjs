/**
 * Guard kontrak FastAPI untuk Landing Page.
 *
 * Proyek dipindahkan ke kontrak publik FastAPI dan script ini menjaga agar
 * tidak ada lagi URL Laravel atau endpoint lama yang muncul kembali.
 *
 * Script ini TIDAK mengubah berkas apa pun; ia hanya memverifikasi.
 * Jalankan: npm run verify:contract
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Setiap berkas yang WAJIB memakai endpoint FastAPI, beserta penanda yang
 * harus ada di dalamnya.
 */
const REQUIRED = [
  {
    file: 'app/landing-client.tsx',
    markers: [
      'NEXT_PUBLIC_CARIKOSTKITA_API_URL',
      "'/api/v1/public/settings'",
      "'/settings'",
      "'/latest-release'",
    ],
  },
  {
    file: 'lib/landing-server.ts',
    markers: ['NEXT_PUBLIC_CARIKOSTKITA_API_URL', '/api/v1/public/settings'],
  },
  {
    file: 'app/api/settings/route.ts',
    markers: ['NEXT_PUBLIC_CARIKOSTKITA_API_URL', '/api/v1/public/settings'],
  },
  {
    file: 'app/api/ads/route.ts',
    markers: ['NEXT_PUBLIC_CARIKOSTKITA_API_URL', '/api/v1/public/settings/ads'],
  },
];

/** Penanda yang TIDAK boleh muncul lagi (warisan Laravel / endpoint lama). */
const FORBIDDEN = [
  { file: 'app/landing-client.tsx', marker: '/app-latest' },
  { file: 'lib/landing-server.ts', marker: '/app-latest' },
  { file: 'app/api/settings/route.ts', marker: '/app-latest' },
];

const problems = [];

for (const { file, markers } of REQUIRED) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) {
    problems.push(`${file}: berkas tidak ditemukan`);
    continue;
  }
  const content = fs.readFileSync(full, 'utf8');
  for (const marker of markers) {
    if (!content.includes(marker)) {
      problems.push(`${file}: penanda "${marker}" tidak ditemukan`);
    }
  }
}

for (const { file, marker } of FORBIDDEN) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) continue;
  const content = fs.readFileSync(full, 'utf8');
  if (content.includes(marker)) {
    problems.push(`${file}: penanda "${marker}" yang sudah dihapus masih ada`);
  }
}

if (problems.length > 0) {
  console.error('Landing Page tidak lagi sesuai kontrak FastAPI:');
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(`Landing Page memakai kontrak FastAPI (${REQUIRED.length} berkas diperiksa). Tidak ada berkas yang diubah.`);
