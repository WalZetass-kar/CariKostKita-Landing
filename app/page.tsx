import LandingClient from './landing-client';
import { loadLandingSettings } from '../lib/landing-server';

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
