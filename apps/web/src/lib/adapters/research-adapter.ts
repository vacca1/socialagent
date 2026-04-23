// =============================================================================
// POSTADOR — Research Adapter
// Integração com last30days-skill-main (Python CLI/Service)
// Pesquisa tendências em Reddit, X, YouTube, TikTok, Instagram, HackerNews...
// =============================================================================

import type { ResearchRequest, ResearchResult } from "@postador/types";
import { spawn } from "child_process";
import path from "path";

const RESEARCH_SERVICE_URL = process.env.TRENDS_REPO_URL ?? "";
const RESEARCH_API_KEY = process.env.TRENDS_REPO_API_KEY ?? "";

// Caminho absoluto para o script Python
const RESEARCH_SCRIPT_PATH = path.resolve(
  process.cwd(),
  "../../last30days-skill-main/scripts/last30days.py"
);

class ResearchAdapter {
  private mode: "http" | "cli";

  constructor() {
    // Se existe URL do serviço HTTP, usa HTTP; caso contrário, chama CLI diretamente
    this.mode = RESEARCH_SERVICE_URL ? "http" : "cli";
  }

  async research(request: ResearchRequest): Promise<ResearchResult> {
    if (this.mode === "http") {
      return this.researchViaHttp(request);
    }
    return this.researchViaCli(request);
  }

  // ============================================================
  // Via HTTP (quando last30days é exposto como serviço FastAPI)
  // ============================================================
  private async researchViaHttp(request: ResearchRequest): Promise<ResearchResult> {
    try {
      const res = await fetch(`${RESEARCH_SERVICE_URL}/research`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(RESEARCH_API_KEY && { "X-API-Key": RESEARCH_API_KEY }),
        },
        body: JSON.stringify({
          topic: request.topic,
          mode: request.mode ?? "quick",
          sources: request.sources,
          emit: "json",
        }),
        signal: AbortSignal.timeout(300_000), // 5 min timeout
      });

      if (!res.ok) throw new Error(`Research HTTP error: ${res.status}`);

      const data = await res.json() as any;
      return this.normalizeResult(data, request.topic);
    } catch (err) {
      console.error("[ResearchAdapter] HTTP error:", err);
      return this.mockResult(request.topic);
    }
  }

  // ============================================================
  // Via CLI (chama Python diretamente — para dev local)
  // emit=json retorna JSON completo do report
  // emit=compact retorna markdown (NÃO usar para parse)
  // ============================================================
  private async researchViaCli(request: ResearchRequest): Promise<ResearchResult> {
    return new Promise((resolve) => {
      const args = [
        RESEARCH_SCRIPT_PATH,
        request.topic,
        "--emit=json",   // JSON para parse programático
        "--quick",       // Mais rápido (90s timeout, menos fontes)
      ];

      // Adicionar fontes específicas se solicitado
      if (request.sources && request.sources.length > 0) {
        args.push(`--search=${request.sources.join(",")}`);
      }

      console.log(`[ResearchAdapter] Executando: python3 ${args.join(" ")}`);

      const proc = spawn("python3", args, {
        timeout: 300_000, // 5 min max
        env: {
          ...process.env,
          SCRAPECREATORS_API_KEY: process.env.SCRAPECREATORS_API_KEY ?? "",
          ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? "",
          OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
          BRAVE_API_KEY: process.env.BRAVE_API_KEY ?? "",
        },
      });

      let stdout = "";
      let stderr = "";

      proc.stdout.on("data", (data) => { stdout += data.toString(); });
      proc.stderr.on("data", (data) => { stderr += data.toString(); });

      proc.on("close", (code) => {
        console.log(`[ResearchAdapter] CLI terminou com código ${code}, stdout=${stdout.length} chars`);

        if (code !== 0 || !stdout.trim()) {
          console.warn("[ResearchAdapter] CLI falhou ou sem output. Usando mock.\n" + stderr.substring(0, 500));
          resolve(this.mockResult(request.topic));
          return;
        }

        try {
          // --emit=json: o last30days envia progress/status para STDERR
          // e apenas o JSON para STDOUT — parse direto funciona
          const data = JSON.parse(stdout.trim());
          resolve(this.normalizeResult(data, request.topic));
        } catch (parseErr) {
          // Fallback: o script pode ter misturado texto com JSON
          // Tenta encontrar o bloco JSON no output
          console.warn("[ResearchAdapter] Parse direto falhou, extraindo JSON do output...");
          try {
            const start = stdout.indexOf("{");
            const end = stdout.lastIndexOf("}");
            if (start !== -1 && end !== -1) {
              const jsonStr = stdout.substring(start, end + 1);
              const data = JSON.parse(jsonStr);
              resolve(this.normalizeResult(data, request.topic));
              return;
            }
          } catch {}
          console.warn("[ResearchAdapter] JSON não encontrado. Usando mock.\nStdout:", stdout.substring(0, 300));
          resolve(this.mockResult(request.topic));
        }
      });

      proc.on("error", (err) => {
        console.warn("[ResearchAdapter] Processo falhou:", err.message);
        console.warn("Script path:", RESEARCH_SCRIPT_PATH);
        resolve(this.mockResult(request.topic));
      });
    });
  }

  // ============================================================
  // Normaliza saída do last30days para formato POSTADOR
  // O Report tem: reddit[], x[], web[], youtube[], tiktok[],
  //               instagram[], hackernews[], bluesky[], best_practices[]
  // ============================================================
  private normalizeResult(data: any, topic: string): ResearchResult {
    const allSignals: ResearchResult["signals"] = [];

    // Reddit
    for (const item of (data.reddit ?? [])) {
      allSignals.push({
        source: "reddit",
        content: item.title ?? item.text ?? "",
        url: item.url,
        relevanceScore: item.relevance ?? 0.5,
        engagementScore: item.engagement?.score ?? item.score ?? 0,
        publishedAt: item.date,
      });
    }

    // X (Twitter)
    for (const item of (data.x ?? [])) {
      const likes = item.engagement?.likes ?? 0;
      const reposts = item.engagement?.reposts ?? 0;
      allSignals.push({
        source: "x",
        content: item.text ?? "",
        url: item.url,
        relevanceScore: item.relevance ?? 0.5,
        engagementScore: likes + reposts,
        publishedAt: item.date,
      });
    }

    // Web search
    for (const item of (data.web ?? [])) {
      allSignals.push({
        source: "web",
        content: item.title ? `${item.title} — ${item.snippet ?? ""}` : (item.snippet ?? ""),
        url: item.url,
        relevanceScore: item.relevance ?? 0.5,
        engagementScore: 0,
        publishedAt: item.date,
      });
    }

    // YouTube
    for (const item of (data.youtube ?? [])) {
      allSignals.push({
        source: "youtube",
        content: item.title ?? item.text ?? "",
        url: item.url,
        relevanceScore: item.relevance ?? 0.5,
        engagementScore: item.engagement?.views ?? 0,
        publishedAt: item.date,
      });
    }

    // TikTok
    for (const item of (data.tiktok ?? [])) {
      allSignals.push({
        source: "tiktok",
        content: item.text ?? item.title ?? "",
        url: item.url,
        relevanceScore: item.relevance ?? 0.5,
        engagementScore: item.engagement?.likes ?? 0,
        publishedAt: item.date,
      });
    }

    // Instagram
    for (const item of (data.instagram ?? [])) {
      allSignals.push({
        source: "instagram",
        content: item.text ?? item.title ?? "",
        url: item.url,
        relevanceScore: item.relevance ?? 0.5,
        engagementScore: item.engagement?.likes ?? 0,
        publishedAt: item.date,
      });
    }

    // HackerNews
    for (const item of (data.hackernews ?? [])) {
      allSignals.push({
        source: "hackernews",
        content: item.title ?? item.text ?? "",
        url: item.url,
        relevanceScore: item.relevance ?? 0.5,
        engagementScore: item.engagement?.score ?? 0,
        publishedAt: item.date,
      });
    }

    // Bluesky
    for (const item of (data.bluesky ?? [])) {
      allSignals.push({
        source: "bluesky",
        content: item.text ?? "",
        url: item.url,
        relevanceScore: item.relevance ?? 0.5,
        engagementScore: item.engagement?.likes ?? 0,
        publishedAt: item.date,
      });
    }

    // Ordenar por relevância decrescente
    allSignals.sort((a, b) => (b.relevanceScore ?? 0) - (a.relevanceScore ?? 0));

    // Calcular trend score médio com base nos top signals
    const topSignals = allSignals.slice(0, 10);
    const avgRelevance = topSignals.length > 0
      ? topSignals.reduce((s, x) => s + (x.relevanceScore ?? 0), 0) / topSignals.length
      : 0.5;
    const trendScore = Math.round(avgRelevance * 10 * 10) / 10; // 0-10 scale

    // Montar summary a partir do context_snippet_md ou best_practices
    const summaryParts: string[] = [];
    if (data.context_snippet_md) {
      // context_snippet_md é markdown — pegar só o texto sem formatação
      const plain = data.context_snippet_md
        .replace(/#+\s*/g, "")
        .replace(/\*\*/g, "")
        .replace(/\n+/g, " ")
        .trim()
        .substring(0, 500);
      summaryParts.push(plain);
    } else if (data.best_practices?.length > 0) {
      summaryParts.push("Melhores práticas: " + data.best_practices.slice(0, 3).join("; "));
    }

    const summary = summaryParts.length > 0
      ? summaryParts.join(" | ")
      : `Pesquisa sobre "${topic}" encontrou ${allSignals.length} sinais em ${Object.keys(data).filter(k => Array.isArray(data[k]) && data[k].length > 0).join(", ")}.`;

    console.log(`[ResearchAdapter] Normalizado: ${allSignals.length} sinais, trendScore=${trendScore}`);

    return {
      topic,
      summary,
      signals: allSignals,
      trendScore,
      capturedAt: new Date().toISOString(),
    };
  }

  // Mock para quando o serviço não está disponível
  private mockResult(topic: string): ResearchResult {
    return {
      topic,
      summary: `[SIMULADO] Tendências para "${topic}" — instale dependências do last30days para dados reais (pip3 install -r last30days-skill-main/requirements.txt).`,
      signals: [
        {
          source: "reddit",
          content: `Discussões sobre ${topic} em alta no r/artificial e r/MachineLearning. Interesse crescente.`,
          url: `https://reddit.com/search?q=${encodeURIComponent(topic)}`,
          relevanceScore: 0.75,
          engagementScore: 850,
        },
        {
          source: "x",
          content: `#${topic.replace(/\s+/g, "")} trending com criadores de conteúdo de IA mostrando casos de uso avançados.`,
          url: `https://x.com/search?q=${encodeURIComponent(topic)}`,
          relevanceScore: 0.70,
          engagementScore: 1200,
        },
        {
          source: "youtube",
          content: `Vídeos sobre ${topic} acumulando milhões de views nas últimas semanas.`,
          url: `https://youtube.com/results?search_query=${encodeURIComponent(topic)}`,
          relevanceScore: 0.65,
          engagementScore: 45000,
        },
      ],
      trendScore: 7.0,
      capturedAt: new Date().toISOString(),
    };
  }
}

export const researchAdapter = new ResearchAdapter();
