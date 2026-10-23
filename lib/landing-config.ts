/**
 * Shared landing-page content model.
 *
 * The server component, the client component and `generateMetadata` all map
 * the CMS payload through `resolveSettings`, so the rendered HTML, the
 * hydrated UI and the SEO tags can never disagree about the content.
 */
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
export const defaultConfig: AppConfigState = {
  appName: 'CariKostKita',
  tagline: 'Temukan Kost Nyaman & Terpercaya di Pekanbaru',
  heroText: 'CariKostKita hadir untuk memudahkan kamu menemukan kost terbaik di Pekanbaru. Dengan tampilan yang simpel, cepat, dan lengkap, semua kebutuhan kost ada di genggaman.',
  versionName: 'v1.1.2',
  releaseNotes: 'Rilis resmi CariKostKita v1.1.2 untuk mahasiswa dan warga Pekanbaru.',
  supportEmail: 'support@carikostkita.id',
  contactPhone: '0761-555-0123',
  address: 'Jl. Soekarno Hatta No. 1, Pekanbaru, Riau',
  siteTitle: 'CariKostKita - Cari Kost Terpercaya di Pekanbaru',
  siteDescription: 'Platform pencarian kost terverifikasi dengan info harga, lokasi, dan fasilitas akurat.',
  metaKeywords: 'cari kost pekanbaru, kost UIR, kost UNRI, kost Bukit Raya, APK CariKostKita',
  targetCity: 'Pekanbaru',
  apkSize: '3.3 MB',
  minAndroid: 'Android 8.0+',
  heroBadge1: 'Lokasi dekat kampus & area strategis',
  heroBadge2: 'Detail kost & foto kamar lengkap',
  apk: 'https://github.com/WalZetass-kar/CariKostKita/releases/download/v1.1.2/CariKostKita-v1.1.2-release.apk',
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
  githubUrl: 'https://github.com/WalZetass-kar/CariKostKita',
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
    { id: 'faq-1', question: 'Mengapa aplikasi belum ada di Google Play Store?', answer: 'Aplikasi dirilis resmi lewat GitHub, sehingga kamu bisa mengunduh berkas APK langsung dan terverifikasi tanpa menunggu proses peninjauan Play Store.', order: 1, is_active: true },
    { id: 'faq-2', question: 'Apakah aman menginstal file APK ini?', answer: 'Sangat aman. Berkas APK dikompilasi langsung dari repositori resmi proyek tanpa injeksi kode pihak ketiga. Android akan menampilkan dialog standar yang aman untuk disetujui.', order: 2, is_active: true },
    { id: 'faq-3', question: 'Versi Android apa yang didukung?', answer: 'Mendukung Android 8.0+ hingga versi Android yang lebih baru dengan ukuran hemat kuota.', order: 3, is_active: true },
    { id: 'faq-4', question: 'Apakah mencari kost dikenakan biaya?', answer: 'Tidak. Layanan pencarian kost 100% gratis untuk para pencari kost tanpa biaya langganan, biaya admin, maupun komisi perantara.', order: 4, is_active: true },
    { id: 'faq-5', question: 'Bagaimana jika data kost tidak sesuai?', answer: 'Gunakan fitur lapor di aplikasi atau hubungi kami langsung via WhatsApp atau email bantuan. Tim verifikasi kami akan segera menindaklanjuti.', order: 5, is_active: true },
    { id: 'faq-6', question: 'Apakah pemilik kost bisa langsung mengunggah?', answer: 'Bisa! Setiap pengajuan kost akan ditinjau oleh tim kurasi kami dalam 1x24 jam untuk mencegah penipuan dan memastikan listing valid.', order: 6, is_active: true },
  ],
};

/** Prefer an explicitly empty array over falling back to the default list. */
const resolveArray = <T,>(camelArr: any, snakeArr: any, currentArr: T[]): T[] => {
  if (Array.isArray(camelArr)) return camelArr;
  if (Array.isArray(snakeArr)) return snakeArr;
  return currentArr;
};

const isFalse = (val: any) => val === false || val === 'false' || val === 0 || val === '0';
const isTrue = (val: any) => val === true || val === 'true' || val === 1 || val === '1';

const resolveFlag = (camel: any, snake: any, fallback: boolean): boolean => {
  if (isFalse(camel) || isFalse(snake)) return false;
  if (isTrue(camel) || isTrue(snake)) return true;
  return fallback;
};

/**
 * Map a raw settings payload (snake_case and/or camelCase) onto the landing
 * page configuration. `base` supplies the fallback for every missing field.
 */
export function resolveSettings(
  raw: Record<string, any> | null | undefined,
  base: AppConfigState = defaultConfig
): AppConfigState {
  const full = raw || {};
  const current = base;

  return {
    ...current,
    appName: full.appName ?? full.app_name ?? current.appName,
    tagline: full.tagline ?? current.tagline,
    heroText:
      full.heroSubheadline ??
      full.hero_subheadline ??
      full.siteDescription ??
      full.site_description ??
      current.heroText,
    versionName: full.versionName ?? full.version_name ?? current.versionName,
    releaseNotes: full.releaseNotes ?? full.release_notes ?? current.releaseNotes,
    supportEmail: full.supportEmail ?? full.support_email ?? current.supportEmail,
    contactPhone: full.contactPhone ?? full.contact_phone ?? current.contactPhone,
    address: full.address ?? full.office_address ?? current.address,
    siteTitle: full.siteTitle ?? full.site_title ?? current.siteTitle,
    siteDescription: full.siteDescription ?? full.site_description ?? current.siteDescription,
    metaKeywords: full.metaKeywords ?? full.meta_keywords ?? current.metaKeywords,
    targetCity: full.targetCity ?? full.target_city ?? current.targetCity,
    apkSize: full.apkSize ?? full.apk_size ?? current.apkSize,
    minAndroid: full.minAndroid ?? full.min_android ?? current.minAndroid,
    heroBadge1: full.heroBadge1 ?? full.hero_badge_1 ?? current.heroBadge1,
    heroBadge2: full.heroBadge2 ?? full.hero_badge_2 ?? current.heroBadge2,
    apk: full.apkUrl || full.apk_url || (full.apk as string | undefined) || current.apk,
    waNumber:
      full.whatsapp ||
      full.contact_whatsapp ||
      (full.waNumber as string | undefined) ||
      current.waNumber,
    bannerActive: resolveFlag(full.bannerActive, full.banner_active, current.bannerActive),
    bannerText: full.bannerText ?? full.banner_text ?? current.bannerText,
    bannerLink: full.bannerLink ?? full.banner_link ?? current.bannerLink,
    bannerType: full.bannerType ?? full.banner_type ?? current.bannerType,
    heroImageUrl: full.heroImageUrl ?? full.hero_image_url ?? current.heroImageUrl,
    logoUrl: full.logoUrl ?? full.logo_url ?? current.logoUrl,
    footerLogoUrl: full.footerLogoUrl ?? full.footer_logo_url ?? current.footerLogoUrl,
    appIconUrl: full.appIconUrl ?? full.app_icon_url ?? current.appIconUrl,
    faviconUrl: full.faviconUrl ?? full.favicon_url ?? current.faviconUrl,
    ogImageUrl: full.ogImageUrl ?? full.og_image_url ?? current.ogImageUrl,
    popupActive: resolveFlag(full.popupActive, full.popup_active, current.popupActive),
    popupTitle: full.popupTitle ?? full.popup_title ?? current.popupTitle,
    popupContent: full.popupContent ?? full.popup_content ?? current.popupContent,
    popupImageUrl: full.popupImageUrl ?? full.popup_image_url ?? current.popupImageUrl,
    popupButtonLabel: full.popupButtonLabel ?? full.popup_button_label ?? current.popupButtonLabel,
    popupButtonUrl: full.popupButtonUrl ?? full.popup_button_url ?? current.popupButtonUrl,
    securityModalActive: resolveFlag(
      full.securityModalActive,
      full.security_modal_active,
      current.securityModalActive
    ),
    brandColor: full.brandColor ?? full.brand_color ?? current.brandColor,
    githubUrl: full.githubUrl ?? full.github_url ?? current.githubUrl,
    instagram: full.instagram ?? current.instagram,
    facebook: full.facebook ?? current.facebook,
    tiktok: full.tiktok ?? current.tiktok,
    youtube: full.youtube ?? current.youtube,
    linkedin: full.linkedin ?? current.linkedin,
    heroHeadline:
      full.heroHeadline ?? full.hero_headline ?? full.tagline ?? current.heroHeadline,
    heroSubheadline:
      full.heroSubheadline ?? full.hero_subheadline ?? current.heroSubheadline,
    heroCtaPrimaryLabel:
      full.heroCtaPrimaryLabel ?? full.hero_cta_primary_label ?? current.heroCtaPrimaryLabel,
    heroCtaSecondaryLabel:
      full.heroCtaSecondaryLabel ?? full.hero_cta_secondary_label ?? current.heroCtaSecondaryLabel,
    heroCtaSecondaryLink:
      full.heroCtaSecondaryLink ?? full.hero_cta_secondary_link ?? current.heroCtaSecondaryLink,
    heroAdFreeText: full.heroAdFreeText ?? full.hero_ad_free_text ?? current.heroAdFreeText,
    heroTrustBadge1: full.heroTrustBadge1 ?? full.hero_trust_badge_1 ?? current.heroTrustBadge1,
    heroTrustBadge2: full.heroTrustBadge2 ?? full.hero_trust_badge_2 ?? current.heroTrustBadge2,
    heroTrustBadge3: full.heroTrustBadge3 ?? full.hero_trust_badge_3 ?? current.heroTrustBadge3,
    ownerTitle: full.ownerTitle ?? full.owner_title ?? current.ownerTitle,
    ownerIntro: full.ownerIntro ?? full.owner_intro ?? current.ownerIntro,
    ownerWaLabel: full.ownerWaLabel ?? full.owner_wa_label ?? current.ownerWaLabel,
    ownerSecondaryLabel:
      full.ownerSecondaryLabel ?? full.owner_secondary_label ?? current.ownerSecondaryLabel,
    aboutTitle: full.aboutTitle ?? full.about_title ?? current.aboutTitle,
    aboutStory: full.aboutStory ?? full.about_story ?? current.aboutStory,
    feedbackActive: resolveFlag(full.feedbackActive, full.feedback_active, current.feedbackActive),
    feedbackTitle: full.feedbackTitle ?? full.feedback_title ?? current.feedbackTitle,
    feedbackDesc: full.feedbackDesc ?? full.feedback_desc ?? current.feedbackDesc,
    feedbackButtonLabel:
      full.feedbackButtonLabel ?? full.feedback_button_label ?? current.feedbackButtonLabel,
    finalCtaEyebrow: full.finalCtaEyebrow ?? full.final_cta_eyebrow ?? current.finalCtaEyebrow,
    finalCtaTitle: full.finalCtaTitle ?? full.final_cta_title ?? current.finalCtaTitle,
    finalCtaDesc: full.finalCtaDesc ?? full.final_cta_desc ?? current.finalCtaDesc,
    finalCtaButtonLabel:
      full.finalCtaButtonLabel ?? full.final_cta_button_label ?? current.finalCtaButtonLabel,
    footerTagline: full.footerTagline ?? full.footer_tagline ?? current.footerTagline,
    footerCopyright: full.footerCopyright ?? full.footer_copyright ?? current.footerCopyright,
    securityModalTitle:
      full.securityModalTitle ?? full.security_modal_title ?? current.securityModalTitle,
    securityModalDesc:
      full.securityModalDesc ?? full.security_modal_desc ?? current.securityModalDesc,
    securityModalNote:
      full.securityModalNote ?? full.security_modal_note ?? current.securityModalNote,
    legalPrivacy: full.legalPrivacy ?? full.legal_privacy ?? current.legalPrivacy,
    legalTerms: full.legalTerms ?? full.legal_terms ?? current.legalTerms,
    navLinks: resolveArray(full.navLinks, full.nav_links, current.navLinks),
    trustItems: resolveArray(full.trustItems, full.trust_items, current.trustItems),
    featureItems: resolveArray(full.featureItems, full.feature_items, current.featureItems),
    installSteps: resolveArray(full.installSteps, full.install_steps, current.installSteps),
    ownerSteps: resolveArray(full.ownerSteps, full.owner_steps, current.ownerSteps),
    faqItems: resolveArray(full.faqItems, full.faq_items, current.faqItems),
  };
}
