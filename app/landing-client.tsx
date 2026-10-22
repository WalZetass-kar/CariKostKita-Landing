'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faDownload,
  faSearch,
  faLocationDot,
  faHeart,
  faShieldHalved,
  faBolt,
  faLock,
  faCompass,
  faArrowsRotate,
  faFileLines,
  faSliders,
  faCube,
  faCheck,
  faBars,
  faXmark,
  faChevronDown,
  faChevronUp,
  faTriangleExclamation,
  faArrowRight,
  faUsers,
  faPhone,
  faEnvelope,
  faMapPin,
  faBullhorn,
  faStar,
} from '@fortawesome/free-solid-svg-icons';
import {
  faAndroid,
  faWhatsapp,
  faGithub,
  faInstagram,
  faFacebook,
  faTiktok,
  faYoutube,
  faLinkedin,
} from '@fortawesome/free-brands-svg-icons';
import { config } from '@fortawesome/fontawesome-svg-core';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  subscribeLandingRealtime,
  type RealtimeStatus,
  type SettingsUpdatedPayload,
} from '../lib/landing-realtime';

config.autoAddCss = false;

const publicApiUrl = (
  process.env.NEXT_PUBLIC_CARIKOSTKITA_API_URL ||
  'https://carikostkitafastapi.vercel.app'
).replace(/\/+$/, '');
const repo = 'https://github.com/WalZetass-kar/CariKostKita';

const ICON_MAP: Record<string, IconDefinition> = {
  shield: faShieldHalved,
  bolt: faBolt,
  lock: faLock,
  search: faSearch,
  file: faFileLines,
  'file-lines': faFileLines,
  location: faLocationDot,
  'location-dot': faLocationDot,
  sliders: faSliders,
  compass: faCompass,
  sync: faArrowsRotate,
  building: faBuilding,
  download: faDownload,
  heart: faHeart,
  users: faUsers,
  phone: faPhone,
  envelope: faEnvelope,
  mappin: faMapPin,
  bullhorn: faBullhorn,
  check: faCheck,
  star: faStar,
};

function resolveFaIcon(name?: string, fallback: IconDefinition = faCheck): IconDefinition {
  if (!name) return fallback;
  const clean = name.toLowerCase().replace(/^(fa-|icon-)/, '');
  return ICON_MAP[clean] || fallback;
}

/**
 * Append the settings revision to a remote media URL so replacing a file
 * (even under the same name/path) is reflected instantly instead of being
 * stuck behind browser/proxy image caches. Data/blob URLs are returned
 * untouched because query strings would corrupt them.
 */
function withRevision(url: string | undefined, revision: number): string {
  if (!url) return '';
  if (revision <= 0) return url;
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  const sep = url.includes('?') ? '&' : '?';
  if (new RegExp(`[?&]v=${revision}(?:&|$)`).test(url)) return url;
  return `${url}${sep}v=${revision}`;
}

/** Canonical signature of the pop-up content; dismissal is stored per signature. */
function popupSignatureOf(cfg: {
  popupTitle: string;
  popupContent: string;
  popupImageUrl: string;
  popupButtonLabel: string;
  popupButtonUrl: string;
}): string {
  return [
    cfg.popupTitle || '',
    cfg.popupContent || '',
    cfg.popupImageUrl || '',
    cfg.popupButtonLabel || '',
    cfg.popupButtonUrl || '',
  ].join('|');
}

function dismissPopupSignature(cfg: {
  popupTitle: string;
  popupContent: string;
  popupImageUrl: string;
  popupButtonLabel: string;
  popupButtonUrl: string;
}): void {
  try {
    sessionStorage.setItem('ckk_popup_dismissed_sig', popupSignatureOf(cfg));
  } catch (_) {
    /* storage unavailable: dismissal lasts for this view only */
  }
}

const Button = ({ apk, light = false, label = 'Download APK' }: { apk: string; light?: boolean; label?: string }) => (
  <a className={`download ${light ? 'download--light' : ''}`} href={apk} download>
    <FontAwesomeIcon icon={faDownload} />
    <span>{label}</span>
  </a>
);

import {
  defaultConfig,
  resolveSettings,
  type AppConfigState,
  type NavLinkItem,
  type TrustItem,
  type FeatureItem,
  type InstallStepItem,
  type OwnerStepItem,
  type FaqItem,
} from '../lib/landing-config';

interface PromoAd {
  id: string | number;
  title: string;
  description?: string;
  image?: string;
  image_url?: string;
  link?: string;
  target_url?: string;
}


async function safeParseResponse(res: Response | null | undefined) {
  if (!res || !res.ok) return null;
  try {
    const text = await res.text();
    if (!text || !text.trim()) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export default function LandingClient({
  initialSettings,
}: {
  initialSettings?: Record<string, any> | null;
}) {
  const [appConfig, setAppConfig] = useState<AppConfigState>(() =>
    resolveSettings(initialSettings, defaultConfig)
  );
  const [promoAds, setPromoAds] = useState<PromoAd[]>([]);
  // Realtime sync state: appliedRevisionRef is the source of truth for
  // dedupe + out-of-order guards (refs avoid stale closures in callbacks).
  const [settingsRevision, setSettingsRevision] = useState(0);
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>('CONNECTING');
  const appliedRevisionRef = useRef(0);
  // Content signature: the real guard against duplicate or out-of-order
  // deliveries. It works even when the store has no usable revision yet.
  const appliedContentRef = useRef<string>('');

  const fetchPromoAds = useCallback(async () => {
    try {
      const adsResult = await fetch('/api/ads', { cache: 'no-store' });
      const adsJson = await safeParseResponse(adsResult);
      if (adsJson) {
        setPromoAds(Array.isArray(adsJson.data) ? adsJson.data : []);
      }
    } catch (e) {
      console.error('Failed to fetch promo ads', e);
    }
  }, []);

  const fetchConfig = useCallback(async (reason = 'init') => {
      try {
        const [fullResult, proxyResult, settingsResult, releaseResult] = await Promise.allSettled([
          fetch(publicApiUrl + '/api/v1/public/settings', { cache: 'no-store' }),
          fetch('/api/settings', { cache: 'no-store' }),
          fetch(publicApiUrl + '/settings', { cache: 'no-store' }),
          fetch(publicApiUrl + '/latest-release', { cache: 'no-store' }),
        ]);
        const [fullJson, proxyJson, setJson, relJson] = await Promise.all([
          fullResult.status === 'fulfilled'
            ? safeParseResponse(fullResult.value)
            : Promise.resolve(null),
          proxyResult.status === 'fulfilled'
            ? safeParseResponse(proxyResult.value)
            : Promise.resolve(null),
          settingsResult.status === 'fulfilled'
            ? safeParseResponse(settingsResult.value)
            : Promise.resolve(null),
          releaseResult.status === 'fulfilled'
            ? safeParseResponse(releaseResult.value)
            : Promise.resolve(null),
        ]);

        // Merge settings: proxyJson contains live Admin-Gue + FastAPI merged configuration
        const full = {
          ...(fullJson?.data || {}),
          ...(proxyJson?.data || {}),
        };

        // Revision guard: ignore stale / duplicate deliveries so rapid
        // sequential admin saves always converge on the newest state.
        const incomingRevision = Number(full.revision ?? 0) || 0;
        if (incomingRevision > 0) {
          appliedRevisionRef.current = incomingRevision;
          setSettingsRevision(incomingRevision);
        }

        const isFalse = (val: any) => val === false || val === 'false' || val === 0 || val === '0';
        const isTrue = (val: any) => val === true || val === 'true' || val === 1 || val === '1';

        const popupActiveResolved = isFalse(full.popupActive) || isFalse(full.popup_active)
          ? false
          : (isTrue(full.popupActive) || isTrue(full.popup_active) ? true : false);

        // Signature-based dismissal: a previously dismissed pop-up must
        // reappear when the admin publishes new content, and must vanish
        // instantly (without relying on timers/storage) when deactivated.
        const nextPopupTitle = full.popupTitle ?? full.popup_title ?? '';
        const nextPopupContent = full.popupContent ?? full.popup_content ?? '';
        const nextPopupImage = full.popupImageUrl ?? full.popup_image_url ?? '';
        const nextPopupLabel = full.popupButtonLabel ?? full.popup_button_label ?? '';
        const nextPopupUrl = full.popupButtonUrl ?? full.popup_button_url ?? '';
        const popupSignature = [
          nextPopupTitle, nextPopupContent, nextPopupImage, nextPopupLabel, nextPopupUrl,
        ].join('|');
        if (popupActiveResolved) {
          try {
            const dismissedSig = sessionStorage.getItem('ckk_popup_dismissed_sig');
            if (dismissedSig !== popupSignature) {
              setShowPopupModal(true);
            }
          } catch (_) {
            setShowPopupModal(true);
          }
        } else {
          // Admin disabled/deleted the pop-up: hide immediately and drop any
          // pending visible state so it cannot resurrect from stale state.
          setShowPopupModal(false);
        }

        setAppConfig((current) => {
          const next = resolveSettings(full, current);
          // Only commit when the content really changed. This keeps duplicate
          // or out-of-order deliveries from re-rendering the page.
          const signature = JSON.stringify(next);
          if (reason !== 'init' && signature === appliedContentRef.current) {
            return current;
          }
          appliedContentRef.current = signature;
          return next;
        });
      } catch (e) {
        console.error('Failed to fetch dynamic settings', e);
      }
  }, [fetchPromoAds]);

  // Initial load: full settings + promo ads.
  useEffect(() => {
    fetchConfig('init');
    fetchPromoAds();
  }, [fetchConfig, fetchPromoAds]);

  // PRIMARY realtime path: Supabase Realtime broadcast (published by the
  // admin session only after FastAPI confirms the commit) + postgres_changes
  // for direct database edits. Selective state refresh, never a reload.
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let cancelled = false;
    subscribeLandingRealtime({
      onSettingsUpdated: (payload: SettingsUpdatedPayload) => {
        const incoming = Number(payload?.revision ?? 0) || 0;
        if (incoming > 0 && incoming <= appliedRevisionRef.current) return; // dedupe/out-of-order
        fetchConfig('realtime');
      },
      onAdsChanged: () => {
        fetchPromoAds();
      },
      onStatusChange: (status: RealtimeStatus) => {
        setRealtimeStatus(status);
      },
    }).then((fn) => {
      if (cancelled) {
        fn();
        return;
      }
      unsubscribe = fn;
    });
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [fetchConfig, fetchPromoAds]);

  // FALLBACK only (never the primary path): while Realtime is not
  // SUBSCRIBED, poll the lightweight version pointer every 10s and only
  // re-fetch the full document when the revision actually moved. When the
  // store has no usable revision yet, a full re-fetch runs every 30s so the
  // page still converges. Always re-validate when the tab becomes visible or
  // regains focus (covers reconnect/sleep gaps).
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') fetchConfig('visibility');
    };
    const onFocus = () => fetchConfig('focus');
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onFocus);
    let timer: ReturnType<typeof setInterval> | undefined;
    if (realtimeStatus !== 'SUBSCRIBED') {
      let ticks = 0;
      timer = setInterval(async () => {
        ticks += 1;
        try {
          const res = await fetch(publicApiUrl + '/api/v1/public/settings/version', {
            cache: 'no-store',
          });
          const json = await safeParseResponse(res);
          const revision = Number(json?.data?.revision ?? 0) || 0;
          if (revision > 0) {
            if (revision !== appliedRevisionRef.current) {
              await fetchConfig('fallback-poll');
            }
            return;
          }
        } catch {
          // A failed version check must never break the page.
        }
        // No usable revision: fall back to a full re-fetch every 30s.
        if (ticks % 3 === 0) await fetchConfig('fallback-poll');
      }, 10000);
    }
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onFocus);
      if (timer) clearInterval(timer);
    };
  }, [fetchConfig, realtimeStatus]);

  // Realtime client-side sync of document title, description, favicon, app icon, and OG image.
  // NOTE (browser limitation): updating the <link rel="icon"> href applies to
  // new navigations/tabs; browsers aggressively cache favicons per origin and
  // may keep showing the old icon until the user hard-refreshes or clears
  // site data. The revision query string below is the strongest signal a web
  // page can send "” it cannot force-invalidate the browser's favicon cache.
  useEffect(() => {
    if (appConfig.siteTitle) {
      document.title = appConfig.siteTitle;
    }
    if (appConfig.siteDescription) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', appConfig.siteDescription);
    }
    if (appConfig.metaKeywords) {
      let metaKw = document.querySelector('meta[name="keywords"]');
      if (!metaKw) {
        metaKw = document.createElement('meta');
        metaKw.setAttribute('name', 'keywords');
        document.head.appendChild(metaKw);
      }
      metaKw.setAttribute('content', appConfig.metaKeywords);
    }
    if (appConfig.faviconUrl) {
      let linkIcon = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
      if (!linkIcon) {
        linkIcon = document.createElement('link');
        linkIcon.setAttribute('rel', 'icon');
        document.head.appendChild(linkIcon);
      }
      linkIcon.setAttribute('href', withRevision(appConfig.faviconUrl, settingsRevision));
    }
    if (appConfig.appIconUrl) {
      let appleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement | null;
      if (!appleIcon) {
        appleIcon = document.createElement('link');
        appleIcon.setAttribute('rel', 'apple-touch-icon');
        document.head.appendChild(appleIcon);
      }
      appleIcon.setAttribute('href', withRevision(appConfig.appIconUrl, settingsRevision));
    }
    if (appConfig.ogImageUrl) {
      const ogImg = document.querySelector('meta[property="og:image"]');
      if (ogImg) ogImg.setAttribute('content', withRevision(appConfig.ogImageUrl, settingsRevision));
    }
  }, [appConfig.siteTitle, appConfig.siteDescription, appConfig.metaKeywords, appConfig.faviconUrl, appConfig.appIconUrl, appConfig.ogImageUrl, settingsRevision]);

  // A failed image load must not freeze the logo forever: retry the newest
  // URL as soon as the admin publishes a replacement.
  useEffect(() => {
    setLogoFailed(false);
  }, [appConfig.logoUrl]);
  useEffect(() => {
    setFooterLogoFailed(false);
  }, [appConfig.footerLogoUrl, appConfig.logoUrl]);

  // A dismissed announcement banner belongs to its content: show the banner
  // again automatically when the admin publishes a new message.
  const bannerSignature = `${appConfig.bannerText}|${appConfig.bannerLink}|${appConfig.bannerType}`;
  useEffect(() => {
    setBannerDismissed(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bannerSignature]);

  const apk = appConfig.apk;
  const waNumber = appConfig.waNumber;
  const waHelpUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Halo Admin ${appConfig.appName}, saya butuh informasi seputar aplikasi kost ${appConfig.targetCity}.`)}`;
  const waOwnerUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Halo Admin ${appConfig.appName}, saya pemilik kost di ${appConfig.targetCity} ingin mendaftarkan properti saya.`)}`;

  const [menu, setMenu] = useState(false);
  const [open, setOpen] = useState<number | null>(0);
  const [phoneFilter, setPhoneFilter] = useState('Semua');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showPopupModal, setShowPopupModal] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [footerLogoFailed, setFooterLogoFailed] = useState(false);
  const [heroMockupFailed, setHeroMockupFailed] = useState(false);
  const [installMockupFailed, setInstallMockupFailed] = useState(false);
  const [activeInstallStep, setActiveInstallStep] = useState(0);
  const [completedInstallSteps, setCompletedInstallSteps] = useState<number[]>([]);
  const [legalModal, setLegalModal] = useState<{ open: boolean; title: string; content: string }>({
    open: false,
    title: '',
    content: '',
  });

  const handleInstallStepClick = (stepIndex: number) => {
    // Langkah terakhir hanya menampilkan simulasi selesai; ia tidak boleh
    // me-reset progres karena mockup-nya benar-benar ada.
    setActiveInstallStep(stepIndex);
    setCompletedInstallSteps((completedSteps) =>
      completedSteps.includes(stepIndex)
        ? completedSteps
        : [...completedSteps, stepIndex]
    );
  };

  // Escape menutup modal yang sedang terbuka.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (legalModal.open) {
        setLegalModal({ open: false, title: '', content: '' });
      } else if (showModal) {
        setShowModal(false);
      } else if (showPopupModal) {
        setShowPopupModal(false);
        dismissPopupSignature(appConfig);
      } else if (menu) {
        setMenu(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [legalModal.open, showModal, showPopupModal, menu, appConfig]);

  useEffect(() => {
    const onScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        setScrollProgress((totalScroll / windowHeight) * 100);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    const observeAll = () => {
      document
        .querySelectorAll('.reveal-on-scroll:not(.is-visible)')
        .forEach((el) => observer.observe(el));
    };
    observeAll();

    // Konten CMS dimuat setelah halaman ter-render (mis. banner promo),
    // jadi elemen baru harus ikut diobservasi.
    const mutations = new MutationObserver(observeAll);
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
      mutations.disconnect();
    };
  }, []);

  // Filtered & mapped navigation links
  const activeNavLinks = (appConfig.navLinks || [])
    .filter((item) => item.is_active !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((item) => ({
      href: item.href || item.url || '#',
      label: item.label,
    }));

  // Dynamic Trust Items derived from appConfig
  const activeTrust = (appConfig.trustItems || [])
    .filter((item) => item.is_active !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((item) => ({
      icon: resolveFaIcon(item.icon, faShieldHalved),
      title: item.title,
      desc: item.desc,
    }));

  // Dynamic Features derived from appConfig
  const activeFeatures = (appConfig.featureItems || [])
    .filter((item) => item.is_active !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((item) => ({
      icon: resolveFaIcon(item.icon, faSearch),
      title: item.title,
      desc: item.desc,
    }));

  // Dynamic Install Steps
  const activeInstallSteps = (appConfig.installSteps || [])
    .filter((item) => item.is_active !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((item, idx) => ({
      n: item.step_number || item.n || String(idx + 1),
      t: item.title || item.t || `Langkah ${idx + 1}`,
      d: item.desc || item.d || '',
    }));

  // Dynamic Owner Steps
  const activeOwnerSteps = (appConfig.ownerSteps || [])
    .filter((item: any) => typeof item === 'string' || item.is_active !== false)
    .sort((a: any, b: any) => ((typeof a === 'object' && a?.order) || 0) - ((typeof b === 'object' && b?.order) || 0))
    .map((item: any) => (typeof item === 'string' ? item : item.title || item.text || ''));

  // Dynamic FAQs derived from appConfig
  const activeFaqs = (appConfig.faqItems || [])
    .filter((item) => item.is_active !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((item) => [item.question || item.q || '', item.answer || item.a || ''] as [string, string]);

  return (
    <div
      style={
        {
          '--maroon': appConfig.brandColor || '#790F13',
        } as React.CSSProperties
      }
    >
      <a className="skip-link" href="#konten-utama">Lewati ke konten utama</a>
      {/* Header */}
      <header className="site-header">
        <div className="shell nav-wrap">
          <a className="brand" href="#beranda">
            {appConfig.logoUrl && !logoFailed ? (
              <img
                src={withRevision(appConfig.logoUrl, settingsRevision)}
                alt=""
                onError={() => setLogoFailed(true)}
                style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 6 }}
              />
            ) : (
              <span className="brand__mark">
                <FontAwesomeIcon icon={faBuilding} />
              </span>
            )}
            {appConfig.appName}
          </a>

          <nav className="nav-links" aria-label="Navigasi utama">
            {activeNavLinks.map((item, i) => (
              <a className={i === 0 ? 'active' : ''} href={item.href} key={item.href + i}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="nav-download">
            <Button apk={apk} label={appConfig.heroCtaPrimaryLabel || 'Download APK'} />
          </div>

          <button
            className="menu-toggle"
            type="button"
            onClick={() => setMenu(!menu)}
            aria-label={menu ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            aria-expanded={menu}
            aria-controls="menu-seluler"
          >
            <FontAwesomeIcon icon={menu ? faXmark : faBars} />
          </button>
        </div>

        {menu && (
          <nav className="mobile-menu" id="menu-seluler" aria-label="Navigasi seluler">
            {activeNavLinks.map((item, i) => (
              <a href={item.href} key={item.href + i} onClick={() => setMenu(false)}>
                {item.label}
              </a>
            ))}
            <Button apk={apk} label={appConfig.heroCtaPrimaryLabel || 'Download APK'} />
          </nav>
        )}
      </header>
      <main id="konten-utama">
      {/* Scroll Progress Bar */}
      <div
        className="scroll-progress"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      {/* Indikator sinkronisasi konten: titik + label untuk mata, live
          region untuk pembaca layar. */}
      <p className="sync-status" role="status" aria-live="polite">
        <span className={`sync-dot sync-dot--${realtimeStatus === 'SUBSCRIBED' ? 'live' : 'idle'}`} aria-hidden="true" />
        <span className="sr-only">
          {realtimeStatus === 'SUBSCRIBED'
            ? 'Pembaruan Landing Page otomatis aktif.'
            : 'Pembaruan Landing Page otomatis tidak aktif; halaman diperbarui berkala.'}
        </span>
      </p>
      <p className="sr-only" role="status" aria-live="polite">
        {realtimeStatus === 'SUBSCRIBED'
          ? 'Pembaruan Landing Page otomatis aktif.'
          : 'Pembaruan Landing Page otomatis tidak aktif; halaman diperbarui berkala.'}
      </p>

      {/* Announcement Banner (Managed from Admin Dashboard) */}
      {appConfig.bannerActive && !bannerDismissed && appConfig.bannerText && (
        <div className={`announcement-banner announcement-banner--${appConfig.bannerType || 'promo'}`}>
          <div className="shell announcement-inner" style={{ position: 'relative' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <FontAwesomeIcon icon={faBullhorn} />
              {appConfig.bannerText}
            </span>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
              {appConfig.bannerLink && (
                <a href={appConfig.bannerLink} className="announcement-link">
                  Lihat Detail <FontAwesomeIcon icon={faArrowRight} />
                </a>
              )}
              <button
                type="button"
                onClick={() => setBannerDismissed(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  minWidth: 32,
                  minHeight: 32,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 6,
                  opacity: 0.85,
                  fontSize: 15,
                }}
                aria-label="Tutup Pengumuman"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Hero Section */}
      <section id="beranda" className="hero">
        <div className="hero__city" />
        <div className="hero__overlay" />
        <div className="shell hero__content">
          <div className="hero__copy">
            <p className="eyebrow eyebrow--light">{appConfig.appName.toUpperCase()} • {appConfig.targetCity.toUpperCase()}</p>
            <h1>
              {appConfig.heroHeadline || appConfig.tagline || `Temukan Kost Impianmu di ${appConfig.targetCity}`}
            </h1>
            <p className="hero__text">
              {appConfig.heroSubheadline || appConfig.heroText}
            </p>

            <div className="hero__actions">
              <Button apk={apk} label={appConfig.heroCtaPrimaryLabel || 'Download APK'} />
              <a className="outline-button" href={appConfig.heroCtaSecondaryLink || '#fitur'}>
                {appConfig.heroCtaSecondaryLabel || 'Lihat Fitur'} <FontAwesomeIcon icon={faArrowRight} />
              </a>
            </div>

            {/* Informasi pendukung: versi, syarat perangkat, ukuran, dan
                tautan panduan. Formatting diambil dari kelas supaya
                tetap konsisten di semua lebar layar. */}
            <div className="hero-spec">
              <span>
                <FontAwesomeIcon icon={faCube} />
                {appConfig.versionName || 'v1.1.1'}
              </span>
              <i className="dot" aria-hidden="true" />
              <span>
                <FontAwesomeIcon icon={faAndroid} />
                {appConfig.minAndroid || 'Android 8.0+'}
              </span>
              <i className="dot" aria-hidden="true" />
              <span>
                <FontAwesomeIcon icon={faBolt} />
                {appConfig.apkSize || '3.3 MB'}
              </span>
              <i className="dot" aria-hidden="true" />
              <span>
                <FontAwesomeIcon icon={faCheck} />
                {appConfig.heroAdFreeText || 'Bebas Iklan'}
              </span>
              {appConfig.securityModalActive && (
                <>
                  <i className="dot" aria-hidden="true" />
                  <button type="button" onClick={() => setShowModal(true)}>
                    Panduan Pasang APK
                  </button>
                </>
              )}
            </div>

            {/* Kartu melayang disembunyikan di layar kecil, jadi informasi
                badge-nya ditampilkan sebagai baris statis agar tidak hilang.
                Isinya sama dengan kartu melayang, bukan duplikat baris
                spesifikasi di atasnya. */}
            <div className="hero-badges-static">
              <span>
                <FontAwesomeIcon icon={faLocationDot} />
                {appConfig.heroBadge1 || `Lokasi dekat kampus & area strategis ${appConfig.targetCity}`}
              </span>
              {appConfig.heroBadge2 && (
                <span>
                  <FontAwesomeIcon icon={faBuilding} />
                  {appConfig.heroBadge2}
                </span>
              )}
            </div>

            <div className="trust-row">
              <span>
                <FontAwesomeIcon icon={faShieldHalved} />
                {appConfig.heroTrustBadge1 || 'Mudah Digunakan'}
              </span>
              <span>
                <FontAwesomeIcon icon={faCompass} />
                {appConfig.heroTrustBadge2 || 'Data Terpercaya'}
              </span>
              <span>
                <FontAwesomeIcon icon={faArrowsRotate} />
                {appConfig.heroTrustBadge3 || 'Update Rutin'}
              </span>
            </div>
          </div>

          <div className="hero__visual">
            <div className="soft-card soft-card--top">
              <FontAwesomeIcon icon={faLocationDot} style={{ marginRight: 6 }} />
              {appConfig.heroBadge1 || `Lokasi dekat kampus & area strategis ${appConfig.targetCity}`}
            </div>

            {/* 3D Smartphone with App UI Inside Screen */}
            <div className="hero-3d-phone">
              <img
                src={
                  appConfig.heroImageUrl && !heroMockupFailed
                    ? withRevision(appConfig.heroImageUrl, settingsRevision)
                    : phoneFilter === 'Putri'
                    ? '/mockup-hero-putri.webp'
                    : phoneFilter === 'Putra'
                    ? '/mockup-hero-putra.webp'
                    : phoneFilter === 'Campur'
                    ? '/mockup-hero-campur.webp'
                    : '/mockup-hero-semua.webp'
                }
                alt={`Tampilan aplikasi ${appConfig.appName} di layar smartphone`}
                className="hero-3d-img"
                onError={() => setHeroMockupFailed(true)}
              />
            </div>

            {/* Interactive Filter Pills Floating in Hero (Active when using default mockup) */}
            {(!appConfig.heroImageUrl || heroMockupFailed) && (
              <div className="hero-filter-selector" role="group" aria-labelledby="hero-filter-label">
                <span className="hero-filter-label" id="hero-filter-label">Kategori:</span>
                {(['Semua', 'Putri', 'Putra', 'Campur'] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPhoneFilter(key)}
                    className={`hero-filter-chip ${phoneFilter === key ? 'active' : ''}`}
                    aria-pressed={phoneFilter === key}
                  >
                    {key}
                  </button>
                ))}
              </div>
            )}

            <div className="soft-card soft-card--bottom">
              <FontAwesomeIcon icon={faHeart} style={{ marginRight: 6 }} />
              {appConfig.heroBadge2 || 'Detail kost & foto kamar lengkap'}
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Promotional Ads & Campaigns (Managed from Admin Dashboard) */}
      {promoAds.length > 0 && (
        <section className="promo-section reveal-on-scroll" aria-labelledby="promo-judul">
          <div className="shell">
            <p className="eyebrow">PROMOSI &amp; EVENT KHUSUS</p>
            <h2 id="promo-judul" className="promo-title">Penawaran Latest</h2>
            <div style={{ display: 'grid', gap: 16, marginTop: 20 }}>
              {promoAds.map((ad) => (
                <div key={ad.id} className="promo-banner-card">
                  <div className="promo-banner-content">
                    <h3 style={{ fontSize: 20, fontWeight: 700, margin: '6px 0 8px' }}>{ad.title}</h3>
                    {ad.description && <p style={{ fontSize: 13, color: '#655955', margin: 0, lineHeight: 1.6 }}>{ad.description}</p>}
                    {(ad.target_url || ad.link) && (
                      <div style={{ marginTop: 14 }}>
                        <a
                          href={ad.target_url || ad.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="download"
                          style={{ minHeight: 44, padding: '0 18px', fontSize: 13 }}
                        >
                          Kunjungi Penawaran <FontAwesomeIcon icon={faArrowRight} />
                        </a>
                      </div>
                    )}
                  </div>
                  {(ad.image_url || ad.image) && (
                    <img
                      src={withRevision((ad.image_url || ad.image) as string, settingsRevision)}
                      alt=""
                      className="promo-banner-img"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust Section with Scroll Animation */}
      <section className="section prerelease reveal-on-scroll">
        <div className="shell">
          <p className="eyebrow">UNDUH RESMI</p>
          <h2>Mengapa mengunduh {appConfig.appName} langsung dari sini?</h2>
          <p className="intro">Kenali manfaat dan jaminan keamanan sebelum memasang aplikasi di ponselmu.</p>

          <div className="trust-grid">
            {activeTrust.length === 0 && (
              <p className="empty-state">Belum ada poin kepercayaan yang ditampilkan.</p>
            )}
            {activeTrust.map((item) => (
              <article className="trust-card reveal-on-scroll" key={item.title}>
                <span className="icon-badge">
                  <FontAwesomeIcon icon={item.icon} />
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section with Scroll Animation */}
      <section id="fitur" className="section section--cream reveal-on-scroll">
        <div className="shell">
          <p className="eyebrow">FITUR APLIKASI</p>
          <h2>Fitur yang Kami Bangun untuk Memudahkan Anda</h2>
          <p className="intro">Pengalaman mencari kost di {appConfig.targetCity} yang sederhana, lengkap, dan mudah diandalkan.</p>

          <div className="feature-grid">
            {activeFeatures.length === 0 && (
              <p className="empty-state">Belum ada fitur yang ditampilkan.</p>
            )}
            {activeFeatures.map((item) => (
              <article className="feature-card reveal-on-scroll" key={item.title}>
                <span className="icon-badge">
                  <FontAwesomeIcon icon={item.icon} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Install Guide Section with Scroll Animation */}
      <section id="install" className="section install-section reveal-on-scroll">
        <div className="shell install-layout">
          {/* 3D Smartphone Mockup */}
          <div className="install-mockup-wrap">
            <div className="install-3d-phone">
              <img
                src={
                  installMockupFailed
                    ? '/mockup-install-1.webp'
                    : `/mockup-install-${activeInstallStep + 1}.webp`
                }
                alt={`Simulasi langkah ${activeInstallStep + 1}: ${
                  (activeInstallSteps[activeInstallStep]?.t) || 'Langkah Instalasi'
                }`}
                className="install-3d-img"
                onError={() => setInstallMockupFailed(true)}
              />
            </div>
          </div>

          <div>
            <p className="eyebrow">CARA INSTALL</p>
            <h2>Mudah Instal, Langsung Pakai</h2>
            <p className="intro">
              Ikuti langkah berikut untuk menginstal aplikasi {appConfig.appName} di perangkat Android kamu ({appConfig.minAndroid}). Klik tiap langkah untuk melihat simulasi layar di samping.
            </p>

            <div className="steps">
              {activeInstallSteps.map((stepItem, idx) => (
                <button
                  type="button"
                  className={`step install-step-card ${activeInstallStep === idx ? 'active' : ''} ${completedInstallSteps.includes(idx) ? 'is-complete' : ''}`}
                  key={stepItem.n + idx}
                  onClick={() => handleInstallStepClick(idx)}
                  disabled={completedInstallSteps.includes(idx)}
                  aria-pressed={activeInstallStep === idx}
                  aria-current={activeInstallStep === idx ? 'step' : undefined}
                  aria-label={`${stepItem.t}${completedInstallSteps.includes(idx) ? ' (sudah dipilih)' : ''}`}
                >
                  <span>{stepItem.n}</span>
                  <div>
                    <h3>{stepItem.t}</h3>
                    <p>{stepItem.d}</p>
                  </div>
                </button>
              ))}
            </div>

            {appConfig.releaseNotes && (
              <p style={{ margin: '14px 0 0', color: 'var(--muted, #655955)', fontSize: 13, lineHeight: 1.6 }}>
                {appConfig.releaseNotes}
              </p>
            )}

            <div className="install-actions">
              <Button apk={apk} label={appConfig.heroCtaPrimaryLabel || 'Download APK'} />
              {appConfig.securityModalActive && (
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--maroon)', fontWeight: 700, fontSize: 12, textDecoration: 'underline' }}
                >
                  Lihat Panduan Dialog Keamanan Android <FontAwesomeIcon icon={faArrowRight} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* For Boarding House Owners with Scroll Animation */}
      <section id="pemilik" className="section owner-section reveal-on-scroll">
        <div className="shell owner-layout">
          <div>
            <p className="eyebrow">KHUSUS PEMILIK KOST</p>
            <h2>{appConfig.ownerTitle || `Anda punya kost di ${appConfig.targetCity}?`}</h2>
            <p className="intro">
              {appConfig.ownerIntro || `Daftarkan kost Anda di ${appConfig.appName} agar lebih mudah ditemukan calon penyewa mahasiswa dan pekerja di ${appConfig.targetCity} tanpa komisi perantara.`}
            </p>
            <div style={{ marginTop: 28, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a
                className="download"
                style={{ background: '#25D366' }}
                href={waOwnerUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faWhatsapp} />
                <span>{appConfig.ownerWaLabel || 'Daftar via WhatsApp'}</span>
              </a>
              <Button apk={apk} light label={appConfig.ownerSecondaryLabel || 'Download Aplikasi'} />
            </div>
          </div>

          <ol>
            {activeOwnerSteps.length === 0 && (
              <li className="empty-state" style={{ display: 'block' }}>
                Belum ada langkah pendaftaran yang ditampilkan.
              </li>
            )}
            {activeOwnerSteps.map((x, i) => (
              <li key={i}>
                <span>{i + 1}</span>
                {x}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* About & FAQ with Scroll Animation */}
      <section id="tentang" className="section about-section reveal-on-scroll">
        <div className="shell about-layout">
          <div className="about-card">
            <div className="avatar">
              <FontAwesomeIcon icon={faUsers} />
            </div>
            <div>
              <p className="eyebrow">TENTANG KAMI</p>
              <h2>{appConfig.aboutTitle || `Dibangun untuk Kebutuhan Pencari Kost ${appConfig.targetCity}`}</h2>
              <p>
                {appConfig.aboutStory || `${appConfig.appName} adalah aplikasi yang dikembangkan untuk membantu masyarakat, terutama anak rantau dan mahasiswa, dalam mencari kost di ${appConfig.targetCity} dengan lebih mudah, cepat, dan terpercaya.`}
              </p>

              {/* Dynamic Company/Contact Info */}
              <div style={{ marginTop: 16, fontSize: 14, display: 'flex', flexDirection: 'column', gap: 10, color: 'var(--muted)' }}>
                {appConfig.address && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FontAwesomeIcon icon={faMapPin} style={{ color: 'var(--maroon)', fontSize: 15 }} />
                    <span>{appConfig.address}</span>
                  </div>
                )}
                {appConfig.contactPhone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FontAwesomeIcon icon={faPhone} style={{ color: 'var(--maroon)', fontSize: 15 }} />
                    <span>{appConfig.contactPhone}</span>
                  </div>
                )}
                {appConfig.supportEmail && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FontAwesomeIcon icon={faEnvelope} style={{ color: 'var(--maroon)', fontSize: 15 }} />
                    <span>{appConfig.supportEmail}</span>
                  </div>
                )}
              </div>

              <div className="social-links" style={{ marginTop: 16, flexWrap: 'wrap', gap: 14 }}>
                <a href={appConfig.githubUrl || repo} target="_blank" rel="noopener noreferrer" aria-label="GitHub" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <FontAwesomeIcon icon={faGithub} /> GitHub
                </a>
                <a href={waHelpUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#1ebe5d' }}>
                  <FontAwesomeIcon icon={faWhatsapp} /> WhatsApp
                </a>
                {appConfig.instagram && (
                  <a href={appConfig.instagram} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#E1306C' }}>
                    <FontAwesomeIcon icon={faInstagram} /> Instagram
                  </a>
                )}
                {appConfig.facebook && (
                  <a href={appConfig.facebook} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#1877F2' }}>
                    <FontAwesomeIcon icon={faFacebook} /> Facebook
                  </a>
                )}
                {appConfig.tiktok && (
                  <a href={appConfig.tiktok} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <FontAwesomeIcon icon={faTiktok} /> TikTok
                  </a>
                )}
                {appConfig.youtube && (
                  <a href={appConfig.youtube} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#FF0000' }}>
                    <FontAwesomeIcon icon={faYoutube} /> YouTube
                  </a>
                )}
                {appConfig.linkedin && (
                  <a href={appConfig.linkedin} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#0A66C2' }}>
                    <FontAwesomeIcon icon={faLinkedin} /> LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>

          <div id="faq" className="faq">
            <p className="eyebrow">FAQ</p>
            <h2>Pertanyaan yang Sering Diajukan</h2>
            {activeFaqs.length === 0 && (
              <p className="empty-state">Belum ada pertanyaan yang ditampilkan.</p>
            )}
            {activeFaqs.map(([q, a], i) => (
              <div className="faq-item" key={q + i}>
                <button
                  type="button"
                  onClick={() => setOpen(open === i ? null : i)}
                  aria-expanded={open === i}
                >
                  <span>{q}</span>
                  <b>
                    <FontAwesomeIcon icon={open === i ? faChevronUp : faChevronDown} style={{ fontSize: 13 }} />
                  </b>
                </button>
                {open === i && <p>{a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feedback Section with Scroll Animation */}
      {appConfig.feedbackActive !== false && (
        <section className="feedback reveal-on-scroll">
          <div className="shell">
            <p className="eyebrow">UJI COBA & MASUKAN</p>
            <h2>{appConfig.feedbackTitle || `Bantu kami menyempurnakan ${appConfig.appName}`}</h2>
            <p>
              {appConfig.feedbackDesc || `Menemukan bug atau punya usulan fitur untuk ${appConfig.appName}? Sampaikan masukan Anda langsung ke admin WhatsApp kami.`}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 22 }}>
              <a
                className="download"
                style={{ background: '#25D366' }}
                href={waHelpUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faWhatsapp} />
                <span>{appConfig.feedbackButtonLabel || 'Kirim Masukan via WhatsApp'}</span>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="final-cta reveal-on-scroll">
        <div className="shell final-cta__inner">
          <div>
            <p className="eyebrow eyebrow--light">{appConfig.finalCtaEyebrow || 'JANGAN TUNGGU LAGI!'}</p>
            <h2>{appConfig.finalCtaTitle || 'Yuk, Temukan Kost Terbaikmu Sekarang!'}</h2>
            <p>{appConfig.finalCtaDesc || `Download ${appConfig.appName} sekarang dan mulai pencarian kost impianmu di ${appConfig.targetCity}.`}</p>
          </div>
          <Button apk={apk} light label={appConfig.finalCtaButtonLabel || 'Download APK Sekarang'} />
        </div>
      </section>


      {/* Floating WhatsApp Quick Action */}
      <a
        href={waHelpUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-wa"
        title="Chat WhatsApp Bantuan"
        aria-label="Chat WhatsApp Bantuan"
      >
        <FontAwesomeIcon icon={faWhatsapp} size="lg" />
        <span>Bantuan WhatsApp</span>
      </a>

      {/* Pop-up Modal Dialog (Promotional / Announcement Pop-up) */}
      {appConfig.popupActive && showPopupModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowPopupModal(false);
            dismissPopupSignature(appConfig);
          }}
        >
          <div
            className="modal-box"
            role="dialog"
            aria-modal="true"
            aria-label={appConfig.popupTitle || 'Promo aplikasi'}
            style={{ maxWidth: 480, textAlign: 'center', padding: '24px 20px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => {
                setShowPopupModal(false);
                dismissPopupSignature(appConfig);
              }}
              aria-label="Tutup Dialog"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
            {appConfig.popupImageUrl && (
              <div style={{ marginBottom: 16, borderRadius: 10, overflow: 'hidden', maxHeight: 220 }}>
                <img
                  src={withRevision(appConfig.popupImageUrl, settingsRevision)}
                  alt={appConfig.popupTitle || ""}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}
            {appConfig.popupTitle && (
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--maroon)', marginBottom: 8 }}>
                {appConfig.popupTitle}
              </h3>
            )}
            {appConfig.popupContent && (
              <p style={{ fontSize: 13, color: '#463a35', lineHeight: 1.6, marginBottom: 18, whiteSpace: 'pre-wrap' }}>
                {appConfig.popupContent}
              </p>
            )}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              {appConfig.popupButtonLabel && appConfig.popupButtonUrl && (
                <a
                  className="download"
                  href={appConfig.popupButtonUrl}
                  target={appConfig.popupButtonUrl.startsWith('http') ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  onClick={() => {
                    setShowPopupModal(false);
                    dismissPopupSignature(appConfig);
                  }}
                >
                  {appConfig.popupButtonLabel}
                </a>
              )}
              <button
                type="button"
                className="download download--light"
                onClick={() => {
                  setShowPopupModal(false);
                  dismissPopupSignature(appConfig);
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Android Play Protect Modal */}
      {appConfig.securityModalActive && showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" role="dialog" aria-modal="true" aria-label={appConfig.securityModalTitle || 'Panduan Dialog Download Android'} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setShowModal(false)} aria-label="Tutup dialog panduan">
              <FontAwesomeIcon icon={faXmark} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--maroon)', fontWeight: 700, fontSize: 16 }}>
              <FontAwesomeIcon icon={faTriangleExclamation} color="#D97706" />
              <span>{appConfig.securityModalTitle || 'Panduan Dialog Download Android'}</span>
            </div>
            <p style={{ fontSize: 12, color: '#655955', marginTop: 10, lineHeight: 1.6 }}>
              {appConfig.securityModalDesc || 'Saat mengunduh berkas APK di luar Google Play Store, peramban (Chrome) akan menampilkan pesan standar keamanan:'}
            </p>
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', padding: '12px 14px', borderRadius: 8, fontSize: 12, marginTop: 10, color: '#92400E', lineHeight: 1.6 }}>
              <b>Langkah Mudah:</b>
              <br />
              1. Klik <b>&quot;Tetap Download&quot;</b> / <b>&quot;Download anyway&quot;</b>.
              <br />
              2. Buka berkas yang telah selesai diunduh.
              <br />
              3. Jika diminta izin sistem, aktifkan <b>&quot;Izinkan dari sumber ini&quot;</b>.
              <br />
              4. Klik <b>&quot;Instal&quot;</b> dan aplikasi siap digunakan!
            </div>
            <p style={{ fontSize: 12, color: '#6B605A', marginTop: 10 }}>
              {appConfig.securityModalNote || `Berkas APK ${appConfig.appName} (${appConfig.versionName}) 100% aman dan diverifikasi langsung dari repositori resmi proyek.`}
            </p>
            <div style={{ marginTop: 18, textAlign: 'right' }}>
              <a className="download" href={apk} onClick={() => setShowModal(false)}>
                Lanjut Download APK
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Legal Information Modal (Privacy Policy & Terms of Service) */}
      {legalModal.open && (
        <div className="modal-overlay" onClick={() => setLegalModal({ open: false, title: '', content: '' })}>
          <div className="modal-box" role="dialog" aria-modal="true" aria-label={legalModal.title || 'Informasi legal'} style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setLegalModal({ open: false, title: '', content: '' })} aria-label="Tutup dialog informasi">
              <FontAwesomeIcon icon={faXmark} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--maroon)', fontWeight: 700, fontSize: 16 }}>
              <FontAwesomeIcon icon={faFileLines} />
              <span>{legalModal.title}</span>
            </div>
            <div style={{ maxHeight: '60vh', overflowY: 'auto', marginTop: 14, fontSize: 13, lineHeight: 1.7, color: '#463a35', whiteSpace: 'pre-wrap', paddingRight: 6 }}>
              {legalModal.content || 'Konten belum diisi.'}
            </div>
            <div style={{ marginTop: 18, textAlign: 'right' }}>
              <button
                type="button"
                className="download"
                style={{ cursor: 'pointer' }}
                onClick={() => setLegalModal({ open: false, title: '', content: '' })}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      </main>
      {/* Footer */}
      <footer>
        <div className="shell footer-grid">
          <div>
            <a href="#beranda" className="brand">
              {(appConfig.footerLogoUrl || appConfig.logoUrl) && !footerLogoFailed ? (
                <img
                  src={withRevision(appConfig.footerLogoUrl || appConfig.logoUrl, settingsRevision)}
                  alt=""
                  onError={() => setFooterLogoFailed(true)}
                  style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 6 }}
                />
              ) : (
                <span className="brand__mark">
                  <FontAwesomeIcon icon={faBuilding} />
                </span>
              )}
              {appConfig.appName}
            </a>
            <p>{appConfig.footerTagline || appConfig.tagline || `Kost terbaik, untuk masa depanmu di ${appConfig.targetCity}.`}</p>
            {appConfig.address && <p style={{ fontSize: 12, marginTop: 4, opacity: 0.85 }}>{appConfig.address}</p>}

            <div style={{ display: 'flex', gap: 14, fontSize: 12, marginTop: 12, opacity: 0.85 }}>
              <button
                type="button"
                onClick={() => setLegalModal({ open: true, title: 'Kebijakan Privasi', content: appConfig.legalPrivacy })}
                style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Kebijakan Privasi
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setLegalModal({ open: true, title: 'Syarat & Ketentuan', content: appConfig.legalTerms })}
                style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Syarat & Ketentuan
              </button>
            </div>
          </div>

          <nav aria-label="Navigasi footer">
            {activeNavLinks.map((item, i) => (
              <a href={item.href} key={item.href + i}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="footer-social">
            <a href={appConfig.githubUrl || repo} target="_blank" rel="noopener noreferrer" title="GitHub" aria-label="GitHub">
              <FontAwesomeIcon icon={faGithub} size="lg" />
            </a>
            <a href={waHelpUrl} target="_blank" rel="noopener noreferrer" title="WhatsApp" aria-label="WhatsApp" style={{ color: '#25D366' }}>
              <FontAwesomeIcon icon={faWhatsapp} size="lg" />
            </a>
            {appConfig.instagram && (
              <a href={appConfig.instagram} target="_blank" rel="noopener noreferrer" title="Instagram" aria-label="Instagram" style={{ color: '#E1306C' }}>
                <FontAwesomeIcon icon={faInstagram} size="lg" />
              </a>
            )}
            {appConfig.facebook && (
              <a href={appConfig.facebook} target="_blank" rel="noopener noreferrer" title="Facebook" aria-label="Facebook" style={{ color: '#1877F2' }}>
                <FontAwesomeIcon icon={faFacebook} size="lg" />
              </a>
            )}
            {appConfig.tiktok && (
              <a href={appConfig.tiktok} target="_blank" rel="noopener noreferrer" title="TikTok" aria-label="TikTok">
                <FontAwesomeIcon icon={faTiktok} size="lg" />
              </a>
            )}
            {appConfig.youtube && (
              <a href={appConfig.youtube} target="_blank" rel="noopener noreferrer" title="YouTube" aria-label="YouTube" style={{ color: '#FF0000' }}>
                <FontAwesomeIcon icon={faYoutube} size="lg" />
              </a>
            )}
            {appConfig.linkedin && (
              <a href={appConfig.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn" aria-label="LinkedIn" style={{ color: '#0A66C2' }}>
                <FontAwesomeIcon icon={faLinkedin} size="lg" />
              </a>
            )}
          </div>
        </div>
        <div className="shell copyright">{appConfig.footerCopyright || `© 2026 ${appConfig.appName}. All rights reserved.`}</div>
      </footer>
    </div>
  );
}
