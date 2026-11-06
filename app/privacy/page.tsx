import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Kebijakan Privasi (Privacy Policy) — CariKostKita',
  description: 'Kebijakan Privasi aplikasi CariKostKita mengenai pengumpulan, penggunaan, dan perlindungan data pengguna sesuai standar privasi Google dan peraturan yang berlaku.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FCFAF5] text-[#261B19] antialiased">
      {/* Top Header */}
      <header className="sticky top-0 z-50 border-b border-[#261B19]/10 bg-[#FCFAF5]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 font-black text-xl text-[#790F13] tracking-tight hover:opacity-90 transition">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#790F13] text-white font-black text-base shadow-sm">
              CK
            </span>
            <span>CariKostKita</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#261B19]/15 bg-white px-3.5 py-1.5 text-xs font-bold text-[#261B19] shadow-sm hover:bg-[#F2ECE3] transition"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="rounded-2xl border border-[#261B19]/10 bg-white p-6 sm:p-10 shadow-sm space-y-8">
          <div>
            <span className="inline-block rounded-full bg-[#790F13]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#790F13]">
              Dokumen Resmi
            </span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#261B19] tracking-tight">
              Kebijakan Privasi (Privacy Policy)
            </h1>
            <p className="mt-2 text-sm text-[#261B19]/70">
              Terakhir diperbarui: 6 November 2026 · Berlaku untuk Aplikasi Mobile Android CariKostKita dan Situs Web Resmi (carikostkita.my.id)
            </p>
          </div>

          <hr className="border-[#261B19]/10" />

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#790F13]">1. Pendahuluan</h2>
            <p className="text-sm leading-relaxed text-[#261B19]/80">
              Selamat datang di <strong>CariKostKita</strong> (&ldquo;kami&rdquo;, &ldquo;aplikasi&rdquo;, atau &ldquo;layanan&rdquo;). Kami berkomitmen tinggi untuk melindungi hak privasi dan keamanan data pribadi setiap pengguna, baik pencari kost maupun pemilik kost.
            </p>
            <p className="text-sm leading-relaxed text-[#261B19]/80">
              Kebijakan Privasi ini menjelaskan bagaimana informasi pribadi Anda dikumpulkan, digunakan, disimpan, dan dilindungi saat Anda mengunduh, mengakses, atau menggunakan aplikasi mobile Android CariKostKita serta situs web kami di{' '}
              <a href="https://carikostkita.my.id" className="font-semibold text-[#790F13] underline">
                https://carikostkita.my.id
              </a>.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#790F13]">2. Informasi yang Kami Kumpulkan</h2>
            <p className="text-sm leading-relaxed text-[#261B19]/80">
              Kami hanya mengumpulkan data yang diperlukan secara langsung demi berjalannya fungsi utama layanan:
            </p>
            <div className="space-y-3 text-sm text-[#261B19]/80">
              <div className="rounded-xl border border-[#261B19]/10 bg-[#FCFAF5] p-4">
                <h3 className="font-bold text-[#261B19]">A. Data Otentikasi Akun Google (Google OAuth)</h3>
                <p className="mt-1 leading-relaxed">
                  Ketika Anda memilih untuk masuk menggunakan <em>&ldquo;Masuk dengan Google&rdquo;</em>, kami meminta otorisasi terbatas melalui Google Play Services untuk membaca profil dasar:
                </p>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li><strong>Nama lengkap:</strong> digunakan untuk menampilkan identitas akun Anda di profil.</li>
                  <li><strong>Alamat email:</strong> digunakan sebagai pengenal akun unik serta sarana komunikasi status kost atau reset akun.</li>
                  <li><strong>Foto profil Google:</strong> digunakan sebagai avatar pengguna di aplikasi.</li>
                </ul>
                <p className="mt-2 text-xs font-semibold text-[#790F13]">
                  Kami tidak meminta dan tidak dapat mengakses kata sandi akun Google Anda, daftar kontak telepon Google, file Google Drive, isi email Gmail, maupun data sensitif lainnya.
                </p>
              </div>

              <div className="rounded-xl border border-[#261B19]/10 bg-[#FCFAF5] p-4">
                <h3 className="font-bold text-[#261B19]">B. Data Lokasi Perangkat (GPS & Wilayah)</h3>
                <p className="mt-1 leading-relaxed">
                  Aplikasi meminta izin lokasi perangkat (<em>ACCESS_FINE_LOCATION</em> / <em>ACCESS_COARSE_LOCATION</em>). Data lokasi ini digunakan secara <em>real-time</em> semata-mata untuk:
                </p>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>Menghitung jarak akurat dari posisi Anda ke kost yang diminati.</li>
                  <li>Menampilkan urutan kost terdekat di sekitar kampus (contoh: sekitar UIR, UNRI, Bukit Raya).</li>
                  <li>Membuka petunjuk arah navigasi di aplikasi Google Maps.</li>
                </ul>
                <p className="mt-2 text-xs font-semibold text-[#790F13]">
                  Kami TIDAK melacak atau menyimpan pergerakan lokasi Anda di latar belakang (background location) saat aplikasi ditutup.
                </p>
              </div>

              <div className="rounded-xl border border-[#261B19]/10 bg-[#FCFAF5] p-4">
                <h3 className="font-bold text-[#261B19]">C. Data Tambahan Pengguna & Pemilik Kost</h3>
                <ul className="mt-1 list-disc pl-5 space-y-1">
                  <li>Nomor WhatsApp / No HP (opsional bagi pencari kost, wajib bagi pemilik kost agar calon penyewa dapat menghubungi via WhatsApp).</li>
                  <li>Informasi listing kost bagi mitra pemilik: foto bangunan, alamat lengkap, tarif sewa, fasilitas, dan ketersediaan kamar.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#790F13]">3. Kepatuhan Kebijakan Data Pengguna Google (Google API User Data Policy)</h2>
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/60 p-4 text-sm text-emerald-950 space-y-2">
              <p className="font-bold">
                Pernyataan Kepatuhan Google API Services:
              </p>
              <p className="leading-relaxed text-xs sm:text-sm">
                Penggunaan informasi yang diterima CariKostKita dari Google API sepenuhnya mematuhi{' '}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline text-emerald-800"
                >
                  Google API Services User Data Policy
                </a>
                , termasuk persyaratan <em>Limited Use</em>:
              </p>
              <ul className="list-disc pl-5 text-xs sm:text-sm space-y-1">
                <li>Kami <strong>TIDAK PERNAH MENJUAL</strong> data pengguna atau data profil Google Anda kepada pihak ketiga mana pun.</li>
                <li>Kami <strong>TIDAK MENGGUNAKAN</strong> data Google untuk tujuan periklanan tertarget pihak ketiga (*targeted advertising*).</li>
                <li>Kami <strong>TIDAK MENGGUNAKAN</strong> data profil Google pengguna untuk melatih model kecerdasan buatan umum (*general AI / ML training*).</li>
                <li>Transfer data hanya dilakukan semata-mata untuk menyediakan atau meningkatkan fungsionalitas aplikasi bagi pengguna yang bersangkutan.</li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#790F13]">4. Bagaimana Kami Menggunakan Informasi Anda</h2>
            <ul className="list-disc pl-5 text-sm leading-relaxed text-[#261B19]/80 space-y-1.5">
              <li>Membuat dan mengelola akun keanggotaan pengguna di aplikasi.</li>
              <li>Menyediakan fitur pencarian, filter fasilitas, dan perbandingan harga kost.</li>
              <li>Menghubungkan pencari kost secara langsung dengan pemilik kost melalui WhatsApp tanpa perantara.</li>
              <li>Menjaga keamanan ekosistem aplikasi dari upaya penipuan atau penyalahgunaan akun.</li>
              <li>Mengirimkan notifikasi pembaruan aplikasi dan status verifikasi bagi pemilik kost.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#790F13]">5. Penyimpanan dan Keamanan Data</h2>
            <p className="text-sm leading-relaxed text-[#261B19]/80">
              Seluruh komunikasi antara aplikasi Android, peramban web, dan server backend kami dilindungi oleh protokol enkripsi standar industri (<strong>HTTPS / TLS 1.3</strong>). Kata sandi akun disimpan dalam basis data PostgreSQL menggunakan algoritma <em>hashing</em> satu arah (bcrypt) dan tidak dapat dibaca oleh staf kami.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#790F13]">6. Hak Pengguna &amp; Permintaan Penghapusan Data (Data Deletion)</h2>
            <p className="text-sm leading-relaxed text-[#261B19]/80">
              Sesuai dengan ketentuan perlindungan data, Anda memiliki hak penuh untuk:
            </p>
            <ul className="list-disc pl-5 text-sm leading-relaxed text-[#261B19]/80 space-y-1">
              <li>Memperbarui atau mengoreksi data profil Anda kapan saja.</li>
              <li>
                <strong>Meminta Penghapusan Akun &amp; Seluruh Data:</strong> Anda dapat mengajukan permohonan penghapusan akun permanen beserta seluruh riwayat, data profil, foto, dan listing kost dengan menghubungi email dukungan kami di{' '}
                <a href="mailto:support@carikostkita.my.id" className="font-bold text-[#790F13] underline">
                  support@carikostkita.my.id
                </a>{' '}
                dengan subjek <em>&ldquo;Permohonan Hapus Akun CariKostKita&rdquo;</em>. Tim kami akan memproses dan menghapus data Anda secara permanen dalam waktu maksimal 3x24 jam kerja.
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#790F13]">7. Hubungi Kami</h2>
            <p className="text-sm leading-relaxed text-[#261B19]/80">
              Apabila Anda memiliki pertanyaan, saran, atau kekhawatiran terkait Kebijakan Privasi ini atau penanganan data pribadi Anda, silakan hubungi tim kami melalui:
            </p>
            <div className="rounded-xl border border-[#261B19]/10 bg-[#FCFAF5] p-4 text-xs sm:text-sm text-[#261B19]/80 space-y-1">
              <p><strong>Aplikasi:</strong> CariKostKita</p>
              <p><strong>Pengembang:</strong> Tim CariKostKita</p>
              <p><strong>Email Dukungan:</strong> <a href="mailto:support@carikostkita.my.id" className="text-[#790F13] font-semibold underline">support@carikostkita.my.id</a></p>
              <p><strong>Website Resmi:</strong> <a href="https://carikostkita.my.id" className="text-[#790F13] font-semibold underline">https://carikostkita.my.id</a></p>
              <p><strong>Wilayah Operasional:</strong> Pekanbaru, Riau, Indonesia</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#261B19]/10 py-6 text-center text-xs text-[#261B19]/60">
        <p>&copy; {new Date().getFullYear()} CariKostKita. Hak cipta dilindungi undang-undang.</p>
      </footer>
    </div>
  );
}
