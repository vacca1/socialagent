import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;

    // Read existing .env
    const envPath = path.join(process.cwd(), ".env");

    let envContent = "";
    try {
      envContent = fs.readFileSync(envPath, "utf-8");
    } catch {
      // .env doesn't exist yet — start fresh
      envContent = "";
    }

    // Update each key
    for (const [key, value] of Object.entries(body)) {
      if (typeof value !== "string" || !value.trim()) continue;
      const regex = new RegExp(`^${key}=.*$`, "m");
      const newLine = `${key}="${value}"`;
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, newLine);
      } else {
        envContent += `\n${key}="${value}"`;
      }
    }

    fs.writeFileSync(envPath, envContent, "utf-8");

    return NextResponse.json({
      ok: true,
      message:
        "Configurações salvas com sucesso. Reinicie o servidor para aplicar as mudanças.",
    });
  } catch (err) {
    console.error("[/api/admin/config] Error:", err);
    return NextResponse.json(
      {
        ok: false,
        message: "Erro interno ao salvar configurações.",
      },
      { status: 500 }
    );
  }
}
