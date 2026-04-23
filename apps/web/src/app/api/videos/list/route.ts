import { NextResponse } from "next/server";
import { readdirSync, statSync } from "fs";
import { join } from "path";

export async function GET() {
  try {
    const uploadDir = join(process.cwd(), "public", "uploads", "videos");

    let files: any[] = [];
    try {
      const entries = readdirSync(uploadDir);
      files = entries
        .filter((f) => /\.(mp4|mov|avi|webm|quicktime)$/i.test(f))
        .map((filename) => {
          const stat = statSync(join(uploadDir, filename));
          const parts = filename.split("_");
          const tsPart = parts[0] ?? "";
          const ts = parseInt(tsPart) || stat.mtimeMs;
          const originalName = parts.slice(1).join("_") || filename;
          return {
            filename,
            originalName,
            url: `/uploads/videos/${filename}`,
            size: stat.size,
            createdAt: new Date(ts).toISOString(),
          };
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch {
      files = [];
    }

    return NextResponse.json({ videos: files });
  } catch (err) {
    return NextResponse.json({ videos: [] });
  }
}
