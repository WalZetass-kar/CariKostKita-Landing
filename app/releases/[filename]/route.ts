import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// MIME type resmi untuk file APK Android
const APK_MIME = "application/vnd.android.package-archive";
const GITHUB_FALLBACK = "https://github.com/g-423/KosKita/releases/download/v1.0.0-beta/CariKostKita-v1.0.0-beta.apk";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;
    const safeFilename = path.basename(filename);

    const cwd = process.cwd();
    const candidatePaths = [
      path.join(cwd, "public/releases", safeFilename),
      path.join(cwd, "public/releases/CariKostKita-v1.1.0.apk"),
      path.join(cwd, "public/releases/CariKostKita-v1.0.1.apk"),
      path.join(cwd, "public/releases/CariKostKita.apk"),
      path.join(cwd, "public/releases/app-release.apk"),
      path.resolve(cwd, "../Admin-Gue/public/releases", safeFilename),
      path.resolve(cwd, "../Admin-Gue/public/releases/CariKostKita-v1.1.0.apk"),
      path.resolve(cwd, "../Admin-Gue/public/releases/CariKostKita.apk"),
    ];

    for (const filePath of candidatePaths) {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if (stats.isFile() && stats.size > 0) {
          const fileBuffer = fs.readFileSync(filePath);
          const downloadName = safeFilename.endsWith(".apk") ? safeFilename : "CariKostKita-v1.0.1.apk";
          return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
              "Content-Type": APK_MIME,
              "Content-Disposition": `attachment; filename="${downloadName}"`,
              "Content-Length": String(stats.size),
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        }
      }
    }

    // Jika file fisik tidak tersedia di serverless container, redirect ke rilis resmi GitHub
    return NextResponse.redirect(GITHUB_FALLBACK, 307);
  } catch (error) {
    console.error("APK download route error:", error);
    return NextResponse.redirect(GITHUB_FALLBACK, 307);
  }
}
