'use client';

import { useState, useEffect } from 'react';
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
  faBoxArchive,
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

config.autoAddCss = false;

const publicApiUrl = (
  process.env.NEXT_PUBLIC_CARIKOSTKITA_API_URL ||
  'https://carikostkitafastapi.vercel.app'
).replace(/\/+$/, '');
const repo = 'https://github.com/g-423/KosKita';

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

const Button = ({ apk, light = false, label = 'Download APK' }: { apk: string; light?: boolean; label?: string }) => (
  <a className={`download ${light ? 'download--light' : ''}`} href={apk} download>
    <FontAwesomeIcon icon={faDownload} style={{ marginRight: 6 }} />
    <span>{label}</span>
  </a>
);

export interface NavLinkItem {
  id?: string;
  label: string;
  href?: string;
  url?: string;
  is_active?: boolean;
  order?: number;
}

export interface TrustItem {
  id?: string;
  icon: string;
  title: string;
  desc: string;
  is_active?: boolean;
  order?: number;
}

export interface FeatureItem {
  id?: string;
  icon: string;
  title: string;
  desc: string;
  is_active?: boolean;
  order?: number;
}

export interface InstallStepItem {
  id?: string;
  step_number?: string;
  n?: string;
  title?: string;
  t?: string;
  desc?: string;
  d?: string;
  is_active?: boolean;
  order?: number;
}

export interface OwnerStepItem {
  id?: string;
  title?: string;
  text?: string;
  is_active?: boolean;
  order?: number;
}

export interface FaqItem {
  id?: string;
  question?: string;
  q?: string;
  answer?: string;
  a?: string;
  is_active?: boolean;
  order?: number;
}

export interface AppConfigState {
  appName: string;
  tagline: string;
  heroText: string;
  versionName: string;
  releaseNotes: string;
  supportEmail: string;
  contactPhone: string;
  address: string;
  siteTitle: string;
  siteDescription: string;
  metaKeywords: string;
  targetCity: string;
  apkSize: string;
  minAndroid: string;
  heroBadge1: string;
  heroBadge2: string;
  apk: string;
  waNumber: string;
  bannerActive: boolean;
  bannerText: string;
  bannerLink: string;
  bannerType: string;
  heroImageUrl: string;
  logoUrl: string;
  footerLogoUrl: string;
  appIconUrl: string;
  faviconUrl: string;
  ogImageUrl: string;
  popupActive: boolean;
  popupTitle: string;
  popupContent: string;
  popupImageUrl: string;
  popupButtonLabel: string;
  popupButtonUrl: string;
  brandColor: string;
  githubUrl: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  youtube: string;
  linkedin: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaPrimaryLabel: string;
  heroCtaSecondaryLabel: string;
  heroCtaSecondaryLink: string;
  heroAdFreeText: string;
  heroTrustBadge1: string;
  heroTrustBadge2: string;
  heroTrustBadge3: string;
  ownerTitle: string;
  ownerIntro: string;
  ownerWaLabel: string;
  ownerSecondaryLabel: string;
  aboutTitle: string;
  aboutStory: string;
  feedbackActive: boolean;
  feedbackTitle: string;
  feedbackDesc: string;
  feedbackButtonLabel: string;
  finalCtaEyebrow: string;
  finalCtaTitle: string;
  finalCtaDesc: string;
  finalCtaButtonLabel: string;
  footerTagline: string;
  footerCopyright: string;
  securityModalActive: boolean;
  securityModalTitle: string;
  securityModalDesc: string;
  securityModalNote: string;
  legalPrivacy: string;
  legalTerms: string;
  navLinks: NavLinkItem[];
  trustItems: TrustItem[];
  featureItems: FeatureItem[];
  installSteps: InstallStepItem[];
  ownerSteps: Array<OwnerStepItem | string>;
  faqItems: FaqItem[];
}

interface PromoAd {
  id: string | number;
  title: string;
  description?: string;
  image?: string;
  image_url?: string;
  link?: string;
  target_url?: string;
}

const defaultConfig: AppConfigState = {
  appName: 'CariKostKita',
  tagline: 'Temukan Kost Nyaman & Terpercaya di Pekanbaru',
  heroText: 'CariKostKita hadir untuk memudahkan kamu menemukan kost terbaik di Pekanbaru. Dengan tampilan yang simpel, cepat, dan lengkap, semua kebutuhan kost ada di genggaman.',
  versionName: 'v1.0.1',
  releaseNotes: 'Rilis beta resmi CariKostKita untuk mahasiswa dan warga Pekanbaru.',
  supportEmail: 'support@carikostkita.id',
  contactPhone: '0761-555-0123',
  address: 'Jl. Soekarno Hatta No. 1, Pekanbaru, Riau',
  siteTitle: 'CariKostKita - Cari Kost Terpercaya di Pekanbaru',
  siteDescription: 'Platform pencarian kost terverifikasi dengan info harga, lokasi, dan fasilitas akurat.',
  metaKeywords: 'cari kost pekanbaru, kost UIR, kost UNRI, kost Bukit Raya, APK CariKostKita',
  targetCity: 'Pekanbaru',
  apkSize: '6.9 MB',
  minAndroid: 'Android 8.0+',
  heroBadge1: 'Lokasi dekat kampus & area strategis',
  heroBadge2: 'Detail kost & foto kamar lengkap',
  apk: 'https://github.com/g-423/KosKita/releases/download/v1.0.0-beta/CariKostKita-v1.0.0-beta.apk',
  waNumber: '6281270008899',
  bannerActive: false,
  bannerText: '',
  bannerLink: '',
  bannerType: 'promo',
  heroImageUrl: '',
  logoUrl: '',
  footerLogoUrl: '',
  appIconUrl: '',
  faviconUrl: '',
  ogImageUrl: '',
  popupActive: false,
  popupTitle: '',
  popupContent: '',
  popupImageUrl: '',
  popupButtonLabel: '',
  popupButtonUrl: '',
  brandColor: '#6D0808',
  githubUrl: 'https://github.com/g-423/KosKita',
  instagram: 'https://instagram.com/carikostkita',
  facebook: 'https://facebook.com/carikostkita',
  tiktok: 'https://tiktok.com/@carikostkita',
  youtube: '',
  linkedin: '',
  heroHeadline: 'Temukan Kost Nyaman & Terpercaya di Pekanbaru',
  heroSubheadline: 'CariKostKita hadir untuk memudahkan kamu menemukan kost terbaik di Pekanbaru. Dengan tampilan yang simpel, cepat, dan lengkap, semua kebutuhan kost ada di genggaman.',
  heroCtaPrimaryLabel: 'Download APK',
  heroCtaSecondaryLabel: 'Lihat Fitur',
  heroCtaSecondaryLink: '#fitur',
  heroAdFreeText: 'Bebas Iklan',
  heroTrustBadge1: 'Mudah Digunakan',
  heroTrustBadge2: 'Data Terpercaya',
  heroTrustBadge3: 'Update Rutin',
  ownerTitle: 'Anda punya kost di Pekanbaru?',
  ownerIntro: 'Daftarkan kost Anda di CariKostKita agar lebih mudah ditemukan calon penyewa mahasiswa dan pekerja tanpa komisi perantara.',
  ownerWaLabel: 'Daftar via WhatsApp',
  ownerSecondaryLabel: 'Download Aplikasi',
  aboutTitle: 'Dibangun untuk Kebutuhan Pencari Kost',
  aboutStory: 'CariKostKita adalah aplikasi yang dikembangkan untuk membantu masyarakat, terutama anak rantau dan mahasiswa, dalam mencari kost dengan lebih mudah, cepat, dan terpercaya.',
  feedbackActive: true,
  feedbackTitle: 'Bantu kami menyempurnakan CariKostKita',
  feedbackDesc: 'Menemukan bug atau punya usulan fitur untuk CariKostKita? Sampaikan masukan Anda langsung ke admin WhatsApp kami.',
  feedbackButtonLabel: 'Kirim Masukan via WhatsApp',
  finalCtaEyebrow: 'JANGAN TUNGGU LAGI!',
  finalCtaTitle: 'Yuk, Temukan Kost Terbaikmu Sekarang!',
  finalCtaDesc: 'Download CariKostKita sekarang dan mulai pencarian kost impianmu.',
  finalCtaButtonLabel: 'Download APK Sekarang',
  footerTagline: 'Kost terbaik, untuk masa depanmu.',
  footerCopyright: '© 2026 CariKostKita. All rights reserved.',
  securityModalActive: true,
  securityModalTitle: 'Panduan Dialog Download Android',
  securityModalDesc: 'Saat mengunduh berkas APK di luar Google Play Store, peramban (Chrome) akan menampilkan pesan standar keamanan:',
  securityModalNote: 'Berkas APK CariKostKita 100% aman dan diverifikasi langsung dari repositori resmi proyek.',
  legalPrivacy: 'Kebijakan Privasi CariKostKita: Kami menghargai privasi Anda dan hanya menggunakan data untuk keperluan operasional layanan pencarian kost.',
  legalTerms: 'Syarat & Ketentuan CariKostKita: Layanan ini disediakan secara gratis untuk mempermudah pencarian kost di Pekanbaru.',
  navLinks: [
    { id: 'nav-1', label: 'Beranda', href: '#beranda', order: 1, is_active: true },
    { id: 'nav-2', label: 'Fitur', href: '#fitur', order: 2, is_active: true },
    { id: 'nav-3', label: 'Cara Install', href: '#install', order: 3, is_active: true },
    { id: 'nav-4', label: 'Untuk Pemilik Kost', href: '#pemilik', order: 4, is_active: true },
    { id: 'nav-5', label: 'FAQ', href: '#faq', order: 5, is_active: true },
  ],
  trustItems: [
    { id: 'trust-1', icon: 'shield', title: 'Berkas resmi & terverifikasi', desc: 'Dirilis dari repositori resmi proyek tanpa adware atau pihak ketiga.', order: 1, is_active: true },
    { id: 'trust-2', icon: 'bolt', title: 'Ringan & hemat kuota', desc: 'Ukuran berkas sangat ringkas agar cepat diunduh tanpa membebani memori ponsel.', order: 2, is_active: true },
    { id: 'trust-3', icon: 'lock', title: 'Izin yang masuk akal', desc: 'Hanya izin lokasi untuk peta navigasi kost dan galeri foto bagi pemilik kost.', order: 3, is_active: true },
  ],
  featureItems: [
    { id: 'feat-1', icon: 'search', title: 'Pencarian Mudah', desc: 'Temukan kost sesuai lokasi kampus, rentang harga, dan fasilitas yang kamu butuhkan.', order: 1, is_active: true },
    { id: 'feat-2', icon: 'file', title: 'Informasi Lengkap', desc: 'Lihat detail kamar, foto asli terverifikasi, fasilitas lengkap, serta kontak langsung pemilik tanpa perantara.', order: 2, is_active: true },
    { id: 'feat-3', icon: 'location', title: 'Lokasi Strategis', desc: 'Pilihan kost terverifikasi di area strategis yang dekat dengan kampus dan pusat aktivitas.', order: 3, is_active: true },
    { id: 'feat-4', icon: 'sliders', title: 'Tampilan Sederhana', desc: 'Desain antarmuka bersih, ringan, dan sangat mudah digunakan oleh siapa saja.', order: 4, is_active: true },
  ],
  installSteps: [
    { id: 'step-1', step_number: '1', title: 'Download APK', desc: 'Klik tombol unduh untuk mendapatkan berkas aplikasi resmi.', order: 1, is_active: true },
    { id: 'step-2', step_number: '2', title: 'Konfirmasi Dialog', desc: 'Pilih "Tetap Download" jika muncul peringatan browser.', order: 2, is_active: true },
    { id: 'step-3', step_number: '3', title: 'Izinkan Sumber', desc: 'Buka berkas unduhan dan aktifkan izin instalasi dari sumber ini.', order: 3, is_active: true },
    { id: 'step-4', step_number: '4', title: 'Selesai!', desc: 'Buka aplikasi dan mulai mencari kost idamanmu.', order: 4, is_active: true },
  ],
  ownerSteps: [
    { id: 'ostep-1', title: 'Unduh dan pasang aplikasi CariKostKita.', order: 1, is_active: true },
    { id: 'ostep-2', title: 'Buka Profil, lalu pilih "Daftar sebagai Pemilik Kost".', order: 2, is_active: true },
    { id: 'ostep-3', title: 'Isi identitas, alamat kost, fasilitas, dan foto kamar dengan lengkap.', order: 3, is_active: true },
    { id: 'ostep-4', title: 'Tim verifikasi meninjau pengajuan Anda dalam kurun waktu 1x24 jam.', order: 4, is_active: true },
    { id: 'ostep-5', title: 'Setelah disetujui, listing kost Anda langsung tayang dan dashboard pemilik dapat digunakan.', order: 5, is_active: true },
  ],
  faqItems: [
    { id: 'faq-1', question: 'Mengapa aplikasi belum ada di Google Play Store?', answer: 'Aplikasi sedang dalam tahap pra-rilis publik. Berkas APK dibagikan langsung agar para pencari kost bisa langsung menikmati kemudahan mencari kost sebelum tersedia di Play Store.', order: 1, is_active: true },
    { id: 'faq-2', question: 'Apakah aman menginstal file APK ini?', answer: 'Sangat aman. Berkas APK dikompilasi langsung dari repositori resmi proyek tanpa injeksi kode pihak ketiga. Android akan menampilkan dialog standar yang aman untuk disetujui.', order: 2, is_active: true },
    { id: 'faq-3', question: 'Versi Android apa yang didukung?', answer: 'Mendukung Android 8.0+ hingga versi Android yang lebih baru dengan ukuran hemat kuota.', order: 3, is_active: true },
    { id: 'faq-4', question: 'Apakah mencari kost dikenakan biaya?', answer: 'Tidak. Layanan pencarian kost 100% gratis untuk para pencari kost tanpa biaya langganan, biaya admin, maupun komisi perantara.', order: 4, is_active: true },
    { id: 'faq-5', question: 'Bagaimana jika data kost tidak sesuai?', answer: 'Gunakan fitur lapor di aplikasi atau hubungi kami langsung via WhatsApp atau email bantuan. Tim verifikasi kami akan segera menindaklanjuti.', order: 5, is_active: true },
    { id: 'faq-6', question: 'Apakah pemilik kost bisa langsung mengunggah?', answer: 'Bisa! Setiap pengajuan kost akan ditinjau oleh tim kurasi kami dalam 1x24 jam untuk mencegah penipuan dan memastikan listing valid.', order: 6, is_active: true },
  ],
};

export default function Home() {
  const [appConfig, setAppConfig] = useState<AppConfigState>(defaultConfig);
  const [promoAds, setPromoAds] = useState<PromoAd[]>([]);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const [fullResult, proxyResult, settingsResult, releaseResult, adsResult] = await Promise.allSettled([
          fetch(publicApiUrl + '/api/v1/public/settings', { cache: 'no-store' }),
          fetch('/api/settings', { cache: 'no-store' }),
          fetch(publicApiUrl + '/settings', { cache: 'no-store' }),
          fetch(publicApiUrl + '/latest-release', { cache: 'no-store' }),
          fetch('/api/ads', { cache: 'no-store' }),
        ]);
        const [fullJson, proxyJson, setJson, relJson, adsJson] = await Promise.all([
          fullResult.status === 'fulfilled' && fullResult.value.ok
            ? fullResult.value.json()
            : Promise.resolve(null),
          proxyResult.status === 'fulfilled' && proxyResult.value.ok
            ? proxyResult.value.json()
            : Promise.resolve(null),
          settingsResult.status === 'fulfilled' && settingsResult.value.ok
            ? settingsResult.value.json()
            : Promise.resolve(null),
          releaseResult.status === 'fulfilled' && releaseResult.value.ok
            ? releaseResult.value.json()
            : Promise.resolve(null),
          adsResult.status === 'fulfilled' && adsResult.value.ok
            ? adsResult.value.json()
            : Promise.resolve(null),
        ]);

        // Merge settings: proxyJson contains live Admin-Gue + FastAPI merged configuration
        const full = {
          ...(fullJson?.data || {}),
          ...(proxyJson?.data || {}),
        };
        if (adsJson) {
          setPromoAds(Array.isArray(adsJson.data) ? adsJson.data : []);
        }

        const resolveArray = <T,>(camelArr: any, snakeArr: any, currentArr: T[]): T[] => {
          if (Array.isArray(camelArr) && camelArr.length > 0) return camelArr;
          if (Array.isArray(snakeArr) && snakeArr.length > 0) return snakeArr;
          return currentArr;
        };

        const isFalse = (val: any) => val === false || val === 'false' || val === 0 || val === '0';
        const isTrue = (val: any) => val === true || val === 'true' || val === 1 || val === '1';

        const bannerActiveResolved = isFalse(full.bannerActive) || isFalse(full.banner_active)
          ? false
          : (isTrue(full.bannerActive) || isTrue(full.banner_active) ? true : false);

        const popupActiveResolved = isFalse(full.popupActive) || isFalse(full.popup_active)
          ? false
          : (isTrue(full.popupActive) || isTrue(full.popup_active) ? true : false);

        const securityModalActiveResolved = isFalse(full.securityModalActive) || isFalse(full.security_modal_active)
          ? false
          : true;

        const feedbackActiveResolved = isFalse(full.feedbackActive) || isFalse(full.feedback_active)
          ? false
          : true;

        if (popupActiveResolved) {
          try {
            const dismissed = sessionStorage.getItem('ckk_popup_dismissed');
            if (dismissed !== 'true') {
              setShowPopupModal(true);
            }
          } catch (_) {
            setShowPopupModal(true);
          }
        } else {
          setShowPopupModal(false);
        }

        setAppConfig((current) => ({
          ...current,
          appName: full.appName || full.app_name || current.appName,
          tagline: full.tagline || current.tagline,
          heroText: full.heroSubheadline || full.hero_subheadline || full.siteDescription || full.site_description || current.heroText,
          versionName: full.versionName || full.version_name || current.versionName,
          releaseNotes: full.releaseNotes || full.release_notes || current.releaseNotes,
          supportEmail: full.supportEmail || full.support_email || current.supportEmail,
          contactPhone: full.contactPhone || full.contact_phone || current.contactPhone,
          address: full.address || full.office_address || current.address,
          siteTitle: full.siteTitle || full.site_title || current.siteTitle,
          siteDescription: full.siteDescription || full.site_description || current.siteDescription,
          metaKeywords: full.metaKeywords || full.meta_keywords || current.metaKeywords,
          targetCity: full.targetCity || full.target_city || current.targetCity,
          apkSize: full.apkSize || full.apk_size || current.apkSize,
          minAndroid: full.minAndroid || full.min_android || current.minAndroid,
          heroBadge1: full.heroBadge1 || full.hero_badge_1 || current.heroBadge1,
          heroBadge2: full.heroBadge2 || full.hero_badge_2 || current.heroBadge2,
          apk: full.apkUrl || full.apk_url || (relJson?.success && relJson.data?.apk_url ? relJson.data.apk_url : current.apk),
          waNumber: full.whatsapp || full.contact_whatsapp || (setJson?.success && setJson.data?.contact_whatsapp ? setJson.data.contact_whatsapp : current.waNumber),
          bannerActive: bannerActiveResolved,
          bannerText: full.bannerText || full.banner_text || current.bannerText,
          bannerLink: full.bannerLink || full.banner_link || current.bannerLink,
          bannerType: full.bannerType || full.banner_type || current.bannerType,
          heroImageUrl: full.heroImageUrl || full.hero_image_url || current.heroImageUrl,
          logoUrl: full.logoUrl || full.logo_url || current.logoUrl,
          footerLogoUrl: full.footerLogoUrl || full.footer_logo_url || current.footerLogoUrl,
          appIconUrl: full.appIconUrl || full.app_icon_url || current.appIconUrl,
          faviconUrl: full.faviconUrl || full.favicon_url || current.faviconUrl,
          ogImageUrl: full.ogImageUrl || full.og_image_url || current.ogImageUrl,
          popupActive: popupActiveResolved,
          popupTitle: full.popupTitle || full.popup_title || current.popupTitle,
          popupContent: full.popupContent || full.popup_content || current.popupContent,
          popupImageUrl: full.popupImageUrl || full.popup_image_url || current.popupImageUrl,
          popupButtonLabel: full.popupButtonLabel || full.popup_button_label || current.popupButtonLabel,
          popupButtonUrl: full.popupButtonUrl || full.popup_button_url || current.popupButtonUrl,
          securityModalActive: securityModalActiveResolved,
          brandColor: full.brandColor || full.brand_color || current.brandColor,
          githubUrl: full.githubUrl || full.github_url || current.githubUrl,
          instagram: full.instagram || current.instagram,
          facebook: full.facebook || current.facebook,
          tiktok: full.tiktok || current.tiktok,
          youtube: full.youtube || current.youtube,
          linkedin: full.linkedin || current.linkedin,
          heroHeadline: full.heroHeadline || full.hero_headline || full.tagline || current.heroHeadline,
          heroSubheadline: full.heroSubheadline || full.hero_subheadline || current.heroSubheadline,
          heroCtaPrimaryLabel: full.heroCtaPrimaryLabel || full.hero_cta_primary_label || current.heroCtaPrimaryLabel,
          heroCtaSecondaryLabel: full.heroCtaSecondaryLabel || full.hero_cta_secondary_label || current.heroCtaSecondaryLabel,
          heroCtaSecondaryLink: full.heroCtaSecondaryLink || full.hero_cta_secondary_link || current.heroCtaSecondaryLink,
          heroAdFreeText: full.heroAdFreeText || full.hero_ad_free_text || current.heroAdFreeText,
          heroTrustBadge1: full.heroTrustBadge1 || full.hero_trust_badge_1 || current.heroTrustBadge1,
          heroTrustBadge2: full.heroTrustBadge2 || full.hero_trust_badge_2 || current.heroTrustBadge2,
          heroTrustBadge3: full.heroTrustBadge3 || full.hero_trust_badge_3 || current.heroTrustBadge3,
          ownerTitle: full.ownerTitle || full.owner_title || current.ownerTitle,
          ownerIntro: full.ownerIntro || full.owner_intro || current.ownerIntro,
          ownerWaLabel: full.ownerWaLabel || full.owner_wa_label || current.ownerWaLabel,
          ownerSecondaryLabel: full.ownerSecondaryLabel || full.owner_secondary_label || current.ownerSecondaryLabel,
          aboutTitle: full.aboutTitle || full.about_title || current.aboutTitle,
          aboutStory: full.aboutStory || full.about_story || current.aboutStory,
          feedbackActive: feedbackActiveResolved,
          feedbackTitle: full.feedbackTitle || full.feedback_title || current.feedbackTitle,
          feedbackDesc: full.feedbackDesc || full.feedback_desc || current.feedbackDesc,
          feedbackButtonLabel: full.feedbackButtonLabel || full.feedback_button_label || current.feedbackButtonLabel,
          finalCtaEyebrow: full.finalCtaEyebrow || full.final_cta_eyebrow || current.finalCtaEyebrow,
          finalCtaTitle: full.finalCtaTitle || full.final_cta_title || current.finalCtaTitle,
          finalCtaDesc: full.finalCtaDesc || full.final_cta_desc || current.finalCtaDesc,
          finalCtaButtonLabel: full.finalCtaButtonLabel || full.final_cta_button_label || current.finalCtaButtonLabel,
          footerTagline: full.footerTagline || full.footer_tagline || current.footerTagline,
          footerCopyright: full.footerCopyright || full.footer_copyright || current.footerCopyright,
          securityModalTitle: full.securityModalTitle || full.security_modal_title || current.securityModalTitle,
          securityModalDesc: full.securityModalDesc || full.security_modal_desc || current.securityModalDesc,
          securityModalNote: full.securityModalNote || full.security_modal_note || current.securityModalNote,
          legalPrivacy: full.legalPrivacy || full.legal_privacy || current.legalPrivacy,
          legalTerms: full.legalTerms || full.legal_terms || current.legalTerms,
          navLinks: resolveArray(full.navLinks, full.nav_links, current.navLinks),
          trustItems: resolveArray(full.trustItems, full.trust_items, current.trustItems),
          featureItems: resolveArray(full.featureItems, full.feature_items, current.featureItems),
          installSteps: resolveArray(full.installSteps, full.install_steps, current.installSteps),
          ownerSteps: resolveArray(full.ownerSteps, full.owner_steps, current.ownerSteps),
          faqItems: resolveArray(full.faqItems, full.faq_items, current.faqItems),
        }));
      } catch (e) {
        console.error('Failed to fetch dynamic settings', e);
      }
    }
    fetchConfig();
  }, []);

  // Realtime client-side sync of document title, description, favicon, app icon, and OG image
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
      linkIcon.setAttribute('href', appConfig.faviconUrl);
    }
    if (appConfig.appIconUrl) {
      let appleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement | null;
      if (!appleIcon) {
        appleIcon = document.createElement('link');
        appleIcon.setAttribute('rel', 'apple-touch-icon');
        document.head.appendChild(appleIcon);
      }
      appleIcon.setAttribute('href', appConfig.appIconUrl);
    }
    if (appConfig.ogImageUrl) {
      const ogImg = document.querySelector('meta[property="og:image"]');
      if (ogImg) ogImg.setAttribute('content', appConfig.ogImageUrl);
    }
  }, [appConfig.siteTitle, appConfig.siteDescription, appConfig.metaKeywords, appConfig.faviconUrl, appConfig.appIconUrl, appConfig.ogImageUrl]);

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
  const [activeInstallStep, setActiveInstallStep] = useState(0);
  const [completedInstallSteps, setCompletedInstallSteps] = useState<number[]>([]);
  const [legalModal, setLegalModal] = useState<{ open: boolean; title: string; content: string }>({
    open: false,
    title: '',
    content: '',
  });

  const handleInstallStepClick = (stepIndex: number) => {
    if (stepIndex === 3) {
      setActiveInstallStep(0);
      setCompletedInstallSteps([]);
      return;
    }

    setActiveInstallStep(stepIndex);
    setCompletedInstallSteps((completedSteps) =>
      completedSteps.includes(stepIndex)
        ? completedSteps
        : [...completedSteps, stepIndex]
    );
  };

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

    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
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
    <main style={{ '--burgundy': appConfig.brandColor || '#6D0808' } as React.CSSProperties}>
      {/* Scroll Progress Bar */}
      <div
        className="scroll-progress"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

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
                  Lihat Detail <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: 4 }} />
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
                  padding: '2px 6px',
                  opacity: 0.8,
                  fontSize: 14,
                }}
                aria-label="Tutup Pengumuman"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="site-header">
        <div className="shell nav-wrap">
          <a className="brand" href="#beranda">
            {appConfig.logoUrl && !logoFailed ? (
              <img
                src={appConfig.logoUrl}
                alt={appConfig.appName}
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

          <nav className="nav-links">
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
            onClick={() => setMenu(!menu)}
            aria-label="Toggle navigation menu"
          >
            <FontAwesomeIcon icon={menu ? faXmark : faBars} />
          </button>
        </div>

        {menu && (
          <nav className="mobile-menu">
            {activeNavLinks.map((item, i) => (
              <a href={item.href} key={item.href + i} onClick={() => setMenu(false)}>
                {item.label}
              </a>
            ))}
            <Button apk={apk} label={appConfig.heroCtaPrimaryLabel || 'Download APK'} />
          </nav>
        )}
      </header>

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
                {appConfig.heroCtaSecondaryLabel || 'Lihat Fitur'} <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: 6 }} />
              </a>
            </div>

            {/* Spec Capsule Under CTA */}
            <div style={{ marginTop: 14, fontSize: 11, color: '#f7d9c9', display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              <span>
                <FontAwesomeIcon icon={faBoxArchive} style={{ marginRight: 5 }} />
                {appConfig.versionName || 'v1.0.1'}
              </span>
              <span>•</span>
              <span>
                <FontAwesomeIcon icon={faAndroid} style={{ marginRight: 5 }} />
                {appConfig.minAndroid || 'Android 8.0+'}
              </span>
              <span>•</span>
              <span>
                <FontAwesomeIcon icon={faBolt} style={{ marginRight: 5 }} />
                {appConfig.apkSize || '6.9 MB'}
              </span>
              <span>•</span>
              <span>
                <FontAwesomeIcon icon={faCheck} style={{ marginRight: 5 }} />
                {appConfig.heroAdFreeText || 'Bebas Iklan'}
              </span>
              {appConfig.securityModalActive && (
                <>
                  <span>•</span>
                  <span
                    onClick={() => setShowModal(true)}
                    style={{ textDecoration: 'underline', cursor: 'pointer', color: '#fff' }}
                  >
                    Panduan Pasang APK
                  </span>
                </>
              )}
            </div>

            <div className="trust-row">
              <span>
                <FontAwesomeIcon icon={faShieldHalved} style={{ marginRight: 4 }} />
                {appConfig.heroTrustBadge1 || 'Mudah Digunakan'}
              </span>
              <span>
                <FontAwesomeIcon icon={faCompass} style={{ marginRight: 4 }} />
                {appConfig.heroTrustBadge2 || 'Data Terpercaya'}
              </span>
              <span>
                <FontAwesomeIcon icon={faArrowsRotate} style={{ marginRight: 4 }} />
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
                  appConfig.heroImageUrl
                    ? appConfig.heroImageUrl
                    : phoneFilter === 'Putri'
                    ? '/mockup-hero-putri.png'
                    : phoneFilter === 'Putra'
                    ? '/mockup-hero-putra.png'
                    : phoneFilter === 'Campur'
                    ? '/mockup-hero-campur.png'
                    : '/mockup-hero-semua.png'
                }
                alt={`Tampilan Aplikasi ${appConfig.appName} di Layar Smartphone 3D`}
                className="hero-3d-img"
              />
            </div>

            {/* Interactive Filter Pills Floating in Hero (Active when using default mockup) */}
            {!appConfig.heroImageUrl && (
              <div className="hero-filter-selector">
                <span className="hero-filter-label">Kategori:</span>
                {(['Semua', 'Putri', 'Putra', 'Campur'] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPhoneFilter(key)}
                    className={`hero-filter-chip ${phoneFilter === key ? 'active' : ''}`}
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
        <section className="promo-section reveal-on-scroll">
          <div className="shell">
            <div style={{ display: 'grid', gap: 16 }}>
              {promoAds.map((ad) => (
                <div key={ad.id} className="promo-banner-card">
                  <div className="promo-banner-content">
                    <p className="eyebrow" style={{ marginBottom: 4 }}>PROMOSI & EVENT KHUSUS</p>
                    <h3 style={{ fontSize: 20, fontWeight: 700, margin: '6px 0 8px' }}>{ad.title}</h3>
                    {ad.description && <p style={{ fontSize: 13, color: '#655955', margin: 0, lineHeight: 1.6 }}>{ad.description}</p>}
                    {(ad.target_url || ad.link) && (
                      <div style={{ marginTop: 14 }}>
                        <a
                          href={ad.target_url || ad.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="download"
                          style={{ minHeight: 38, padding: '0 18px', fontSize: 12 }}
                        >
                          Kunjungi Penawaran <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: 6 }} />
                        </a>
                      </div>
                    )}
                  </div>
                  {(ad.image_url || ad.image) && (
                    <img
                      src={ad.image_url || ad.image}
                      alt={ad.title}
                      className="promo-banner-img"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Prerelease Section with Scroll Animation */}
      <section className="section prerelease reveal-on-scroll">
        <div className="shell">
          <p className="eyebrow">VERSI PRA-RILIS</p>
          <h2>Mengapa mengunduh versi pra-rilis {appConfig.appName}?</h2>
          <p className="intro">Kenali manfaat dan informasi penting sebelum mencoba aplikasi kami.</p>

          <div className="trust-grid">
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
                src={`/mockup-install-${activeInstallStep + 1}.png`}
                alt={`Simulasi Instalasi Langkah ${activeInstallStep + 1}: ${
                  ['Download Berkas APK', 'Konfirmasi Dialog Keamanan', 'Izin Sumber Tidak Dikenal', 'Instalasi Selesai'][activeInstallStep] || 'Langkah Instalasi'
                }`}
                className="install-3d-img"
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
                  aria-label={`${stepItem.t}${completedInstallSteps.includes(idx) ? ' (sudah dipilih)' : ''}`}
                >
                  <span>{stepItem.n}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                      <h3>{stepItem.t}</h3>
                      {activeInstallStep === idx && (
                        <small style={{ fontSize: 8, color: 'var(--burgundy, #6D0808)', fontWeight: 700, background: '#f5e8e8', padding: '1px 5px', borderRadius: 4 }}>
                          Aktif
                        </small>
                      )}
                    </div>
                    <p>{stepItem.d}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="install-actions">
              <Button apk={apk} label={appConfig.heroCtaPrimaryLabel || 'Download APK'} />
              {appConfig.securityModalActive && (
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--burgundy, #6D0808)', fontWeight: 700, fontSize: 12, textDecoration: 'underline' }}
                >
                  Lihat Panduan Dialog Keamanan Android <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: 4 }} />
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
            <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a
                className="download"
                style={{ background: '#25D366' }}
                href={waOwnerUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faWhatsapp} style={{ marginRight: 6 }} />
                <span>{appConfig.ownerWaLabel || 'Daftar via WhatsApp'}</span>
              </a>
              <Button apk={apk} light label={appConfig.ownerSecondaryLabel || 'Download Aplikasi'} />
            </div>
          </div>

          <ol>
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
              <div style={{ marginTop: 14, fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6, color: '#52433e' }}>
                {appConfig.address && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FontAwesomeIcon icon={faMapPin} style={{ color: 'var(--burgundy, #6D0808)', width: 14 }} />
                    <span>{appConfig.address}</span>
                  </div>
                )}
                {appConfig.contactPhone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FontAwesomeIcon icon={faPhone} style={{ color: 'var(--burgundy, #6D0808)', width: 14 }} />
                    <span>{appConfig.contactPhone}</span>
                  </div>
                )}
                {appConfig.supportEmail && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FontAwesomeIcon icon={faEnvelope} style={{ color: 'var(--burgundy, #6D0808)', width: 14 }} />
                    <span>{appConfig.supportEmail}</span>
                  </div>
                )}
              </div>

              <div className="social-links" style={{ marginTop: 16, flexWrap: 'wrap', gap: 14 }}>
                <a href={appConfig.githubUrl || repo} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <FontAwesomeIcon icon={faGithub} /> GitHub
                </a>
                <a href={waHelpUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#1ebe5d' }}>
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
                <FontAwesomeIcon icon={faWhatsapp} style={{ marginRight: 6 }} />
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

      {/* Footer */}
      <footer>
        <div className="shell footer-grid">
          <div>
            <a href="#beranda" className="brand">
              {(appConfig.footerLogoUrl || appConfig.logoUrl) && !footerLogoFailed ? (
                <img
                  src={appConfig.footerLogoUrl || appConfig.logoUrl}
                  alt={appConfig.appName}
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
            {appConfig.address && <p style={{ fontSize: 11, marginTop: 4, opacity: 0.8 }}>{appConfig.address}</p>}

            <div style={{ display: 'flex', gap: 14, fontSize: 11, marginTop: 12, opacity: 0.85 }}>
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

          <nav>
            {activeNavLinks.map((item, i) => (
              <a href={item.href} key={item.href + i}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="footer-social">
            <a href={appConfig.githubUrl || repo} target="_blank" rel="noopener noreferrer" title="GitHub">
              <FontAwesomeIcon icon={faGithub} size="lg" />
            </a>
            <a href={waHelpUrl} target="_blank" rel="noopener noreferrer" title="WhatsApp" style={{ color: '#25D366' }}>
              <FontAwesomeIcon icon={faWhatsapp} size="lg" />
            </a>
            {appConfig.instagram && (
              <a href={appConfig.instagram} target="_blank" rel="noopener noreferrer" title="Instagram" style={{ color: '#E1306C' }}>
                <FontAwesomeIcon icon={faInstagram} size="lg" />
              </a>
            )}
            {appConfig.facebook && (
              <a href={appConfig.facebook} target="_blank" rel="noopener noreferrer" title="Facebook" style={{ color: '#1877F2' }}>
                <FontAwesomeIcon icon={faFacebook} size="lg" />
              </a>
            )}
            {appConfig.tiktok && (
              <a href={appConfig.tiktok} target="_blank" rel="noopener noreferrer" title="TikTok">
                <FontAwesomeIcon icon={faTiktok} size="lg" />
              </a>
            )}
            {appConfig.youtube && (
              <a href={appConfig.youtube} target="_blank" rel="noopener noreferrer" title="YouTube" style={{ color: '#FF0000' }}>
                <FontAwesomeIcon icon={faYoutube} size="lg" />
              </a>
            )}
            {appConfig.linkedin && (
              <a href={appConfig.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn" style={{ color: '#0A66C2' }}>
                <FontAwesomeIcon icon={faLinkedin} size="lg" />
              </a>
            )}
          </div>
        </div>
        <div className="shell copyright">{appConfig.footerCopyright || `© 2026 ${appConfig.appName}. All rights reserved.`}</div>
      </footer>

      {/* Floating WhatsApp Quick Action */}
      <a
        href={waHelpUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-wa"
        title="Chat WhatsApp Bantuan"
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
            try { sessionStorage.setItem('ckk_popup_dismissed', 'true'); } catch (_) {}
          }}
        >
          <div
            className="modal-box"
            style={{ maxWidth: 480, textAlign: 'center', padding: '24px 20px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => {
                setShowPopupModal(false);
                try { sessionStorage.setItem('ckk_popup_dismissed', 'true'); } catch (_) {}
              }}
              aria-label="Tutup Dialog"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
            {appConfig.popupImageUrl && (
              <div style={{ marginBottom: 16, borderRadius: 10, overflow: 'hidden', maxHeight: 220 }}>
                <img
                  src={appConfig.popupImageUrl}
                  alt={appConfig.popupTitle || 'Pop-up'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}
            {appConfig.popupTitle && (
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--burgundy, #6D0808)', marginBottom: 8 }}>
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
                    try { sessionStorage.setItem('ckk_popup_dismissed', 'true'); } catch (_) {}
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
                  try { sessionStorage.setItem('ckk_popup_dismissed', 'true'); } catch (_) {}
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
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)} aria-label="Tutup">
              <FontAwesomeIcon icon={faXmark} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--burgundy, #6D0808)', fontWeight: 700, fontSize: 16 }}>
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
            <p style={{ fontSize: 11, color: '#8A7F79', marginTop: 10 }}>
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
          <div className="modal-box" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setLegalModal({ open: false, title: '', content: '' })} aria-label="Tutup">
              <FontAwesomeIcon icon={faXmark} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--burgundy, #6D0808)', fontWeight: 700, fontSize: 16 }}>
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
  );
}
