import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const allowedTypes = ["video/mp4", "video/mov", "video/quicktime", "video/avi", "video/webm", "video/x-msvideo"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Formato não suportado. Use MP4, MOV, AVI ou WebM." }, { status: 400 });
    }

    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "Arquivo muito grande. Máximo 500MB." }, { status: 400 });
    }

    const uploadDir = join(process.cwd(), "public", "uploads", "videos");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${timestamp}_${safeName}`;
    const filepath = join(uploadDir, filename);

    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));

    return NextResponse.json({
      success: true,
      url: `/uploads/videos/${filename}`,
      name: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (err) {
    console.error("Erro no upload:", err);
    return NextResponse.json({ error: "Erro ao salvar arquivo" }, { status: 500 });
  }
}
