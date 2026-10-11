'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faDownload,
  faSearch,
  faLocationDot,
  faHeart,
  faCommentDots,
  faUser,
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
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import {
  faAndroid,
  faWhatsapp,
  faGithub
} from '@fortawesome/free-brands-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

config.autoAddCss = false;

const apk = 'https://github.com/g-423/KosKita/releases/download/v1.0.0-beta/CariKostKita-v1.0.0-beta.apk';
const publicApiUrl = process.env.NEXT_PUBLIC_CARIKOSTKITA_API_URL || 'https://carikostkitafastapi.vercel.app';
const repo = 'https://github.com/g-423/KosKita';
const waNumber = '6281270008899';
const waHelpUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent('Halo Admin CariKostKita, saya butuh informasi seputar aplikasi kost Pekanbaru.')}`;
const waOwnerUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent('Halo Admin CariKostKita, saya pemilik kost di Pekanbaru ingin mendaftarkan properti saya.')}`;

const nav = [
  ['#beranda', 'Beranda'],
  ['#fitur', 'Fitur'],
  ['#install', 'Cara Install'],
  ['#pemilik', 'Untuk Pemilik Kost'],
  ['#faq', 'FAQ'],
];

const Button = ({ light = false, label = 'Download APK' }: { light?: boolean; label?: string }) => (
  <a className={`download ${light ? 'download--light' : ''}`} href={apk}>
    <FontAwesomeIcon icon={faDownload} style={{ marginRight: 6 }} />
    <span>{label}</span>
  </a>
);



interface TrustOrFeature {
  icon: IconDefinition;
  title: string;
  desc: string;
}

const trust: TrustOrFeature[] = [
  { icon: faShieldHalved, title: 'Berkas resmi & terverifikasi', desc: 'Dirilis dari source code resmi GitHub tanpa adware atau virus tersembunyi.' },
  { icon: faBolt, title: 'Ringan & hemat kuota', desc: 'Ukuran sekitar 6.9 MB agar sangat cepat diunduh tanpa membebani memori ponsel.' },
  { icon: faLock, title: 'Izin yang masuk akal', desc: 'Hanya izin lokasi untuk navigasi peta kost dan galeri foto bagi pemilik kost.' },
];

const features: TrustOrFeature[] = [
  { icon: faSearch, title: 'Pencarian Mudah', desc: 'Temukan kost sesuai lokasi kampus, range harga, dan fasilitas yang kamu butuhkan.' },
  { icon: faFileLines, title: 'Informasi Lengkap', desc: 'Lihat detail kost, foto asli, fasilitas lengkap, serta kontak langsung pemilik.' },
  { icon: faLocationDot, title: 'Lokasi Strategis', desc: 'Banyak pilihan kost di dekat kampus UNRI, UIR, UIN Suska, dan area strategis Pekanbaru.' },
  { icon: faSliders, title: 'Tampilan Sederhana', desc: 'Desain yang bersih, ringan, dan sangat mudah digunakan oleh siapa saja.' },
];

const faqs = [
  [
    'Mengapa aplikasi ini belum ada di Google Play Store?',
    'CariKostKita sedang dalam tahap pengujian publik awal (Public Beta). Berkas APK dibagikan langsung agar mahasiswa dan warga Pekanbaru bisa mencoba dan memberi masukan sebelum rilis resmi.',
  ],
  [
    'Apakah aman menginstal file APK ini?',
    'Sangat aman. Berkas APK dikompilasi langsung dari repositori resmi proyek tanpa injeksi pihak ketiga. Android akan menampilkan dialog standar yang aman diizinkan ("Tetap Download").',
  ],
  [
    'Versi Android apa yang didukung?',
    'CariKostKita mendukung Android 8.0 (Oreo), 9, 10, 11, 12, 13, 14, hingga versi Android yang lebih baru.',
  ],
  [
    'Apakah mencari kost dikenakan biaya?',
    'Tidak. CariKostKita 100% gratis untuk para pencari kost tanpa biaya langganan, biaya admin, maupun biaya perantara.',
  ],
  [
    'Bagaimana jika data kost tidak sesuai?',
    'Gunakan fitur lapor di aplikasi atau hubungi kami langsung via WhatsApp. Tim verifikasi akan segera menindaklanjuti laporan tersebut.',
  ],
  [
    'Apakah pemilik kost bisa langsung mengunggah?',
    'Bisa! Setiap pengajuan kost akan ditinjau oleh tim kurasi dalam 1x24 jam untuk mencegah penipuan dan memastikan listing valid.',
  ],
];

export default function Home() {
  const [appConfig, setAppConfig] = useState({
    apk: 'https://github.com/g-423/KosKita/releases/download/v1.0.0-beta/CariKostKita-v1.0.0-beta.apk',
    waNumber: '6281270008899'
  });

  useEffect(() => {
    async function fetchConfig() {
      try {
        // Fetch Settings
        const setRes = await fetch(publicApiUrl + '/settings', { cache: 'no-store' });
        if (!setRes.ok) throw new Error('Public settings request failed');
        const setJson = await setRes.json();
        
        // Fetch App Release
        const relRes = await fetch(publicApiUrl + '/latest-release', { cache: 'no-store' });
        if (!relRes.ok) throw new Error('Latest release request failed');
        const relJson = await relRes.json();
        
        let newApk = appConfig.apk;
        let newWa = appConfig.waNumber;
        
        if (relJson.success && relJson.data?.apk_url) {
           newApk = relJson.data.apk_url;
        }
        if (setJson.success && setJson.data?.contact_whatsapp) {
           newWa = setJson.data.contact_whatsapp;
        }
        
        setAppConfig({ apk: newApk, waNumber: newWa });
      } catch (e) {
        console.error('Failed to fetch dynamic settings', e);
      }
    }
    fetchConfig();
  }, []);

  const apk = appConfig.apk;
  const waNumber = appConfig.waNumber;
  const repo = 'https://github.com/g-423/KosKita';
  const waHelpUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent('Halo Admin CariKostKita, saya butuh informasi seputar aplikasi kost Pekanbaru.')}`;
  const waOwnerUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent('Halo Admin CariKostKita, saya pemilik kost di Pekanbaru ingin mendaftarkan properti saya.')}`;

  const [menu, setMenu] = useState(false);
  const [open, setOpen] = useState<number | null>(0);
  const [phoneFilter, setPhoneFilter] = useState('Semua');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [activeInstallStep, setActiveInstallStep] = useState(0);
  const [completedInstallSteps, setCompletedInstallSteps] = useState<number[]>([]);

  const handleInstallStepClick = (stepIndex: number) => {
    // Langkah terakhir mengakhiri panduan dan mengaktifkan seluruh langkah lagi.
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
    // Scroll Progress
    const onScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        setScrollProgress((totalScroll / windowHeight) * 100);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Scroll Reveal Animation (Intersection Observer)
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

  return (
    <main>
      {/* Scroll Progress Bar */}
      <div
        className="scroll-progress"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      {/* Header */}
      <header className="site-header">
        <div className="shell nav-wrap">
          <a className="brand" href="#beranda">
            <span className="brand__mark">
              <FontAwesomeIcon icon={faBuilding} />
            </span>
            CariKostKita
          </a>

          <nav className="nav-links">
            {nav.map(([h, l], i) => (
              <a className={i === 0 ? 'active' : ''} href={h} key={h}>
                {l}
              </a>
            ))}
          </nav>

          <div className="nav-download">
            <Button />
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
            {nav.map(([h, l]) => (
              <a href={h} key={h} onClick={() => setMenu(false)}>
                {l}
              </a>
            ))}
            <Button />
          </nav>
        )}
      </header>

      {/* Hero Section */}
      <section id="beranda" className="hero">
        <div className="hero__city" />
        <div className="hero__overlay" />
        <div className="shell hero__content">
          <div className="hero__copy">
            <p className="eyebrow eyebrow--light">CARI KOST KITA • PEKANBARU</p>
            <h1>
              Temukan Kost Impianmu <span>di Pekanbaru</span>
            </h1>
            <p className="hero__text">
              CariKostKita hadir untuk memudahkan kamu menemukan kost terbaik di Pekanbaru. Dengan tampilan yang simpel, cepat, dan lengkap, semua kebutuhan kost ada di genggaman.
            </p>

            <div className="hero__actions">
              <Button />
              <a className="outline-button" href="#fitur">
                Lihat Fitur <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: 6 }} />
              </a>
            </div>

            {/* Spec Capsule Under CTA (No Emojis, FontAwesome Icons) */}
            <div style={{ marginTop: 14, fontSize: 11, color: '#f7d9c9', display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              <span>
                <FontAwesomeIcon icon={faBoxArchive} style={{ marginRight: 5 }} />
                6.9 MB
              </span>
              <span>•</span>
              <span>
                <FontAwesomeIcon icon={faAndroid} style={{ marginRight: 5 }} />
                Android 8.0+
              </span>
              <span>•</span>
              <span>
                <FontAwesomeIcon icon={faCheck} style={{ marginRight: 5 }} />
                Bebas Iklan
              </span>
              <span>•</span>
              <span
                onClick={() => setShowModal(true)}
                style={{ textDecoration: 'underline', cursor: 'pointer', color: '#fff' }}
              >
                Panduan Pasang APK
              </span>
            </div>

            <div className="trust-row">
              <span>
                <FontAwesomeIcon icon={faShieldHalved} style={{ marginRight: 4 }} />
                Mudah Digunakan
              </span>
              <span>
                <FontAwesomeIcon icon={faCompass} style={{ marginRight: 4 }} />
                Data Terpercaya
              </span>
              <span>
                <FontAwesomeIcon icon={faArrowsRotate} style={{ marginRight: 4 }} />
                Update Rutin
              </span>
            </div>
          </div>

          <div className="hero__visual">
            <div className="soft-card soft-card--top">
              <FontAwesomeIcon icon={faLocationDot} style={{ marginRight: 6 }} />
              Lokasi dekat kampus UNRI &amp; UIR
            </div>

            {/* 3D Photorealistic Smartphone with App UI Inside Screen */}
            <div className="hero-3d-phone">
              <img
                src={
                  phoneFilter === 'Putri'
                    ? '/mockup-hero-putri.png'
                    : phoneFilter === 'Putra'
                    ? '/mockup-hero-putra.png'
                    : phoneFilter === 'Campur'
                    ? '/mockup-hero-campur.png'
                    : '/mockup-hero-semua.png'
                }
                alt="Tampilan Aplikasi CariKostKita di Layar Smartphone 3D"
                className="hero-3d-img"
              />
            </div>

            {/* Interactive Filter Pills Floating in Hero */}
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

            <div className="soft-card soft-card--bottom">
              <FontAwesomeIcon icon={faHeart} style={{ marginRight: 6 }} />
              Detail kost &amp; foto kamar lengkap
            </div>
          </div>
        </div>
      </section>

      {/* Prerelease Section with Scroll Animation */}
      <section className="section prerelease reveal-on-scroll">
        <div className="shell">
          <p className="eyebrow">VERSI PRA-RILIS</p>
          <h2>Mengapa mengunduh versi pra-rilis CariKostKita?</h2>
          <p className="intro">Kenali manfaat dan informasi penting sebelum mencoba aplikasi kami.</p>

          <div className="trust-grid">
            {trust.map((item) => (
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
          <p className="intro">Pengalaman mencari kost di Pekanbaru yang sederhana, lengkap, dan mudah diandalkan.</p>

          <div className="feature-grid">
            {features.map((item) => (
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
          {/* 3D Smartphone Mockup with Real Screen Inserted Inside */}
          <div className="install-mockup-wrap">
            <div className="install-3d-phone">
              <img
                src={`/mockup-install-${activeInstallStep + 1}.png`}
                alt={`Simulasi Instalasi Langkah ${activeInstallStep + 1}: ${
                  ['Download Berkas APK', 'Konfirmasi Dialog Keamanan', 'Izin Sumber Tidak Dikenal', 'Instalasi Selesai'][activeInstallStep]
                }`}
                className="install-3d-img"
              />
            </div>
          </div>

          <div>
            <p className="eyebrow">CARA INSTALL</p>
            <h2>Mudah Instal, Langsung Pakai</h2>
            <p className="intro">
              Ikuti 4 langkah berikut untuk menginstal aplikasi CariKostKita di perangkat Android kamu. Klik tiap langkah untuk melihat simulasi layar di samping.
            </p>

            <div className="steps">
              {[
                { n: '1', t: 'Download APK', d: 'Klik tombol unduh untuk mendapatkan berkas APK resmi.' },
                { n: '2', t: 'Konfirmasi Dialog', d: 'Pilih "Tetap Download" jika muncul peringatan browser.' },
                { n: '3', t: 'Izinkan Sumber', d: 'Buka berkas unduhan dan aktifkan izin instalasi.' },
                { n: '4', t: 'Selesai!', d: 'Buka aplikasi dan mulai mencari kost idamanmu.' },
              ].map((stepItem, idx) => (
                <button
                  type="button"
                  className={`step install-step-card ${activeInstallStep === idx ? 'active' : ''} ${completedInstallSteps.includes(idx) ? 'is-complete' : ''}`}
                  key={stepItem.n}
                  onClick={() => handleInstallStepClick(idx)}
                  disabled={completedInstallSteps.includes(idx)}
                  aria-label={`${stepItem.t}${completedInstallSteps.includes(idx) ? ' (sudah dipilih)' : ''}`}
                >
                  <span>{stepItem.n}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                      <h3>{stepItem.t}</h3>
                      {activeInstallStep === idx && (
                        <small style={{ fontSize: 8, color: '#6D0808', fontWeight: 700, background: '#f5e8e8', padding: '1px 5px', borderRadius: 4 }}>
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
              <Button />
              <button
                type="button"
                onClick={() => setShowModal(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6D0808', fontWeight: 700, fontSize: 12, textDecoration: 'underline' }}
              >
                Lihat Panduan Dialog Keamanan Android <FontAwesomeIcon icon={faArrowRight} style={{ marginLeft: 4 }} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* For Boarding House Owners with Scroll Animation */}
      <section id="pemilik" className="section owner-section reveal-on-scroll">
        <div className="shell owner-layout">
          <div>
            <p className="eyebrow">KHUSUS PEMILIK KOST</p>
            <h2>Anda punya kost di Pekanbaru?</h2>
            <p className="intro">
              Daftarkan kost Anda agar lebih mudah ditemukan calon penyewa mahasiswa dan pekerja di Pekanbaru tanpa komisi perantara.
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
                <span>Daftar via WhatsApp</span>
              </a>
              <Button light label="Download Aplikasi" />
            </div>
          </div>

          <ol>
            {[
              'Unduh dan pasang aplikasi CariKostKita.',
              'Buka Profil, lalu pilih "Daftar sebagai Pemilik Kost".',
              'Isi identitas, alamat, fasilitas, dan foto kamar kost dengan lengkap.',
              'Tim meninjau data pengajuan Anda dalam kurun waktu 1x24 jam.',
              'Setelah disetujui, dashboard pemilik dapat langsung digunakan.',
            ].map((x, i) => (
              <li key={x}>
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
            {/* Clean Single Avatar Card with FontAwesome (No Double Icon!) */}
            <div className="avatar">
              <FontAwesomeIcon icon={faUsers} />
            </div>
            <div>
              <p className="eyebrow">TENTANG KAMI</p>
              <h2>Dibangun untuk Kebutuhan Kamu</h2>
              <p>
                CariKostKita adalah aplikasi yang dikembangkan untuk membantu masyarakat, terutama anak rantau, dalam mencari kost di Pekanbaru dengan lebih mudah, cepat, dan terpercaya.
              </p>
              <div className="social-links">
                <a href={repo} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <FontAwesomeIcon icon={faGithub} /> GitHub Proyek
                </a>
                <a href={waHelpUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#1ebe5d' }}>
                  <FontAwesomeIcon icon={faWhatsapp} /> WhatsApp Bantuan
                </a>
              </div>
            </div>
          </div>

          <div id="faq" className="faq">
            <p className="eyebrow">FAQ</p>
            <h2>Pertanyaan yang Sering Diajukan</h2>
            {faqs.map(([q, a], i) => (
              <div className="faq-item" key={q}>
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
      <section className="feedback reveal-on-scroll">
        <div className="shell">
          <p className="eyebrow">UJI COBA & MASUKAN</p>
          <h2>Bantu kami menyempurnakan aplikasi ini</h2>
          <p>
            Menemukan bug atau punya usulan fitur? Sampaikan masukan Anda langsung ke admin WhatsApp.
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
              <span>Kirim Masukan via WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta reveal-on-scroll">
        <div className="shell final-cta__inner">
          <div>
            <p className="eyebrow eyebrow--light">JANGAN TUNGGU LAGI!</p>
            <h2>Yuk, Temukan Kost Terbaikmu Sekarang!</h2>
            <p>Download aplikasinya sekarang dan mulai pencarian kost impianmu di Pekanbaru.</p>
          </div>
          <Button light />
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="shell footer-grid">
          <div>
            <a href="#beranda" className="brand">
              <span className="brand__mark">
                <FontAwesomeIcon icon={faBuilding} />
              </span>
              CariKostKita
            </a>
            <p>Kost terbaik, untuk masa depanmu di Pekanbaru.</p>
          </div>

          <nav>
            {nav.map(([h, l]) => (
              <a href={h} key={h}>
                {l}
              </a>
            ))}
          </nav>

          <div className="footer-social">
            <a href={repo} target="_blank" rel="noopener noreferrer" title="GitHub">
              <FontAwesomeIcon icon={faGithub} size="lg" />
            </a>
            <a href={waHelpUrl} target="_blank" rel="noopener noreferrer" title="WhatsApp" style={{ color: '#25D366' }}>
              <FontAwesomeIcon icon={faWhatsapp} size="lg" />
            </a>
          </div>
        </div>
        <div className="shell copyright">© 2026 CariKostKita. All rights reserved.</div>
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

      {/* Android Play Protect Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)} aria-label="Tutup">
              <FontAwesomeIcon icon={faXmark} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#6D0808', fontWeight: 700, fontSize: 16 }}>
              <FontAwesomeIcon icon={faTriangleExclamation} color="#D97706" />
              <span>Panduan Dialog Download Android</span>
            </div>
            <p style={{ fontSize: 12, color: '#655955', marginTop: 10, lineHeight: 1.6 }}>
              Saat mengunduh berkas APK di luar Google Play Store, peramban (Chrome) akan menampilkan pesan standar keamanan:
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
              Berkas APK CariKostKita 100% aman dan diverifikasi langsung dari repositori resmi proyek.
            </p>
            <div style={{ marginTop: 18, textAlign: 'right' }}>
              <a className="download" href={apk} onClick={() => setShowModal(false)}>
                Lanjut Download APK
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
