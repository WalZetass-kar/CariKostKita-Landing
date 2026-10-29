import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// MIME type resmi untuk file APK Android
const APK_MIME = "application/vnd.android.package-archive";
// Fallback resmi bila berkas tidak tersedia di dalam container serverless.
const GITHUB_FALLBACK =
  "https://github.com/WalZetass-kar/CariKostKita/releases/download/v1.1.4/CariKostKita-v1.1.4-release.apk";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;
    const safeFilename = path.basename(filename);

    // Hanya layani nama berkas yang diminta, tanpa alias. Dulu route ini
    // jatuh ke `CariKostKita.apk` / `app-release.apk` ketika berkas yang
    // diminta tidak ada, sehingga unduhan bernama versi baru bisa berisi
    // biner versi lama. Lebih baik redirect ke rilis resmi daripada
    // menyajikan biner yang salah nama.
    const isPlainApk =
      safeFilename === filename && safeFilename.toLowerCase().endsWith(".apk");
    if (!isPlainApk) {
      return NextResponse.json(
        { error: "Berkas tidak ditemukan." },
        { status: 404 }
      );
    }

    const cwd = process.cwd();
    const candidatePaths = [
      path.join(cwd, "public/releases", safeFilename),
      path.resolve(cwd, "../Admin-Gue/public/releases", safeFilename),
    ];

    for (const filePath of candidatePaths) {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if (stats.isFile() && stats.size > 0) {
          const fileBuffer = fs.readFileSync(filePath);
          return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
              "Content-Type": APK_MIME,
              "Content-Disposition": `attachment; filename="${safeFilename}"`,
              "Content-Length": String(stats.size),
              // Nama berkas sudah memuat versi, tetapi cache dibuat pendek
              // agar kesalahan rilis tidak pernah tersimpan lama di edge.
              "Cache-Control": "public, max-age=3600, must-revalidate",
            },
          });
        }
      }
    }

    // Tidak ada berkas dengan nama itu: arahkan ke rilis resmi.
    return NextResponse.redirect(GITHUB_FALLBACK, 307);
  } catch (error) {
    console.error("APK download route error:", error);
    return NextResponse.redirect(GITHUB_FALLBACK, 307);
  }
}
