import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan (Terms of Service) — CariKostKita',
  description: 'Syarat dan Ketentuan penggunaan aplikasi dan situs web CariKostKita.',
};

export default function TermsPage() {
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
              Ketentuan Hukum
            </span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#261B19] tracking-tight">
              Syarat dan Ketentuan Layanan (Terms of Service)
            </h1>
            <p className="mt-2 text-sm text-[#261B19]/70">
              Terakhir diperbarui: 6 November 2026 · CariKostKita (carikostkita.my.id)
            </p>
          </div>

          <hr className="border-[#261B19]/10" />

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#790F13]">1. Penerimaan Ketentuan</h2>
            <p className="text-sm leading-relaxed text-[#261B19]/80">
              Dengan mengunduh, memasang, atau menggunakan aplikasi Android CariKostKita dan situs web CariKostKita, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh Syarat dan Ketentuan ini. Jika Anda tidak menyetujui salah satu poin dalam ketentuan ini, mohon untuk tidak menggunakan layanan kami.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#790F13]">2. Deskripsi Layanan</h2>
            <p className="text-sm leading-relaxed text-[#261B19]/80">
              CariKostKita adalah platform direktori dan pencarian informasi kost terpercaya di Pekanbaru dan sekitarnya. CariKostKita menyediakan sarana bagi pencari kost untuk menemukan hunian sewa, membandingkan fasilitas dan harga, serta menghubungi pemilik kost secara langsung tanpa perantara biaya komisi tersembunyi.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#790F13]">3. Akun Pengguna</h2>
            <ul className="list-disc pl-5 text-sm leading-relaxed text-[#261B19]/80 space-y-1.5">
              <li>Pengguna bertanggung jawab penuh atas keamanan dan kerahasiaan kredensial akun mereka.</li>
              <li>Setiap informasi profil yang diberikan (nama, email, nomor kontak) harus akurat dan benar.</li>
              <li>Pengguna dilarang menyalahgunakan akun untuk tujuan penipuan, spamming, atau aktivitas ilegal yang melanggar hukum Republik Indonesia.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#790F13]">4. Ketentuan Pemilik Kost</h2>
            <ul className="list-disc pl-5 text-sm leading-relaxed text-[#261B19]/80 space-y-1.5">
              <li>Pemilik kost wajib mencantumkan informasi kost yang sebenarnya, termasuk tarif sewa, foto asli bangunan, dan status ketersediaan kamar.</li>
              <li>Pihak CariKostKita berhak memverifikasi, menonaktifkan, atau menghapus listing kost yang terindikasi fiktif atau mengandung unsur penipuan.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#790F13]">5. Batasan Tanggung Jawab</h2>
            <p className="text-sm leading-relaxed text-[#261B19]/80">
              CariKostKita berupaya menyajikan informasi yang seakurat mungkin. Namun, transaksi sewa-menyewa, pembayaran uang muka (DP), dan kesepakatan tinggal dilakukan secara langsung antara penyewa dan pemilik kost. Kami mengimbau seluruh pengguna untuk melakukan survei lokasi secara langsung sebelum melakukan transaksi keuangan apa pun.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-[#790F13]">6. Kontak Resmi</h2>
            <p className="text-sm leading-relaxed text-[#261B19]/80">
              Untuk pengaduan atau pertanyaan terkait Syarat dan Ketentuan Layanan ini, silakan hubungi kami di:
            </p>
            <div className="rounded-xl border border-[#261B19]/10 bg-[#FCFAF5] p-4 text-xs sm:text-sm text-[#261B19]/80">
              <p>Email: <a href="mailto:support@carikostkita.my.id" className="text-[#790F13] font-bold underline">support@carikostkita.my.id</a></p>
              <p className="mt-1">Website: <a href="https://carikostkita.my.id" className="text-[#790F13] font-bold underline">https://carikostkita.my.id</a></p>
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
