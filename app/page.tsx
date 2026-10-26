import LandingClient from './landing-client';
import { loadLandingSettings } from '../lib/landing-server';

// Render per request. The settings are the source of truth for both the HTML
// and the SEO tags, so a 60-second ISR window made an Admin save look broken
// (the API was current while the server HTML stayed stale). The client still
// keeps an already-open page in sync through Realtime + polling.
export const dynamic = 'force-dynamic';

/**
 * Server component entry point.
 *
 * The CMS content is loaded on the server so the first HTML the visitor and
 * the crawler receive already contains the published values. The client
 * component then keeps it in sync without a reload.
 */
export default async function Page() {
  const settings = await loadLandingSettings();
  return <LandingClient initialSettings={settings} />;
}
