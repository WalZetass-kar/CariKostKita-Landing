import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

async function safeJson(res: Response | null | undefined) {
  if (!res || !res.ok) return null;
  try {
    const text = await res.text();
    if (!text || !text.trim()) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

const snakeToCamel = (value: string) =>
  value.replace(/_([a-z0-9])/g, (_match, char: string) => char.toUpperCase());

/**
 * The authoritative payload defines snake_case fields plus camelCase aliases.
 * When it is present, its snake_case values must also overwrite every
 * camelCase alias that came from a weaker mirror. Otherwise a stale
 * camelCase copy would win in the normalization below and an admin edit
 * would silently disappear from the landing page.
 */
const applyAuthoritativeAliases = (
  target: Record<string, any>,
  source: Record<string, any> | null | undefined
): Record<string, any> => {
  if (!source) return target;
  for (const [key, value] of Object.entries(source)) {
    if (!key.includes('_')) continue;
    const camel = snakeToCamel(key);
    if (camel !== key) target[camel] = value;
  }
  return target;
};

export async function GET() {
  const primaryApiUrl = (
    process.env.NEXT_PUBLIC_CARIKOSTKITA_API_URL ||
    'https://carikostkitafastapi.vercel.app'
  ).replace(/\/+$/, '');

  const fallbackAdminUrl = (
    process.env.ADMIN_GUE_API_URL ||
    'https://admin-carikostkita.vercel.app'
  ).replace(/\/+$/, '');

  let adminLocalSettings: Record<string, any> = {};

  // 1. Optional local mirror of the admin dashboard (local development only).
  //    It is opt-in through an explicit environment variable so a developer
  //    machine can never silently override the production database, and no
  //    machine-specific absolute path is ever shipped in the repository.
  const explicitDbPath = process.env.ADMIN_GUE_LOCAL_DB_PATH;
  const possibleDbPaths = explicitDbPath
    ? [path.resolve(explicitDbPath)]
    : [path.resolve(process.cwd(), '../Admin-Gue/data/db.json')];

  for (const dbPath of possibleDbPaths) {
    try {
      if (fs.existsSync(dbPath)) {
        const raw = fs.readFileSync(dbPath, 'utf-8');
        if (raw && raw.trim()) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.system && typeof parsed.system === 'object') {
            adminLocalSettings = parsed.system;
            break;
          }
        }
      }
    } catch {}
  }

  // 2. HTTP check for Admin-Gue public settings endpoint (mirror)
  let adminHttpSettings: Record<string, any> = {};
  try {
    const res = await fetch(`${fallbackAdminUrl}/api/public/settings`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    const json = await safeJson(res);
    if (json) {
      adminHttpSettings = json.settings || json.data || json || {};
    }
  } catch {}

  // 3. HTTP check for FastAPI public settings endpoint (authoritative)
  let fastApiSettings: Record<string, any> = {};
  try {
    const res = await fetch(`${primaryApiUrl}/api/v1/public/settings`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    const json = await safeJson(res);
    if (json) {
      fastApiSettings = json.data || json || {};
    }
  } catch {}

  const defaults = {
    appName: 'CariKostKita',
    tagline: 'Temukan Kost Nyaman & Terpercaya di Pekanbaru',
    siteDescription: 'Platform pencarian kost terverifikasi dengan info harga, lokasi, dan fasilitas akurat.',
    versionName: 'v1.1.2',
    releaseNotes: 'Rilis resmi CariKostKita v1.1.2 untuk mahasiswa dan warga Pekanbaru.',
    supportEmail: 'support@carikostkita.id',
    contactPhone: '0761-555-0123',
    address: 'Jl. Soekarno Hatta No. 1, Pekanbaru, Riau',
    siteTitle: 'CariKostKita - Cari Kost Terpercaya di Pekanbaru',
    metaKeywords: 'cari kost pekanbaru, kost UIR, kost UNRI, kost Bukit Raya, APK CariKostKita',
    targetCity: 'Pekanbaru',
    apkSize: '3.3 MB',
    minAndroid: 'Android 8.0+',
    heroBadge1: 'Lokasi dekat kampus & area strategis',
    heroBadge2: 'Detail kost & foto kamar lengkap',
    apkUrl: 'https://github.com/WalZetass-kar/CariKostKita/releases/download/v1.1.2/CariKostKita-v1.1.2-release.apk',
    whatsapp: '6281270008899',
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
      { id: 'feat-2', icon: 'file-lines', title: 'Informasi Lengkap', desc: 'Lihat detail kamar, foto asli terverifikasi, fasilitas lengkap, serta kontak langsung pemilik tanpa perantara.', order: 2, is_active: true },
      { id: 'feat-3', icon: 'location-dot', title: 'Lokasi Strategis', desc: 'Pilihan kost terverifikasi di area strategis yang dekat dengan kampus dan pusat aktivitas.', order: 3, is_active: true },
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

  // Merge hierarchy (weakest first):
  //   defaults -> local mirror -> Admin-Gue mirror -> FastAPI (authoritative)
  // The durable database state must always win. The mirrors only fill gaps
  // when the authoritative source is unavailable.
  const merged: Record<string, any> = applyAuthoritativeAliases(
    {
      ...defaults,
      ...adminLocalSettings,
      ...adminHttpSettings,
      ...fastApiSettings,
    },
    fastApiSettings
  );

  // Resolve list fields prioritizing non-empty arrays
  const resolveList = (camel: string, snake: string, fallback: any[]) => {
    const list = merged[camel] || merged[snake];
    return Array.isArray(list) && list.length > 0 ? list : fallback;
  };

  // Normalize all fields for both camelCase and snake_case consumption
  const normalized = {
    ...merged,
    // Realtime revision: highest known revision wins so subscribers can
    // dedupe and order rapid sequential admin saves.
    revision: Math.max(
      Number(merged.revision ?? 0) || 0,
      Number(merged._revision ?? 0) || 0
    ),
    updated_at: merged.updated_at || merged._updated_at || '',
    appName: merged.appName || merged.app_name || defaults.appName,
    app_name: merged.app_name || merged.appName || defaults.appName,
    tagline: merged.tagline ?? defaults.tagline,
    whatsapp: merged.whatsapp || merged.contact_whatsapp || defaults.whatsapp,
    contact_whatsapp: merged.contact_whatsapp || merged.whatsapp || defaults.whatsapp,
    apkUrl: merged.apkUrl || merged.apk_url || defaults.apkUrl,
    apk_url: merged.apk_url || merged.apkUrl || defaults.apkUrl,
    versionName: merged.versionName || merged.version_name || defaults.versionName,
    version_name: merged.version_name || merged.version_name || defaults.versionName,
    releaseNotes: merged.releaseNotes || merged.release_notes || defaults.releaseNotes,
    release_notes: merged.release_notes || merged.releaseNotes || defaults.releaseNotes,
    supportEmail: merged.supportEmail || merged.support_email || defaults.supportEmail,
    support_email: merged.support_email || merged.supportEmail || defaults.supportEmail,
    contactPhone: merged.contactPhone || merged.contact_phone || defaults.contactPhone,
    contact_phone: merged.contact_phone || merged.contactPhone || defaults.contactPhone,
    address: merged.address || merged.office_address || defaults.address,
    office_address: merged.office_address || merged.address || defaults.address,
    siteTitle: merged.siteTitle || merged.site_title || defaults.siteTitle,
    site_title: merged.site_title || merged.siteTitle || defaults.siteTitle,
    siteDescription: merged.siteDescription || merged.site_description || defaults.siteDescription,
    site_description: merged.site_description || merged.siteDescription || defaults.siteDescription,
    metaKeywords: merged.metaKeywords || merged.meta_keywords || defaults.metaKeywords,
    meta_keywords: merged.meta_keywords || merged.metaKeywords || defaults.metaKeywords,
    targetCity: merged.targetCity || merged.target_city || defaults.targetCity,
    target_city: merged.target_city || merged.targetCity || defaults.targetCity,
    apkSize: merged.apkSize || merged.apk_size || defaults.apkSize,
    apk_size: merged.apk_size || merged.apkSize || defaults.apkSize,
    minAndroid: merged.minAndroid || merged.min_android || defaults.minAndroid,
    min_android: merged.min_android || merged.minAndroid || defaults.minAndroid,
    heroBadge1: merged.heroBadge1 || merged.hero_badge_1 || defaults.heroBadge1,
    hero_badge_1: merged.hero_badge_1 || merged.heroBadge1 || defaults.heroBadge1,
    heroBadge2: merged.heroBadge2 || merged.hero_badge_2 || defaults.heroBadge2,
    hero_badge_2: merged.hero_badge_2 || merged.heroBadge2 || defaults.heroBadge2,
    bannerActive: merged.bannerActive === false || merged.banner_active === false ? false : Boolean(merged.bannerActive ?? merged.banner_active ?? defaults.bannerActive),
    banner_active: merged.banner_active === false || merged.bannerActive === false ? false : Boolean(merged.banner_active ?? merged.bannerActive ?? defaults.bannerActive),
    bannerText: merged.bannerText ?? merged.banner_text ?? defaults.bannerText,
    banner_text: merged.banner_text ?? merged.bannerText ?? defaults.bannerText,
    bannerLink: merged.bannerLink ?? merged.banner_link ?? defaults.bannerLink,
    banner_link: merged.banner_link ?? merged.bannerLink ?? defaults.bannerLink,
    bannerType: merged.bannerType || merged.banner_type || defaults.bannerType,
    banner_type: merged.banner_type || merged.bannerType || defaults.bannerType,
    popupActive: merged.popupActive === false || merged.popup_active === false ? false : Boolean(merged.popupActive ?? merged.popup_active ?? defaults.popupActive),
    popup_active: merged.popup_active === false || merged.popupActive === false ? false : Boolean(merged.popup_active ?? merged.popupActive ?? defaults.popupActive),
    popupTitle: merged.popupTitle ?? merged.popup_title ?? defaults.popupTitle,
    popup_title: merged.popup_title ?? merged.popupTitle ?? defaults.popupTitle,
    popupContent: merged.popupContent ?? merged.popup_content ?? defaults.popupContent,
    popup_content: merged.popup_content ?? merged.popupContent ?? defaults.popupContent,
    popupImageUrl: merged.popupImageUrl ?? merged.popup_image_url ?? defaults.popupImageUrl,
    popup_image_url: merged.popup_image_url ?? merged.popupImageUrl ?? defaults.popupImageUrl,
    popupButtonLabel: merged.popupButtonLabel ?? merged.popup_button_label ?? defaults.popupButtonLabel,
    popup_button_label: merged.popup_button_label ?? merged.popupButtonLabel ?? defaults.popupButtonLabel,
    popupButtonUrl: merged.popupButtonUrl ?? merged.popup_button_url ?? defaults.popupButtonUrl,
    popup_button_url: merged.popup_button_url ?? merged.popupButtonUrl ?? defaults.popupButtonUrl,
    heroImageUrl: merged.heroImageUrl ?? merged.hero_image_url ?? defaults.heroImageUrl,
    hero_image_url: merged.hero_image_url ?? merged.heroImageUrl ?? defaults.heroImageUrl,
    logoUrl: merged.logoUrl ?? merged.logo_url ?? defaults.logoUrl,
    logo_url: merged.logo_url ?? merged.logoUrl ?? defaults.logoUrl,
    footerLogoUrl: merged.footerLogoUrl ?? merged.footer_logo_url ?? defaults.footerLogoUrl,
    footer_logo_url: merged.footer_logo_url ?? merged.footerLogoUrl ?? defaults.footerLogoUrl,
    appIconUrl: merged.appIconUrl ?? merged.app_icon_url ?? defaults.appIconUrl,
    app_icon_url: merged.app_icon_url ?? merged.appIconUrl ?? defaults.appIconUrl,
    faviconUrl: merged.faviconUrl ?? merged.favicon_url ?? defaults.faviconUrl,
    favicon_url: merged.favicon_url ?? merged.faviconUrl ?? defaults.faviconUrl,
    ogImageUrl: merged.ogImageUrl ?? merged.og_image_url ?? defaults.ogImageUrl,
    og_image_url: merged.og_image_url ?? merged.ogImageUrl ?? defaults.ogImageUrl,
    githubUrl: merged.githubUrl || merged.github_url || defaults.githubUrl,
    github_url: merged.github_url || merged.githubUrl || defaults.githubUrl,
    brandColor: merged.brandColor || merged.brand_color || defaults.brandColor,
    brand_color: merged.brand_color || merged.brandColor || defaults.brandColor,
    instagram: merged.instagram ?? defaults.instagram,
    facebook: merged.facebook ?? defaults.facebook,
    tiktok: merged.tiktok ?? defaults.tiktok,
    youtube: merged.youtube ?? defaults.youtube,
    linkedin: merged.linkedin ?? defaults.linkedin,

    heroHeadline: merged.heroHeadline ?? merged.hero_headline ?? defaults.heroHeadline,
    heroSubheadline: merged.heroSubheadline ?? merged.hero_subheadline ?? defaults.heroSubheadline,
    heroCtaPrimaryLabel: merged.heroCtaPrimaryLabel ?? merged.hero_cta_primary_label ?? defaults.heroCtaPrimaryLabel,
    heroCtaSecondaryLabel: merged.heroCtaSecondaryLabel ?? merged.hero_cta_secondary_label ?? defaults.heroCtaSecondaryLabel,
    heroCtaSecondaryLink: merged.heroCtaSecondaryLink ?? merged.hero_cta_secondary_link ?? defaults.heroCtaSecondaryLink,
    heroAdFreeText: merged.heroAdFreeText ?? merged.hero_ad_free_text ?? defaults.heroAdFreeText,
    heroTrustBadge1: merged.heroTrustBadge1 ?? merged.hero_trust_badge_1 ?? defaults.heroTrustBadge1,
    heroTrustBadge2: merged.heroTrustBadge2 ?? merged.hero_trust_badge_2 ?? defaults.heroTrustBadge2,
    heroTrustBadge3: merged.heroTrustBadge3 ?? merged.hero_trust_badge_3 ?? defaults.heroTrustBadge3,

    ownerTitle: merged.ownerTitle ?? merged.owner_title ?? defaults.ownerTitle,
    ownerIntro: merged.ownerIntro ?? merged.owner_intro ?? defaults.ownerIntro,
    ownerWaLabel: merged.ownerWaLabel ?? merged.owner_wa_label ?? defaults.ownerWaLabel,

    aboutTitle: merged.aboutTitle ?? merged.about_title ?? defaults.aboutTitle,
    aboutStory: merged.aboutStory ?? merged.about_story ?? defaults.aboutStory,

    feedbackActive: Boolean(merged.feedbackActive ?? merged.feedback_active ?? defaults.feedbackActive),
    feedbackTitle: merged.feedbackTitle ?? merged.feedback_title ?? defaults.feedbackTitle,
    feedbackDesc: merged.feedbackDesc ?? merged.feedback_desc ?? defaults.feedbackDesc,
    feedbackButtonLabel: merged.feedbackButtonLabel ?? merged.feedback_button_label ?? defaults.feedbackButtonLabel,

    finalCtaEyebrow: merged.finalCtaEyebrow ?? merged.final_cta_eyebrow ?? defaults.finalCtaEyebrow,
    finalCtaTitle: merged.finalCtaTitle ?? merged.final_cta_title ?? defaults.finalCtaTitle,
    finalCtaDesc: merged.finalCtaDesc ?? merged.final_cta_desc ?? defaults.finalCtaDesc,
    finalCtaButtonLabel: merged.finalCtaButtonLabel ?? merged.final_cta_button_label ?? defaults.finalCtaButtonLabel,

    footerTagline: merged.footerTagline ?? merged.footer_tagline ?? defaults.footerTagline,
    footerCopyright: merged.footerCopyright ?? merged.footer_copyright ?? defaults.footerCopyright,

    securityModalActive: merged.securityModalActive === false || merged.security_modal_active === false ? false : Boolean(merged.securityModalActive ?? merged.security_modal_active ?? defaults.securityModalActive),
    security_modal_active: merged.security_modal_active === false || merged.securityModalActive === false ? false : Boolean(merged.security_modal_active ?? merged.securityModalActive ?? defaults.securityModalActive),
    securityModalTitle: merged.securityModalTitle ?? merged.security_modal_title ?? defaults.securityModalTitle,
    securityModalDesc: merged.securityModalDesc ?? merged.security_modal_desc ?? defaults.securityModalDesc,
    securityModalNote: merged.securityModalNote ?? merged.security_modal_note ?? defaults.securityModalNote,

    legalPrivacy: merged.legalPrivacy ?? merged.legal_privacy ?? defaults.legalPrivacy,
    legalTerms: merged.legalTerms ?? merged.legal_terms ?? defaults.legalTerms,

    // Lists
    navLinks: resolveList('navLinks', 'nav_links', defaults.navLinks),
    trustItems: resolveList('trustItems', 'trust_items', defaults.trustItems),
    featureItems: resolveList('featureItems', 'feature_items', defaults.featureItems),
    installSteps: resolveList('installSteps', 'install_steps', defaults.installSteps),
    ownerSteps: resolveList('ownerSteps', 'owner_steps', defaults.ownerSteps),
    faqItems: resolveList('faqItems', 'faq_items', defaults.faqItems),
  };

  return NextResponse.json(
    {
      success: true,
      data: normalized,
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}
