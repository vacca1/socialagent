// =============================================================================
// POSTADOR — Remotion Adapter
// Integração com remotion-main e react-video-editor-main
// Suporta render local, Lambda e react-video-editor (DesignCombo)
// =============================================================================

import type { RemotionRenderRequest, RemotionRenderStatus } from "@postador/types";
import { prisma } from "@postador/database";

const REMOTION_API_URL = process.env.REMOTION_API_URL ?? "http://localhost:3001";
const REMOTION_API_KEY = process.env.REMOTION_API_KEY ?? "";

// Disponível quando @remotion/renderer está instalado no servidor
type RendererModule = {
  renderMedia: (opts: any) => Promise<{ buffer: Buffer }>;
  selectComposition: (opts: any) => Promise<any>;
};

class RemotionAdapter {
  private mode: "api" | "lambda" | "local";

  constructor() {
    if (process.env.REMOTION_LAMBDA_FUNCTION_NAME) {
      this.mode = "lambda";
    } else if (REMOTION_API_URL) {
      this.mode = "api";
    } else {
      this.mode = "local";
    }
  }

  // Enfileirar render — retorna imediatamente, processa em background
  async enqueueRender(renderId: string, request: RemotionRenderRequest): Promise<void> {
    await prisma.render.update({
      where: { id: renderId },
      data: { status: "RENDERING", startedAt: new Date(), progress: 0 },
    });

    // Executar em background sem bloquear
    this.executeRender(renderId, request).catch((err) => {
      console.error(`[RemotionAdapter] Render ${renderId} falhou:`, err);
      prisma.render.update({
        where: { id: renderId },
        data: {
          status: "FAILED",
          errorMessage: String(err),
          completedAt: new Date(),
        },
      }).catch(console.error);
    });
  }

  private async executeRender(renderId: string, request: RemotionRenderRequest): Promise<void> {
    switch (this.mode) {
      case "api":
        await this.renderViaApi(renderId, request);
        break;
      case "lambda":
        await this.renderViaLambda(renderId, request);
        break;
      case "local":
        await this.renderLocal(renderId, request);
        break;
    }
  }

  // Via API HTTP (quando Remotion está rodando como serviço separado)
  private async renderViaApi(renderId: string, request: RemotionRenderRequest): Promise<void> {
    const res = await fetch(`${REMOTION_API_URL}/render`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(REMOTION_API_KEY && { "X-API-Key": REMOTION_API_KEY }),
      },
      body: JSON.stringify({
        render_id: renderId,
        composition_id: request.compositionId,
        input_props: request.inputProps,
        output_format: request.outputFormat ?? "mp4",
        resolution: request.resolution ?? "1080x1920",
        fps: request.fps ?? 30,
        quality: request.quality ?? 80,
      }),
      signal: AbortSignal.timeout(600_000), // 10 min
    });

    if (!res.ok) throw new Error(`Remotion API error: ${res.status}`);

    const data = await res.json() as any;

    await prisma.render.update({
      where: { id: renderId },
      data: {
        status: "COMPLETED",
        progress: 100,
        outputUrl: data.output_url ?? data.outputUrl,
        thumbnailUrl: data.thumbnail_url ?? data.thumbnailUrl,
        completedAt: new Date(),
        remotionJobId: data.job_id,
      },
    });
  }

  // Via Lambda (produção escalável)
  private async renderViaLambda(renderId: string, request: RemotionRenderRequest): Promise<void> {
    // Integração com @remotion/lambda
    // Requer: REMOTION_LAMBDA_FUNCTION_NAME, AWS_REGION, AWS credentials
    // Em dev, sempre usa fallback via API
    try {
      // Lazy load via eval to avoid webpack bundling @remotion/lambda
      let renderMediaOnLambda: any = null;
      let getRenderProgress: any = null;
      try {
        // eslint-disable-next-line no-new-func
        const mod = await new Function('return import("@remotion/lambda/client")')();
        renderMediaOnLambda = mod.renderMediaOnLambda;
        getRenderProgress = mod.getRenderProgress;
      } catch { /* not installed */ }
      if (!renderMediaOnLambda) { throw new Error("@remotion/lambda not installed"); }

      const { renderId: lambdaRenderId } = await renderMediaOnLambda({
        region: process.env.AWS_REGION ?? "us-east-1",
        functionName: process.env.REMOTION_LAMBDA_FUNCTION_NAME!,
        composition: request.compositionId,
        inputProps: request.inputProps,
        codec: "h264",
        imageFormat: "jpeg",
        maxRetries: 2,
        framesPerLambda: 20,
        downloadBehavior: { type: "download", fileName: `render-${renderId}.mp4` },
      });

      // Poll progress
      let done = false;
      while (!done) {
        await new Promise((r) => setTimeout(r, 3000));
        const progress = await getRenderProgress({
          renderId: lambdaRenderId,
          bucketName: process.env.REMOTION_OUTPUT_BUCKET!,
          functionName: process.env.REMOTION_LAMBDA_FUNCTION_NAME!,
          region: process.env.AWS_REGION ?? "us-east-1",
        });

        await prisma.render.update({
          where: { id: renderId },
          data: { progress: Math.round((progress.overallProgress ?? 0) * 100) },
        });

        if (progress.done) {
          done = true;
          await prisma.render.update({
            where: { id: renderId },
            data: {
              status: "COMPLETED",
              progress: 100,
              outputUrl: progress.outputFile,
              completedAt: new Date(),
              remotionJobId: lambdaRenderId,
            },
          });
        } else if (progress.fatalErrorEncountered) {
          throw new Error(progress.errors?.[0]?.message ?? "Lambda render failed");
        }
      }
    } catch (err) {
      throw new Error(`Lambda render error: ${err}`);
    }
  }

  // Render local — para desenvolvimento
  private async renderLocal(renderId: string, request: RemotionRenderRequest): Promise<void> {
    console.log(`[RemotionAdapter] MOCK render local para: ${renderId}`);

    // Simular progresso
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((r) => setTimeout(r, 500));
      await prisma.render.update({ where: { id: renderId }, data: { progress: i } });
    }

    await prisma.render.update({
      where: { id: renderId },
      data: {
        status: "COMPLETED",
        progress: 100,
        outputUrl: `/mock-renders/${renderId}.mp4`,
        thumbnailUrl: `/mock-renders/${renderId}-thumb.jpg`,
        completedAt: new Date(),
      },
    });
  }

  // Verificar status de um render específico
  async getStatus(renderId: string): Promise<RemotionRenderStatus> {
    const render = await prisma.render.findUnique({ where: { id: renderId } });
    if (!render) return { jobId: renderId, status: "failed", progress: 0, error: "Not found" };

    const statusMap: Record<string, RemotionRenderStatus["status"]> = {
      QUEUED: "queued",
      RENDERING: "rendering",
      COMPLETED: "completed",
      FAILED: "failed",
      CANCELLED: "failed",
    };

    return {
      jobId: renderId,
      status: statusMap[render.status] ?? "failed",
      progress: render.progress,
      outputUrl: render.outputUrl ?? undefined,
      thumbnailUrl: render.thumbnailUrl ?? undefined,
      error: render.errorMessage ?? undefined,
    };
  }

  // Templates disponíveis de composição Remotion
  getAvailableCompositions(): Array<{ id: string; name: string; description: string }> {
    return [
      { id: "ai-reel-v1", name: "AI Reel v1", description: "Reel educativo sobre IA com texto animado" },
      { id: "carousel-slideshow", name: "Carousel Slideshow", description: "Apresentação de slides estilo carrossel" },
      { id: "talking-head", name: "Talking Head", description: "Avatar digital falando para câmera" },
      { id: "news-ticker", name: "News Ticker", description: "Notícias de IA em formato ticker" },
      { id: "comparison-chart", name: "Comparison Chart", description: "Comparativo animado de ferramentas" },
      { id: "tutorial-screen", name: "Tutorial Screen", description: "Tutorial com screen recording animado" },
    ];
  }
}

export const remotionAdapter = new RemotionAdapter();
