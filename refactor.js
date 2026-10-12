const fs = require('node:fs');
const path = require('node:path');

// This project was migrated to the FastAPI public contract. Keep this historical
// helper non-mutating so an old one-off script cannot restore the Laravel URL or
// the removed `/app-latest` endpoint.
const pagePath = path.join(__dirname, 'app', 'page.tsx');
const page = fs.readFileSync(pagePath, 'utf8');
const required = [
  'NEXT_PUBLIC_CARIKOSTKITA_API_URL',
  "'/settings'",
  "'/latest-release'",
];
const missing = required.filter((marker) => !page.includes(marker));

if (missing.length > 0) {
  throw new Error(`Landing Page is missing FastAPI configuration markers: ${missing.join(', ')}`);
}

console.log('Landing Page already uses FastAPI; no files were changed.');
