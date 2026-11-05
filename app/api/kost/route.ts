import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const rawApi =
    process.env.NEXT_PUBLIC_CARIKOSTKITA_API_URL ||
    process.env.CARIKOSTKITA_API_URL ||
    'https://api.carikostkita.my.id';

  const primaryApiUrl = (
    rawApi.includes('carikostkitafastapi.vercel.app')
      ? 'https://api.carikostkita.my.id'
      : rawApi
  ).replace(/\/+$/, '');

  const queryParams = new URLSearchParams();
  if (searchParams.get('kota')) queryParams.set('kota', searchParams.get('kota')!);
  else queryParams.set('kota', 'Kota Pekanbaru');

  if (searchParams.get('tipe_kost')) queryParams.set('tipe_kost', searchParams.get('tipe_kost')!);
  if (searchParams.get('kecamatan')) queryParams.set('kecamatan', searchParams.get('kecamatan')!);
  if (searchParams.get('page')) queryParams.set('page', searchParams.get('page')!);
  if (searchParams.get('page_size')) queryParams.set('page_size', searchParams.get('page_size')!);
  else queryParams.set('page_size', '8');

  if (searchParams.get('sort')) queryParams.set('sort', searchParams.get('sort')!);
  else queryParams.set('sort', 'TERBARU');

  const queryString = queryParams.toString();
  // When running in dev on localhost, check local FastAPI first for speed, then remote
  const isDev = process.env.NODE_ENV !== 'production';
  const candidates = isDev
    ? [`http://127.0.0.1:8000/api/v1/kost?${queryString}`, `${primaryApiUrl}/api/v1/kost?${queryString}`]
    : [`${primaryApiUrl}/api/v1/kost?${queryString}`, `http://127.0.0.1:8000/api/v1/kost?${queryString}`];

  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        const json = await res.json();
        return NextResponse.json(json, {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          },
        });
      }
    } catch {
      // Continue to next candidate
    }
  }

  return NextResponse.json(
    { data: [], pagination: { page: 1, page_size: 8, has_more: false } },
    { status: 200 }
  );
}
