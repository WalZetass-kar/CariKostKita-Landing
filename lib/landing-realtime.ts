/**
 * Supabase Realtime wiring for the Landing Page.
 *
 * Primary sync path (no polling):
 *  1. Broadcast channel `landing-settings`, event `settings_updated`.
 *     The Admin dashboard publishes `{ revision, updated_at, changed_keys }`
 *     ONLY after FastAPI confirms the database commit. The payload carries
 *     no content and no secrets; receivers re-fetch the confirmed state.
 *  2. postgres_changes on `platform_settings`, `advertisements`, and
 *     `application_releases` (requires supabase_landing_realtime.sql to be
 *     applied). Covers edits made outside the admin UI (SQL editor).
 *
 * Safety:
 *  - Uses ONLY the public anon key. The service-role key is never referenced:
 *    the backend only publishes a key whose JWT role is exactly `anon`.
 *  - Credentials come from `NEXT_PUBLIC_SUPABASE_*` when configured, and are
 *    otherwise fetched at runtime from the backend's public Realtime
 *    endpoint. That runtime path is what makes the push work without any
 *    build-time configuration.
 *  - When no credentials can be resolved, every helper degrades to a no-op
 *    with status DISABLED so the page keeps working with fetch + focus
 *    refetch.
 *  - No fetching happens here; this module only signals. The page decides
 *    (with content dedupe) whether a re-fetch is needed.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const LANDING_SETTINGS_CHANNEL = 'landing-settings';
export const LANDING_SETTINGS_EVENT = 'settings_updated';

export type RealtimeStatus =
  | 'CONNECTING'
  | 'SUBSCRIBED'
  | 'CHANNEL_ERROR'
  | 'TIMED_OUT'
  | 'CLOSED'
  | 'DISABLED';

export interface SettingsUpdatedPayload {
  revision?: number;
  updated_at?: string;
  changed_keys?: string[];
}

export interface RealtimeConfig {
  url: string;
  anonKey: string;
  channel: string;
  event: string;
}

interface LandingRealtimeHandlers {
  onSettingsUpdated: (payload: SettingsUpdatedPayload) => void;
  onAdsChanged: () => void;
  onStatusChange?: (status: RealtimeStatus) => void;
}

let cachedClient: SupabaseClient | null | undefined;
let runtimeConfigPromise: Promise<RealtimeConfig | null> | null = null;

const envConfig = (): RealtimeConfig | null => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (!url || !anonKey) return null;
  return {
    url,
    anonKey,
    channel: LANDING_SETTINGS_CHANNEL,
    event: LANDING_SETTINGS_EVENT,
  };
};

/** Build-time credentials win; the runtime endpoint is the fallback. */
export function resolveRealtimeConfig(): Promise<RealtimeConfig | null> {
  const fromEnv = envConfig();
  if (fromEnv) return Promise.resolve(fromEnv);
  if (!runtimeConfigPromise) {
    runtimeConfigPromise = fetch('/api/settings/realtime', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) return null;
        const json = await res.json().catch(() => null);
        const cfg = json?.data || json?.config || null;
        if (!cfg || !cfg.supabase_url || !cfg.supabase_anon_key) return null;
        return {
          url: cfg.supabase_url as string,
          anonKey: cfg.supabase_anon_key as string,
          channel: (cfg.channel as string) || LANDING_SETTINGS_CHANNEL,
          event: (cfg.event as string) || LANDING_SETTINGS_EVENT,
        } satisfies RealtimeConfig;
      })
      .catch(() => null);
  }
  return runtimeConfigPromise;
}

export function getRealtimeClient(): SupabaseClient | null {
  if (cachedClient !== undefined) return cachedClient;
  const config = envConfig();
  if (!config) {
    cachedClient = null;
    return cachedClient;
  }
  try {
    cachedClient = createClient(config.url, config.anonKey, {
      realtime: { params: { eventsPerSecond: 10 } },
    });
  } catch (err) {
    console.warn('[realtime] Failed to create Supabase client:', err);
    cachedClient = null;
  }
  return cachedClient;
}

export function isRealtimeConfigured(): boolean {
  return getRealtimeClient() !== null;
}

/** Resolve a client from either credential source. */
export async function ensureRealtimeClient(): Promise<{
  client: SupabaseClient;
  channel: string;
  event: string;
} | null> {
  const envClient = getRealtimeClient();
  const config = await resolveRealtimeConfig();
  if (envClient) {
    return {
      client: envClient,
      channel: config?.channel || LANDING_SETTINGS_CHANNEL,
      event: config?.event || LANDING_SETTINGS_EVENT,
    };
  }
  if (!config) return null;
  if (cachedClient === undefined || cachedClient === null) {
    try {
      cachedClient = createClient(config.url, config.anonKey, {
        realtime: { params: { eventsPerSecond: 10 } },
      });
    } catch (err) {
      console.warn('[realtime] Failed to create Supabase client:', err);
      cachedClient = null;
    }
  }
  if (!cachedClient) return null;
  return { client: cachedClient, channel: config.channel, event: config.event };
}

/**
 * Subscribe to landing content changes. Resolves an unsubscribe function that
 * removes every channel (must be called on component unmount).
 */
export async function subscribeLandingRealtime(
  handlers: LandingRealtimeHandlers
): Promise<() => void> {
  const resolved = await ensureRealtimeClient();
  if (!resolved) {
    handlers.onStatusChange?.('DISABLED');
    console.info('[realtime] Supabase Realtime not configured; using fetch + focus refetch fallback.');
    return () => {};
  }
  const { client: supabase, channel: CHANNEL, event: EVENT } = resolved;

  let settled = false;
  const reportStatus = (status: RealtimeStatus) => {
    if (!settled || status !== 'CONNECTING') {
      settled = true;
      handlers.onStatusChange?.(status);
    }
    console.info(`[realtime] ${CHANNEL} status: ${status}`);
  };

  const cleanups: Array<() => void> = [];
  const track = (channel: { unsubscribe: () => void }) => {
    cleanups.push(() => {
      try {
        channel.unsubscribe();
      } catch {
        /* ignore cleanup errors */
      }
    });
  };

  try {
    // 1. Broadcast invalidation published by the admin session after a
    //    confirmed FastAPI commit.
    const broadcast = supabase
      .channel(CHANNEL, {
        config: { broadcast: { self: false, ack: false } },
      })
      .on('broadcast', { event: EVENT }, ({ payload }) => {
        handlers.onSettingsUpdated((payload || {}) as SettingsUpdatedPayload);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') reportStatus('SUBSCRIBED');
        else if (status === 'CHANNEL_ERROR') reportStatus('CHANNEL_ERROR');
        else if (status === 'TIMED_OUT') reportStatus('TIMED_OUT');
        else if (status === 'CLOSED') reportStatus('CLOSED');
      });
    track(broadcast);

    // 2. Direct database changes (SQL editor / backfills). Each table gets
    //    its own channel so one failing subscription cannot break the other.
    const tables: Array<{ table: string; kind: 'settings' | 'ads' }> = [
      { table: 'platform_settings', kind: 'settings' },
      { table: 'advertisements', kind: 'ads' },
      { table: 'application_releases', kind: 'settings' },
    ];
    for (const { table, kind } of tables) {
      try {
        const ch = supabase
          .channel(`landing-${table}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table },
            () => {
              if (kind === 'settings') handlers.onSettingsUpdated({});
              else handlers.onAdsChanged();
            }
          )
          .subscribe();
        track(ch);
      } catch (err) {
        console.warn(`[realtime] postgres_changes subscribe failed for ${table}:`, err);
      }
    }
  } catch (err) {
    console.warn('[realtime] subscribe failed, falling back to fetch:', err);
    reportStatus('CHANNEL_ERROR');
  }

  let cleaned = false;
  return () => {
    if (cleaned) return;
    cleaned = true;
    for (const fn of cleanups) fn();
  };
}
