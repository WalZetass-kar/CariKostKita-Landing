'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faDownload,
  faSearch,
  faLocationDot,
  faShieldHalved,
  faBolt,
  faLock,
  faCompass,
  faArrowsRotate,
  faFileLines,
  faSliders,
  faCheck,
  faBars,
  faXmark,
  faChevronDown,
  faChevronUp,
  faArrowRight,
  faUsers,
  faPhone,
  faEnvelope,
  faMapPin,
  faStar,
  faCalendarCheck,
  faPlug,
  faBed,
  faBath,
  faWifi,
  faMotorcycle,
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
import {
  defaultConfig,
  resolveSettings,
  type AppConfigState,
  type NavLinkItem,
  type TrustItem,
  type FeatureItem,
  type FaqItem,
} from '../lib/landing-config';

config.autoAddCss = false;

const rawApiUrl =
  process.env.NEXT_PUBLIC_CARIKOSTKITA_API_URL ||
  process.env.CARIKOSTKITA_API_URL ||
  'https://api.carikostkita.my.id';

const publicApiUrl = (
  rawApiUrl.includes('carikostkitafastapi.vercel.app')
    ? 'https://api.carikostkita.my.id'
    : rawApiUrl
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
  users: faUsers,
  phone: faPhone,
  envelope: faEnvelope,
  mappin: faMapPin,
  check: faCheck,
  star: faStar,
  calendar: faCalendarCheck,
  plug: faPlug,
  bed: faBed,
  bath: faBath,
  wifi: faWifi,
  motorcycle: faMotorcycle,
  whatsapp: faWhatsapp as unknown as IconDefinition,
};

function resolveFaIcon(name?: string, fallback: IconDefinition = faCheck): IconDefinition {
  if (!name) return fallback;
  const clean = name.toLowerCase().replace(/^(fa-|icon-)/, '');
  return ICON_MAP[clean] || fallback;
}

function withRevision(url: string | undefined, revision: number): string {
  if (!url) return '';
  if (revision <= 0) return url;
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  const sep = url.includes('?') ? '&' : '?';
  if (new RegExp(`[?&]v=${revision}(?:&|$)`).test(url)) return url;
  return `${url}${sep}v=${revision}`;
}

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
  } catch (_) {}
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

interface KostListing {
  id: number | string;
  name?: string;
  nama_kost?: string;
  district?: string;
  kecamatan?: string;
  city?: string;
  kota?: string;
  address?: string;
  alamat?: string;
  tipe_kost?: string;
  gender_type?: string;
  price?: number;
  harga?: number;
  price_min?: number;
  top_facilities?: string[];
  facilities?: string[] | any;
  thumbnail_url?: string | null;
  image_urls?: string[];
  verification_status?: string;
}

export default function LandingClient({
  initialSettings,
  initialAds = [],
}: {
  initialSettings?: Record<string, any> | null;
  initialAds?: any[];
}) {
  const [appConfig, setAppConfig] = useState<AppConfigState>(() =>
    resolveSettings(initialSettings, defaultConfig)
  );
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>('CONNECTING');
  const [settingsRevision, setSettingsRevision] = useState(0);
  const appliedRevisionRef = useRef(0);
  const appliedContentRef = useRef<string>('');

  // UI state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPopupModal, setShowPopupModal] = useState(false);
  const [legalModal, setLegalModal] = useState<{ open: boolean; title: string; content: string }>({
    open: false,
    title: '',
    content: '',
  });

  // Accommodations state
  const [kosts, setKosts] = useState<KostListing[]>([]);
  const [loadingKosts, setLoadingKosts] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PUTRA' | 'PUTRI' | 'CAMPUR'>('ALL');

  // App Showcase state
  const [selectedShowcaseIndex, setSelectedShowcaseIndex] = useState(0);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [ads, setAds] = useState<any[]>(initialAds || []);

  const activePopupAd = useMemo(() => {
    return (ads || []).find(
      (a) =>
        (String(a.ad_type || '').toLowerCase() === 'pop-up' ||
          String(a.ad_type || '').toLowerCase() === 'popup' ||
          String(a.position || '').toLowerCase().includes('buka')) &&
        a.is_active !== false
    );
  }, [ads]);

  const activePopupAdRef = useRef<any>(null);
  activePopupAdRef.current = activePopupAd;

  useEffect(() => {
    if (activePopupAd) {
      try {
        const sig = `ckk_ad_popup_${activePopupAd.id}_${activePopupAd.title}`;
        const dismissed = sessionStorage.getItem('ckk_ad_popup_dismissed');
        if (dismissed !== sig) {
          setShowPopupModal(true);
        }
      } catch (_) {
        setShowPopupModal(true);
      }
    }
  }, [activePopupAd]);

  const handleClosePopup = useCallback(() => {
    setShowPopupModal(false);
    if (activePopupAd) {
      try {
        sessionStorage.setItem('ckk_ad_popup_dismissed', `ckk_ad_popup_${activePopupAd.id}_${activePopupAd.title}`);
      } catch (_) {}
    }
    dismissPopupSignature(appConfig);
  }, [activePopupAd, appConfig]);

  // Fallback images
  const localRoomImages = [
    '/rooms/kost-room-1.jpg',
    '/rooms/kost-room-2.jpg',
    '/rooms/kost-room-3.jpg',
    '/rooms/kost-room-4.jpg',
    '/rooms/kost-room-5.jpg',
    '/rooms/kost-room-6.jpg',
  ];

  const showcaseFeatures = [
    {
      title: 'Filter Radius Kampus & Landmark',
      desc: 'Cari hunian terdekat dari kampus UNRI Panam, UIR Marpoyan, UIN Suska, atau area perkantoran Kota Pekanbaru dalam radius presisi.',
      mockup: '/mockup-hero-semua.webp',
      icon: faLocationDot,
    },
    {
      title: 'Transparansi Biaya & Listrik All-in',
      desc: 'Ketahui detail fasilitas sejak awal: apakah listrik sudah termasuk (all-in) atau menggunakan token mandiri 900W.',
      mockup: '/mockup-hero-putra.webp',
      icon: faBolt,
    },
    {
      title: 'Fitur Roommate Matchmaker',
      desc: 'Cari calon teman sekamar yang satu kampus dan satu jurusan dengan preferensi hobi serta budget seimbang untuk hemat biaya.',
      mockup: '/mockup-hero-putri.webp',
      icon: faUsers,
    },
    {
      title: 'Kontak Langsung Pemilik via WhatsApp',
      desc: 'Terhubung ke pemilik sah kost dalam 1 ketukan tanpa potongan komisi calo atau biaya administrasi perantara sepeser pun.',
      mockup: '/mockup-hero-campur.webp',
      icon: faWhatsapp,
    },
  ];

  // Fetch kosts from API
  const fetchKosts = useCallback(async (filter: 'ALL' | 'PUTRA' | 'PUTRI' | 'CAMPUR') => {
    setLoadingKosts(true);
    try {
      const filterParam = filter === 'ALL' ? '' : `&tipe_kost=${filter}`;
      const res = await fetch(`/api/kost?page_size=8${filterParam}`, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setKosts(Array.isArray(json.data) ? json.data : []);
      }
    } catch (e) {
      console.error('Failed to fetch accommodations', e);
    } finally {
      setLoadingKosts(false);
    }
  }, []);

  // Fetch ads from API
  const fetchAds = useCallback(async () => {
    try {
      const res = await fetch('/api/ads', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data) && json.data.length > 0) {
          setAds(json.data);
        } else {
          setAds([]);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch ads', e);
    }
  }, []);

  useEffect(() => {
    fetchKosts(activeFilter);
    fetchAds();
  }, [activeFilter, fetchKosts, fetchAds]);

  // Fetch configuration
  const fetchConfig = useCallback(async (reason = 'init') => {
    try {
      const [fullResult, proxyResult] = await Promise.allSettled([
        fetch(publicApiUrl + '/api/v1/public/settings', { cache: 'no-store' }),
        fetch('/api/settings', { cache: 'no-store' }),
      ]);
      const [fullJson, proxyJson] = await Promise.all([
        fullResult.status === 'fulfilled' ? safeParseResponse(fullResult.value) : Promise.resolve(null),
        proxyResult.status === 'fulfilled' ? safeParseResponse(proxyResult.value) : Promise.resolve(null),
      ]);

      const full = {
        ...(fullJson?.data || {}),
        ...(proxyJson?.data || {}),
      };

      const incomingRevision = Number(full.revision ?? 0) || 0;
      if (incomingRevision > 0) {
        appliedRevisionRef.current = incomingRevision;
        setSettingsRevision(incomingRevision);
      }

      const isFalse = (val: any) => val === false || val === 'false' || val === 0 || val === '0';
      const isTrue = (val: any) => val === true || val === 'true' || val === 1 || val === '1';

      const popupActiveResolved =
        isFalse(full.popupActive) || isFalse(full.popup_active)
          ? false
          : isTrue(full.popupActive) || isTrue(full.popup_active)
          ? true
          : false;

      const nextPopupTitle = full.popupTitle ?? full.popup_title ?? '';
      const nextPopupContent = full.popupContent ?? full.popup_content ?? '';
      const nextPopupImage = full.popupImageUrl ?? full.popup_image_url ?? '';
      const nextPopupLabel = full.popupButtonLabel ?? full.popup_button_label ?? '';
      const nextPopupUrl = full.popupButtonUrl ?? full.popup_button_url ?? '';
      const popupSignature = [
        nextPopupTitle,
        nextPopupContent,
        nextPopupImage,
        nextPopupLabel,
        nextPopupUrl,
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
      } else if (!activePopupAdRef.current) {
        setShowPopupModal(false);
      }

      setAppConfig((current) => {
        const next = resolveSettings(full, current);
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
  }, []);

  useEffect(() => {
    fetchConfig('init');
  }, [fetchConfig]);

  // Dynamic browser tab favicon updater from Admin-Gue
  useEffect(() => {
    if (appConfig.faviconUrl && typeof document !== 'undefined') {
      const link = (document.querySelector("link[rel*='icon']") as HTMLLinkElement) || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = appConfig.faviconUrl;
      document.getElementsByTagName('head')[0]?.appendChild(link);
    }
  }, [appConfig.faviconUrl]);

  // Realtime subscription
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let cancelled = false;

    subscribeLandingRealtime({
      onSettingsUpdated: (payload: SettingsUpdatedPayload) => {
        const incoming = Number(payload?.revision ?? 0) || 0;
        if (incoming > 0 && incoming <= appliedRevisionRef.current) return;
        fetchConfig('realtime');
      },
      onAdsChanged: () => {},
      onStatusChange: (status: RealtimeStatus) => {
        if (!cancelled) setRealtimeStatus(status);
      },
    }).then((unsub) => {
      if (cancelled) {
        if (unsub) unsub();
      } else {
        unsubscribe = unsub;
      }
    });

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, [fetchConfig]);

  // Periodic poll + window focus listener as reliable realtime fallback
  useEffect(() => {
    const onFocus = () => {
      fetchConfig('focus');
      fetchAds();
    };
    window.addEventListener('focus', onFocus);
    const interval = setInterval(() => {
      fetchConfig('poll');
      fetchAds();
    }, 15000);

    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, [fetchConfig, fetchAds]);

  // Scroll listener
  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Escape key listener for modals
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (legalModal.open) setLegalModal({ open: false, title: '', content: '' });
        else if (showModal) setShowModal(false);
        else if (showPopupModal) handleClosePopup();
        else if (mobileMenuOpen) setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [legalModal.open, showModal, showPopupModal, mobileMenuOpen, handleClosePopup]);

  const apk = appConfig.apk || '/releases/CariKostKita-v1.3.6-release.apk';
  const waNumber = appConfig.waNumber || '6285272160879';
  const waHelpUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Halo Admin ${appConfig.appName}, saya ingin bertanya mengenai pencarian kost di ${appConfig.targetCity}.`
  )}`;
  const waOwnerUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Halo Admin ${appConfig.appName}, saya pemilik properti di ${appConfig.targetCity} ingin mendaftarkan unit kost saya.`
  )}`;

  const handleDownloadClick = () => {
    setShowModal(true);
  };

  const formatPrice = (priceVal?: number) => {
    if (!priceVal || priceVal <= 0) return 'Hubungi Pemilik';
    return `Rp ${priceVal.toLocaleString('id-ID')}`;
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-[#FCFAF5]"
      style={{ '--brand': appConfig.brandColor || '#790F13' } as React.CSSProperties}
    >
      {/* -------------------------------- Top Promo Banner (CMS Announcement) */}
      {appConfig.bannerActive && appConfig.bannerText ? (
        <aside
          role="region"
          aria-label="Pengumuman Penting"
          className="bg-[var(--brand)] text-white text-xs sm:text-sm font-semibold py-2 px-4 text-center flex items-center justify-center gap-2 z-50 relative shadow-xs"
        >
          <span>{appConfig.bannerText}</span>
          {appConfig.bannerLink && (
            <a
              href={appConfig.bannerLink}
              className="underline hover:opacity-90 ml-1 inline-flex items-center gap-1 font-bold"
            >
              Lihat Selengkapnya &rarr;
            </a>
          )}
        </aside>
      ) : ads.length > 0 && ads[0] ? (
        <aside
          role="region"
          aria-label={ads[0].title || "Iklan Promosi"}
          className="bg-amber-50 border-b border-amber-200 text-amber-900 text-xs sm:text-sm py-2 px-4 z-40 relative shadow-xs"
        >
          <div className="shell flex items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-2 truncate">
              <span className="bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide shrink-0">Iklan</span>
              <span className="font-bold truncate">{ads[0].title}</span>
            </div>
            {ads[0].target_url && (
              <a
                href={ads[0].target_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-maroon hover:underline shrink-0 text-xs sm:text-sm"
              >
                <span>Lihat Promo</span>
                &rarr;
              </a>
            )}
          </div>
        </aside>
      ) : null}

      {/* ------------------------------------------------------------- Header */}
      <header className={`site-header ${isScrolled ? 'site-header--scrolled' : ''}`}>
        <div className="shell">
          <div className="nav-wrap">
            <a href="#" className="brand" aria-label="Beranda CariKostKita">
              <div className="brand__mark overflow-hidden">
                {appConfig.logoUrl ? (
                  <img
                    src={appConfig.logoUrl}
                    alt={appConfig.appName || 'Logo CariKostKita'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FontAwesomeIcon icon={faBuilding} />
                )}
              </div>
              <div className="brand__text">
                <span>{appConfig.appName || 'CariKostKita'}</span>
              </div>
            </a>

            {/* Desktop Navigation */}
            <nav className="nav-links" aria-label="Navigasi Utama">
              <a href="#akomodasi">Akomodasi</a>
              <a href="#aplikasi">Fitur App</a>
              <a href="#cara-kerja">Cara Kerja</a>
              <a href="#faq">FAQ</a>
            </nav>

            {/* Desktop Download Action */}
            <div className="hidden lg:flex items-center gap-3">
              <a
                href={apk}
                className="btn-primary"
                onClick={handleDownloadClick}
                download
              >
                <FontAwesomeIcon icon={faDownload} />
                <span>Download APK ({appConfig.versionName || 'v1.3.6'})</span>
              </a>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
            >
              <FontAwesomeIcon icon={mobileMenuOpen ? faXmark : faBars} />
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <nav className="mobile-nav-drawer lg:hidden" aria-label="Navigasi Mobile">
            <a href="#akomodasi" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Akomodasi
            </a>
            <a href="#aplikasi" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Fitur Aplikasi
            </a>
            <a href="#cara-kerja" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Cara Kerja
            </a>
            <a href="#statistik" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Statistik
            </a>
            <a href="#kepercayaan" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Kepercayaan
            </a>
            <a href="#pemilik" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Untuk Pemilik Kost
            </a>
            <a href="#faq" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
              Pertanyaan (FAQ)
            </a>
            <div className="pt-2">
              <a
                href={apk}
                className="btn-primary w-full text-center"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleDownloadClick();
                }}
                download
              >
                <FontAwesomeIcon icon={faDownload} />
                <span>Download APK ({appConfig.versionName || 'v1.3.6'})</span>
              </a>
            </div>
          </nav>
        )}
      </header>

      {/* ------------------------------------------------------- Hero Section */}
      <section className="hero-section">
        <div className="hero-city-bg" />
        <div className="shell">
          <div className="hero-grid">
            {/* Left Editorial Copy */}
            <div>
              <h1 className="hero-title">
                {appConfig.heroHeadline && appConfig.heroHeadline !== 'Temukan Kost Nyaman & Terpercaya di Pekanbaru'
                  ? appConfig.heroHeadline
                  : 'Temukan Tempat Tinggal yang Terasa Seperti Rumah.'}
              </h1>

              <p className="hero-subtitle">
                {appConfig.heroSubheadline && !appConfig.heroSubheadline.startsWith('CariKostKita hadir')
                  ? appConfig.heroSubheadline
                  : 'Jelajahi berbagai pilihan kost di Pekanbaru dengan informasi lengkap, lokasi jelas, dan kemudahan menemukan tempat tinggal yang tepat.'}
              </p>

              {/* CTAs */}
              <div className="hero-actions">
                <a
                  href={apk}
                  className="btn-primary"
                  onClick={handleDownloadClick}
                  download
                >
                  <FontAwesomeIcon icon={faDownload} />
                  <span>Download Aplikasi APK</span>
                </a>

                <a href="#akomodasi" className="btn-hero-outline">
                  <span>Jelajahi Kost</span>
                  <FontAwesomeIcon icon={faArrowRight} />
                </a>
              </div>

              {/* Specs Meta */}
              <div className="hero-meta">
                <span className="hero-meta-item">
                  <FontAwesomeIcon icon={faAndroid} className="text-amber-300" />
                  <span>Versi {appConfig.versionName || 'v1.3.6'}</span>
                </span>
                <span className="hero-meta-dot" />
                <span className="hero-meta-item">{appConfig.apkSize || '3.5 MB'}</span>
                <span className="hero-meta-dot" />
                <span className="hero-meta-item">{appConfig.minAndroid || 'Android 8.0+'}</span>
                <span className="hero-meta-dot" />
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="text-amber-200 font-bold underline cursor-pointer hover:text-white transition-colors"
                >
                  Panduan Pasang APK
                </button>
              </div>

              {/* Area Quick Tags */}
              <div className="hero-tags">
                <span className="hero-tags-label">Area Kampus:</span>
                {[
                  'UNRI Panam',
                  'UIR Marpoyan',
                  'UIN Suska',
                  'Sukajadi',
                  'Payung Sekaki',
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="hero-tag-pill"
                    onClick={() => {
                      const el = document.getElementById('akomodasi');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Visual Phone Mockup Composition */}
            <div className="hero-visual-wrap">
              <div className="hero-visual-canvas">
                {/* Smartphone Phone Frame */}
                <div className="hero-phone-frame">
                  <Image
                    src="/mockup-hero-semua.webp"
                    alt="Pratinjau Aplikasi CariKostKita"
                    width={275}
                    height={560}
                    priority
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------- Promotional Ads / Sponsored Banners */}
      {ads.length > 0 && (
        <section className="py-6 bg-[#F9F7F2] border-y border-[#ECE7DA]" aria-label="Iklan dan Promosi">
          <div className="shell">
            <div className="space-y-4">
              {ads.map((ad, idx) => (
                <div
                  key={ad.id || idx}
                  className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#790F13] via-[#8B1A1E] to-[#45090B] text-white shadow-md flex flex-col md:flex-row items-center justify-between p-5 md:p-6 gap-6"
                >
                  <div className="flex-1 space-y-2 text-center md:text-left z-10">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-amber-400 text-stone-950 shadow-xs">
                      <span>Promosi Pilihan</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                      {ad.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-200 line-clamp-2 max-w-xl">
                      {ad.description ||
                        'Dapatkan promo kost hemat awal tahun dengan harga terjangkau dan fasilitas terbaik di Pekanbaru.'}
                    </p>
                    {ad.target_url && (
                      <div className="pt-2">
                        <a
                          href={ad.target_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-stone-950 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all transform hover:-translate-y-0.5"
                        >
                          <span>Lihat Promo Selengkapnya</span>
                          &rarr;
                        </a>
                      </div>
                    )}
                  </div>
                  {ad.image_url && (
                    <div className="w-full md:w-80 h-44 rounded-xl overflow-hidden shadow-lg shrink-0 border-2 border-white/20 z-10 bg-stone-900">
                      <img
                        src={ad.image_url}
                        alt={ad.title}
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --------------------------------------- Featured Accommodations Section */}
      <section id="akomodasi" className="section section--white">
        <div className="shell">
          <div className="section-header">
            <h2 className="section-title">Koleksi Kost Unggulan di Pekanbaru</h2>
            <p className="section-description">
              Data akomodasi riil dari sistem CariKostKita: informasi harga transparan, kelengkapan fasilitas kamar, dan dokumentasi foto riil.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="accommodations-filter-bar">
            <div className="filter-tabs">
              {(
                [
                  { key: 'ALL', label: 'Semua Kost' },
                  { key: 'PUTRA', label: 'Kost Putra' },
                  { key: 'PUTRI', label: 'Kost Putri' },
                  { key: 'CAMPUR', label: 'Kost Campur' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`filter-tab ${activeFilter === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveFilter(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="text-sm font-semibold text-[#74827C]">
              Menampilkan {kosts.length} listing terverifikasi
            </div>
          </div>

          {/* Listings Grid */}
          {loadingKosts ? (
            <div className="kost-grid">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="kost-card animate-pulse">
                  <div className="kost-card-image-wrap bg-[#E8ECE9]" />
                  <div className="kost-card-body">
                    <div className="h-4 bg-[#E8ECE9] rounded w-1/3 mb-3" />
                    <div className="h-6 bg-[#E8ECE9] rounded w-4/5 mb-4" />
                    <div className="flex gap-2 mb-4">
                      <div className="h-5 bg-[#E8ECE9] rounded w-16" />
                      <div className="h-5 bg-[#E8ECE9] rounded w-20" />
                    </div>
                    <div className="h-6 bg-[#E8ECE9] rounded w-1/2 mt-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : kosts.length > 0 ? (
            <div className="kost-grid">
              {kosts.map((item, idx) => {
                const title = item.name || item.nama_kost || 'Hunian Kost Pekanbaru';
                const district = item.district || item.kecamatan || 'Pekanbaru';
                const gender = (item.tipe_kost || item.gender_type || 'CAMPUR').toUpperCase();
                const priceVal = item.price || item.harga || item.price_min || 0;
                const facilities =
                  item.top_facilities && item.top_facilities.length > 0
                    ? item.top_facilities
                    : Array.isArray(item.facilities)
                    ? item.facilities.slice(0, 3)
                    : ['Kamar Mandi Dalam', 'Parkir Motor'];
                const photoSrc =
                  item.thumbnail_url && item.thumbnail_url.trim() !== ''
                    ? item.thumbnail_url
                    : localRoomImages[idx % localRoomImages.length];

                return (
                  <article key={item.id} className="kost-card">
                    {/* Thumbnail Image */}
                    <div className="kost-card-image-wrap">
                      <Image
                        src={photoSrc}
                        alt={`Foto kamar ${title}`}
                        width={400}
                        height={250}
                        className="kost-card-img"
                        unoptimized
                      />

                      {/* Top Badges */}
                      <div className="kost-card-badges">
                        <span
                          className={`badge-gender ${
                            gender === 'PUTRI'
                              ? 'badge-gender--putri'
                              : gender === 'PUTRA'
                              ? 'badge-gender--putra'
                              : 'badge-gender--campur'
                          }`}
                        >
                          {gender === 'PUTRI' ? 'Putri' : gender === 'PUTRA' ? 'Putra' : 'Campur'}
                        </span>

                        <span className="badge-verified">
                          <FontAwesomeIcon icon={faShieldHalved} />
                          <span>Terverifikasi</span>
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="kost-card-body">
                      <div className="kost-card-location">
                        <FontAwesomeIcon icon={faLocationDot} />
                        <span>Kec. {district}, Pekanbaru</span>
                      </div>

                      <h3 className="kost-card-title" title={title}>
                        {title}
                      </h3>

                      {/* Facility Pills */}
                      <div className="kost-card-facilities">
                        {facilities.map((fac: string, fIdx: number) => (
                          <span key={fIdx} className="kost-card-facility-pill">
                            {fac}
                          </span>
                        ))}
                      </div>

                      {/* Footer & Price */}
                      <div className="kost-card-footer">
                        <div>
                          <div className="kost-card-price-label">Mulai dari</div>
                          <div className="kost-card-price-val">
                            {formatPrice(priceVal)}
                            <span className="kost-card-price-unit"> / bln</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="kost-card-action-btn"
                          onClick={() => setShowModal(true)}
                        >
                          Detail di App
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-[#F6F6F2] rounded-2xl border border-[#E8ECE9]">
              <div className="w-12 h-12 rounded-full bg-[#E8ECE9] flex items-center justify-center mx-auto mb-4 text-[#74827C]">
                <FontAwesomeIcon icon={faSearch} />
              </div>
              <h3 className="text-lg font-bold text-[#111815] mb-1">
                Tidak ada kost ditemukan untuk kategori ini
              </h3>
              <p className="text-sm text-[#74827C] mb-4">
                Silakan pilih kategori lain atau telusuri seluruh koleksi kost kami.
              </p>
              <button
                type="button"
                className="btn-secondary text-sm"
                onClick={() => setActiveFilter('ALL')}
              >
                Tampilkan Semua Kost
              </button>
            </div>
          )}

          {/* Bottom Callout */}
          <div className="mt-12 p-8 bg-[#FDF2F2] border border-[#F0CECE] rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-[var(--brand)] mb-1">
                Ingin melihat 1.160+ pilihan kost lainnya di seluruh area Pekanbaru?
              </h3>
              <p className="text-sm text-[#48544F]">
                Download aplikasi Android CariKostKita untuk filter radius kampus, ketersediaan kamar real-time, dan kontak langsung ke pemilik.
              </p>
            </div>
            <a
              href={apk}
              className="btn-primary whitespace-nowrap"
              onClick={handleDownloadClick}
              download
            >
              <FontAwesomeIcon icon={faDownload} />
              <span>Download Aplikasi Lengkap</span>
            </a>
          </div>
        </div>
      </section>

      {/* ------------------------------------------ Application Showcase Section */}
      <section id="aplikasi" className="section section--subtle">
        <div className="shell">
          <div className="section-header">
            <h2 className="section-title">Dirancang Khusus untuk Kemudahan Pencari Kost</h2>
            <p className="section-description">
              Dari pencarian berbasis radius kampus hingga pencocokan teman sekamar, semua fitur kami bangun demi pengalaman mencari hunian yang nyaman.
            </p>
          </div>

          <div className="app-showcase-grid">
            {/* Interactive Feature List */}
            <div className="app-feature-list">
              {showcaseFeatures.map((feat, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`app-feature-card ${selectedShowcaseIndex === idx ? 'active' : ''}`}
                  onClick={() => setSelectedShowcaseIndex(idx)}
                >
                  <div className="app-feature-icon">
                    <FontAwesomeIcon icon={feat.icon} />
                  </div>
                  <div>
                    <h3 className="app-feature-title">{feat.title}</h3>
                    <p className="app-feature-desc">{feat.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Showcase Phone Screen Preview */}
            <div className="app-showcase-phone-frame">
              <Image
                src={showcaseFeatures[selectedShowcaseIndex].mockup}
                alt={showcaseFeatures[selectedShowcaseIndex].title}
                width={290}
                height={590}
                className="transition-all duration-300"
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ How It Works Section */}
      <section id="cara-kerja" className="section section--white">
        <div className="shell">
          <div className="section-header section-header--center">
            <h2 className="section-title">Tiga Langkah Mudah Menemukan Kost Idaman</h2>
            <p className="section-description">
              Proses pencarian hunian dibuat transparan, cepat, dan tanpa hambatan birokrasi.
            </p>
          </div>

          <div className="how-it-works-grid">
            {/* Step 1 */}
            <div className="step-card">
              <div className="step-num">01</div>
              <div className="step-icon-wrap">
                <FontAwesomeIcon icon={faSearch} />
              </div>
              <h3 className="step-title">Temukan Kost</h3>
              <p className="step-text">
                Telusuri ribuan pilihan kost di Pekanbaru berdasarkan radius kampus, jenis hunian (putra/putri/campur), dan rentang budget Anda.
              </p>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <div className="step-num">02</div>
              <div className="step-icon-wrap">
                <FontAwesomeIcon icon={faFileLines} />
              </div>
              <h3 className="step-title">Lihat Detail</h3>
              <p className="step-text">
                Pelajari foto kamar resolusi tinggi, spesifikasi luas, fasilitas lengkap, kebijakan listrik (token mandiri/all-in), dan kamar yang tersedia.
              </p>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <div className="step-num">03</div>
              <div className="step-icon-wrap">
                <FontAwesomeIcon icon={faWhatsapp} />
              </div>
              <h3 className="step-title">Hubungi Pemilik</h3>
              <p className="step-text">
                Hubungi pemilik properti secara langsung melalui tautan WhatsApp resmi untuk janji temu survei lokasi atau booking tanpa perantara calo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------- Platform Statistics Section */}
      <section id="statistik" className="section section--subtle">
        <div className="shell">
          <div className="section-header section-header--center">
            <h2 className="section-title">Data Riil Komunitas CariKostKita</h2>
            <p className="section-description">
              Angka yang mencerminkan pertumbuhan ekosistem akomodasi kost di Kota Pekanbaru.
            </p>
          </div>

          <div className="stats-strip">
            <div className="stat-item">
              <div className="stat-val">1.160+</div>
              <h3 className="stat-label">Kost Terdaftar</h3>
              <p className="stat-sub">Listing aktif yang telah diverifikasi</p>
            </div>

            <div className="stat-item">
              <div className="stat-val">10+</div>
              <h3 className="stat-label">Kecamatan Pekanbaru</h3>
              <p className="stat-sub">Menjangkau Panam, Marpoyan, Sukajadi, dll.</p>
            </div>

            <div className="stat-item">
              <div className="stat-val">100%</div>
              <h3 className="stat-label">Bebas Biaya Calo</h3>
              <p className="stat-sub">Kontak langsung ke pemilik tanpa mark-up sewa</p>
            </div>

            <div className="stat-item">
              <div className="stat-val">&lt; 24 Jam</div>
              <h3 className="stat-label">Moderasi Cepat</h3>
              <p className="stat-sub">Pemeriksaan kualitas pendaftaran unit baru</p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------- Trust & Credibility Section */}
      <section id="kepercayaan" className="section section--white">
        <div className="shell">
          <div className="section-header">
            <h2 className="section-title">Komitmen Kami untuk Transparansi & Keamanan Anda</h2>
            <p className="section-description">
              CariKostKita dibangun atas prinsip keterbukaan informasi bagi mahasiswa, perantau, dan pemilik properti di Pekanbaru.
            </p>
          </div>

          <div className="trust-grid-4">
            {appConfig.trustItems && appConfig.trustItems.length > 0 ? (
              appConfig.trustItems.filter((i) => i.is_active !== false).map((item, idx) => (
                <div key={item.id || idx} className="trust-item-card">
                  <div className="trust-item-icon">
                    <FontAwesomeIcon icon={resolveFaIcon(item.icon, faShieldHalved)} />
                  </div>
                  <h3 className="trust-item-title">{item.title}</h3>
                  <p className="trust-item-desc">{item.desc}</p>
                </div>
              ))
            ) : (
              <>
                <div className="trust-item-card">
                  <div className="trust-item-icon">
                    <FontAwesomeIcon icon={faShieldHalved} />
                  </div>
                  <h3 className="trust-item-title">Kurasi Lapangan Berkala</h3>
                  <p className="trust-item-desc">
                    Setiap data listing kost ditinjau oleh tim moderator untuk memastikan lokasi dan foto sesuai kondisi fisik sesungguhnya.
                  </p>
                </div>

                <div className="trust-item-card">
                  <div className="trust-item-icon">
                    <FontAwesomeIcon icon={faBolt} />
                  </div>
                  <h3 className="trust-item-title">Transparansi Biaya & Listrik</h3>
                  <p className="trust-item-desc">
                    Informasi fasilitas dan rincian biaya (apakah listrik token mandiri atau all-in) dicantumkan jelas tanpa biaya tersembunyi.
                  </p>
                </div>

                <div className="trust-item-card">
                  <div className="trust-item-icon">
                    <FontAwesomeIcon icon={faWhatsapp} />
                  </div>
                  <h3 className="trust-item-title">Komunikasi Langsung Pemilik</h3>
                  <p className="trust-item-desc">
                    Pengguna terhubung langsung dengan nomor WhatsApp pemilik sah tanpa perantara dan tanpa potongan komisi sewa.
                  </p>
                </div>

                <div className="trust-item-card">
                  <div className="trust-item-icon">
                    <FontAwesomeIcon icon={faLock} />
                  </div>
                  <h3 className="trust-item-title">Privasi & Bebas Iklan Invasif</h3>
                  <p className="trust-item-desc">
                    Platform bersih tanpa iklan pop-up yang mengganggu kenyamanan bernavigasi dan data kontak pengguna terlindungi.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ----------------------------------------- For Kost Owners Section */}
      <section id="pemilik" className="section section--white pt-0">
        <div className="shell">
          <div className="owner-card-hero">
            <div>
              <h2 className="owner-title">Punya Kamar Kost Kosong? Promosikan Gratis di CariKostKita</h2>
              <p className="owner-desc">
                Jangkau ribuan mahasiswa UNRI, UIR, UIN Suska serta pekerja muda Pekanbaru setiap hari tanpa potongan komisi perantara sepeser pun.
              </p>
              <a
                href={waOwnerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-white"
              >
                <FontAwesomeIcon icon={faWhatsapp} className="text-[#25D366]" />
                <span>Daftarkan Kost via WhatsApp</span>
              </a>
            </div>

            <div className="owner-benefits">
              <div className="owner-benefit-item">
                <FontAwesomeIcon icon={faCheck} />
                <div>
                  <strong className="block text-white">0% Komisi & Biaya Tersembunyi</strong>
                  <span>Uang sewa 100% langsung masuk ke rekening pemilik tanpa potongan komisi aplikasi.</span>
                </div>
              </div>

              <div className="owner-benefit-item">
                <FontAwesomeIcon icon={faCheck} />
                <div>
                  <strong className="block text-white">Calon Penyewa Terarah</strong>
                  <span>Pencari kost yang menghubungi Anda adalah peminat serius yang telah melihat foto dan detail kamar.</span>
                </div>
              </div>

              <div className="owner-benefit-item">
                <FontAwesomeIcon icon={faCheck} />
                <div>
                  <strong className="block text-white">Bantuan Kurasi 1x24 Jam</strong>
                  <span>Kirimkan detail dan foto kamar Anda melalui WhatsApp, tim kurator kami bantu tayangkan dengan cepat.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------- FAQ Accordion Section */}
      <section id="faq" className="section section--subtle">
        <div className="shell">
          <div className="section-header section-header--center">
            <h2 className="section-title">Hal yang Sering Ditanyakan</h2>
            <p className="section-description">
              Informasi lengkap seputar instalasi APK, pencarian kamar, dan keamanan transaksi.
            </p>
          </div>

          <div className="faq-grid">
            {[
              {
                q: 'Apakah aplikasi CariKostKita gratis untuk digunakan?',
                a: 'Ya, 100% gratis. Anda dapat menelusuri seluruh data kost, memeriksa fasilitas, melihat foto kamar, hingga menghubungi pemilik langsung melalui WhatsApp tanpa dipungut biaya apapun.',
              },
              {
                q: 'Bagaimana cara memasang aplikasi APK di HP Android saya?',
                a: 'Klik tombol "Download APK", buka berkas APK yang sudah diunduh, lalu pilih "Pasang". Jika peramban Chrome menampilkan pemberitahuan unduhan dari sumber luar Play Store, pilih "Tetap Unduh / Izinkan dari Sumber Ini". Berkas APK kami 100% aman dan bebas malware.',
              },
              {
                q: 'Mengapa tidak ada biaya tambahan atau calo di CariKostKita?',
                a: 'Tujuan utama kami adalah menghubungkan pencari hunian dan pemilik secara langsung demi transparansi harga. Kami tidak memotong komisi dari uang sewa kamar.',
              },
              {
                q: 'Bagaimana cara melaporkan informasi kost yang sudah penuh atau tidak akurat?',
                a: 'Anda dapat menekan tombol bantuan WhatsApp di pojok kanan bawah atau melaporkan langsung melalui menu bantuan di dalam aplikasi Android CariKostKita.',
              },
              {
                q: 'Bagaimana cara kerja fitur Roommate Matchmaker di aplikasi?',
                a: 'Di versi 1.3.0 terbaru, Anda dapat memfilter calon teman sekamar berdasarkan kampus (UNRI, UIR, UIN), jenis kelamin, jurusan, serta kisaran budget bulanan yang disepakati bersama.',
              },
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="faq-card">
                  <button
                    type="button"
                    className="faq-trigger"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
                  </button>
                  {isOpen && <div className="faq-answer">{faq.a}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------- Download CTA Section */}
      <section className="download-section">
        <div className="shell">
          <div className="download-box">
            <div>
              <div className="flex items-center gap-3 mb-4">
                {(appConfig.appIconUrl || appConfig.logoUrl) && (
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-white p-1 shadow-sm border border-white/20 shrink-0">
                    <img
                      src={appConfig.appIconUrl || appConfig.logoUrl}
                      alt="App Icon"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                )}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider border border-white/20">
                  <FontAwesomeIcon icon={faAndroid} />
                  <span>Rilis Resmi Android {appConfig.versionName || 'v1.3.6'}</span>
                </div>
              </div>

              <h2 className="download-headline">
                Mulai Temukan Kost Terbaik Anda di Pekanbaru Hari Ini
              </h2>

              <p className="download-text">
                Unduh aplikasi CariKostKita sekarang. Ringan ({appConfig.apkSize || '3.5 MB'}), cepat, dan 100% bebas biaya calo. Dapatkan akses ke ribuan data akomodasi terverifikasi di seluruh Pekanbaru.
              </p>

              <div className="download-actions-group">
                <a
                  href={apk}
                  className="btn-white"
                  onClick={handleDownloadClick}
                  download
                >
                  <FontAwesomeIcon icon={faDownload} />
                  <span>Download APK ({appConfig.versionName || 'v1.3.6'})</span>
                </a>

                <button
                  type="button"
                  className="btn-secondary !bg-white/10 !text-white !border-white/30 hover:!bg-white/20"
                  onClick={() => setShowModal(true)}
                >
                  Panduan Pasang APK
                </button>
              </div>

              <div className="download-spec-pill">
                <span>Ukuran: {appConfig.apkSize || '3.5 MB'}</span>
                <span>•</span>
                <span>OS: {appConfig.minAndroid || 'Android 8.0+'}</span>
                <span>•</span>
                <span>Terverifikasi Bebas Virus & Calo</span>
              </div>
            </div>

            <div className="download-phone-preview">
              <Image
                src="/mockup-hero-semua.webp"
                alt="Aplikasi CariKostKita Android"
                width={250}
                height={500}
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- Footer */}
      <footer className="site-footer">
        <div className="shell">
          <div className="footer-main-grid">
            {/* Col 1: Brand Info */}
            <div className="footer-col-brand">
              <a href="#" className="brand">
                <div className="brand__mark overflow-hidden">
                  {appConfig.footerLogoUrl || appConfig.logoUrl ? (
                    <img
                      src={appConfig.footerLogoUrl || appConfig.logoUrl}
                      alt={appConfig.appName || 'Logo CariKostKita'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FontAwesomeIcon icon={faBuilding} />
                  )}
                </div>
                <div className="brand__text">
                  <span>{appConfig.appName || 'CariKostKita'}</span>
                </div>
              </a>
              <p>
                Platform pencarian hunian kost modern di Kota Pekanbaru dengan foto asli, transparansi biaya listrik, dan kontak langsung ke pemilik.
              </p>
              <div className="footer-social-row">
                {appConfig.instagram && (
                  <a
                    href={appConfig.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="footer-social-icon"
                    aria-label="Instagram CariKostKita"
                  >
                    <FontAwesomeIcon icon={faInstagram} />
                  </a>
                )}
                {appConfig.facebook && (
                  <a
                    href={appConfig.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="footer-social-icon"
                    aria-label="Facebook CariKostKita"
                  >
                    <FontAwesomeIcon icon={faFacebook} />
                  </a>
                )}
                {appConfig.tiktok && (
                  <a
                    href={appConfig.tiktok}
                    target="_blank"
                    rel="noreferrer"
                    className="footer-social-icon"
                    aria-label="TikTok CariKostKita"
                  >
                    <FontAwesomeIcon icon={faTiktok} />
                  </a>
                )}
                <a
                  href={appConfig.githubUrl || 'https://github.com/WalZetass-kar/CariKostKita'}
                  target="_blank"
                  rel="noreferrer"
                  className="footer-social-icon"
                  aria-label="GitHub Repository"
                >
                  <FontAwesomeIcon icon={faGithub} />
                </a>
              </div>
            </div>

            {/* Col 2: Navigation */}
            <div>
              <h3 className="footer-col-title">Navigasi Utama</h3>
              <ul className="footer-links-list">
                <li><a href="#akomodasi">Koleksi Akomodasi</a></li>
                <li><a href="#aplikasi">Fitur Aplikasi</a></li>
                <li><a href="#cara-kerja">Cara Kerja</a></li>
                <li><a href="#statistik">Statistik</a></li>
                <li><a href="#kepercayaan">Kepercayaan</a></li>
                <li><a href="#faq">Tanya Jawab (FAQ)</a></li>
              </ul>
            </div>

            {/* Col 3: Fitur Unggulan */}
            <div>
              <h3 className="footer-col-title">Fitur Unggulan</h3>
              <ul className="footer-links-list">
                <li><a href="#aplikasi">Radius Kampus UNRI / UIR</a></li>
                <li><a href="#aplikasi">Transparansi Listrik All-in</a></li>
                <li><a href="#aplikasi">Roommate Matchmaker</a></li>
                <li><a href="#pemilik">Pasang Listing Kost Gratis</a></li>
                <li>
                  <button type="button" onClick={() => setShowModal(true)}>
                    Panduan Unduh APK
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: Kontak & Legalitas */}
            <div>
              <h3 className="footer-col-title">Kontak & Bantuan</h3>
              <ul className="footer-links-list">
                <li>
                  <a href={waHelpUrl} target="_blank" rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faWhatsapp} className="text-[#25D366] mr-2" />
                    Bantuan WhatsApp
                  </a>
                </li>
                <li>
                  <a href={`mailto:${appConfig.supportEmail || 'support@carikostkita.id'}`}>
                    <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-[#74827C]" />
                    {appConfig.supportEmail || 'support@carikostkita.id'}
                  </a>
                </li>
                <li className="pt-2">
                  <a
                    href="/terms"
                    className="hover:underline transition text-inherit"
                  >
                    Syarat & Ketentuan
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy"
                    className="hover:underline transition text-inherit"
                  >
                    Kebijakan Privasi
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <div>
              © {new Date().getFullYear()} {appConfig.appName || 'CariKostKita'}. Hak cipta dilindungi undang-undang.
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span>Kota Pekanbaru, Provinsi Riau</span>
              <span>•</span>
              <span>Rilis {appConfig.versionName || 'v1.3.6'}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ------------------------------------------------ Floating WhatsApp */}
      <a
        href={waHelpUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-wa-btn"
        aria-label="Hubungi Admin CariKostKita melalui WhatsApp"
      >
        <FontAwesomeIcon icon={faWhatsapp} className="text-xl" />
        <span>Tanya Admin</span>
      </a>

      {/* ---------------------------------------- Modal: Panduan Pasang APK */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className="modal-box"
            role="dialog"
            aria-modal="true"
            aria-label="Panduan Pasang Aplikasi CariKostKita"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Panduan Pasang Aplikasi APK Android</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowModal(false)}
                aria-label="Tutup panduan"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="modal-body">
              <p className="mb-4">
                Berkas APK CariKostKita <b>{appConfig.versionName || 'v1.3.6'}</b> sedang diunduh ke perangkat Anda. Jika peramban (Chrome) menampilkan dialog peringatan standar, ikuti langkah mudah berikut:
              </p>

              <div className="install-guide-steps mb-6">
                <div className="install-guide-step-card">
                  <div className="install-guide-num">1</div>
                  <div>
                    <h4 className="font-bold text-[#111815] mb-1">Pilih &quot;Tetap Unduh&quot;</h4>
                    <p className="text-xs text-[#74827C]">
                      Peringatan ini adalah standar keamanan Chrome untuk semua file instalasi APK di luar Google Play Store.
                    </p>
                  </div>
                </div>

                <div className="install-guide-step-card">
                  <div className="install-guide-num">2</div>
                  <div>
                    <h4 className="font-bold text-[#111815] mb-1">Izinkan Pemasangan</h4>
                    <p className="text-xs text-[#74827C]">
                      Buka notifikasi unduhan, lalu aktifkan opsi &quot;Izinkan dari sumber ini&quot; di pengaturan keamanan HP Android Anda.
                    </p>
                  </div>
                </div>

                <div className="install-guide-step-card">
                  <div className="install-guide-num">3</div>
                  <div>
                    <h4 className="font-bold text-[#111815] mb-1">Buka Aplikasi & Mulai Cari</h4>
                    <p className="text-xs text-[#74827C]">
                      Selesai! Aplikasi langsung dapat digunakan tanpa harus login untuk mencari kost di Pekanbaru.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#FDF2F2] border border-[#F0CECE] rounded-lg text-xs text-[var(--brand)] mb-6 flex items-start gap-2">
                <FontAwesomeIcon icon={faShieldHalved} className="mt-0.5" />
                <span>
                  {appConfig.securityModalNote ||
                    'Berkas APK CariKostKita 100% aman, bebas iklan berbahaya, dan terenkripsi resmi.'}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  className="btn-secondary !h-10 text-xs"
                  onClick={() => setShowModal(false)}
                >
                  Tutup
                </button>
                <a
                  href={apk}
                  download
                  className="btn-primary !h-10 text-xs"
                  onClick={() => setShowModal(false)}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  <span>Unduh Ulang APK</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------- Modal: CMS Announcement / Advertisement Popup */}
      {showPopupModal &&
        (Boolean(activePopupAd) ||
          (appConfig.popupActive &&
            (Boolean(appConfig.popupTitle) ||
              Boolean(appConfig.popupContent) ||
              Boolean(appConfig.popupImageUrl)))) && (
          <div className="modal-overlay" onClick={handleClosePopup}>
            <div
              className="modal-box"
              role="dialog"
              aria-modal="true"
              aria-label={activePopupAd?.title || appConfig.popupTitle || 'Informasi Penting'}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="flex items-center gap-2 overflow-hidden">
                  {activePopupAd && (
                    <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wider shrink-0">
                      Iklan Promosi
                    </span>
                  )}
                  <h3 className="truncate font-bold text-[#111815]">
                    {activePopupAd?.title || appConfig.popupTitle || 'Informasi Penting'}
                  </h3>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={handleClosePopup}
                  aria-label="Tutup dialog"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>

              <div className="modal-body">
                {(activePopupAd?.image_url || appConfig.popupImageUrl) && (
                  <div className="mb-4 rounded-xl overflow-hidden border border-[#E8ECE9] max-h-64 sm:max-h-72 bg-stone-100 flex items-center justify-center">
                    <img
                      src={activePopupAd?.image_url || appConfig.popupImageUrl}
                      alt={activePopupAd?.title || appConfig.popupTitle || 'Banner'}
                      className="w-full h-full object-cover max-h-64 sm:max-h-72"
                      loading="eager"
                    />
                  </div>
                )}

                <p className="mb-6 whitespace-pre-line text-sm text-[#46544E]">
                  {activePopupAd?.description ||
                    appConfig.popupContent ||
                    'Dapatkan penawaran promo kost terbaik di Pekanbaru dengan harga hemat dan fasilitas lengkap.'}
                </p>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    className="btn-secondary !h-10 text-xs font-semibold px-4"
                    onClick={handleClosePopup}
                  >
                    Tutup
                  </button>
                  {(activePopupAd?.target_url || appConfig.popupButtonUrl) && (
                    <a
                      href={activePopupAd?.target_url || appConfig.popupButtonUrl}
                      target={activePopupAd?.target_url ? '_blank' : undefined}
                      rel={activePopupAd?.target_url ? 'noopener noreferrer' : undefined}
                      className="btn-primary !h-10 text-xs font-bold px-4 inline-flex items-center gap-1.5"
                      onClick={handleClosePopup}
                    >
                      <span>
                        {activePopupAd
                          ? 'Lihat Promo'
                          : appConfig.popupButtonLabel || 'Buka Tautan'}
                      </span>
                      <FontAwesomeIcon icon={faArrowRight} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      {/* ----------------------------------------- Modal: Legal Policies */}
      {legalModal.open && (
        <div
          className="modal-overlay"
          onClick={() => setLegalModal({ open: false, title: '', content: '' })}
        >
          <div
            className="modal-box"
            role="dialog"
            aria-modal="true"
            aria-label={legalModal.title}
            style={{ maxWidth: 640 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>{legalModal.title}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setLegalModal({ open: false, title: '', content: '' })}
                aria-label="Tutup dialog"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="modal-body">
              <div className="whitespace-pre-line text-sm text-[#48544F]">
                {legalModal.content || 'Konten belum tersedia.'}
              </div>
              <div className="mt-6 text-right">
                <button
                  type="button"
                  className="btn-secondary !h-10 text-xs"
                  onClick={() => setLegalModal({ open: false, title: '', content: '' })}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
