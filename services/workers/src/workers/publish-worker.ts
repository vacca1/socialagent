// =============================================================================
// POSTADOR — Worker de Publicação
// Processa jobs da fila "publish" via BullMQ
// Integra com SocialFlow adapter para publicação real
// =============================================================================

import { Worker, Job } from "bullmq";
import { prisma } from "@postador/database";

const connection = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: parseInt(process.env.REDIS_PORT ?? "6379"),
  password: process.env.REDIS_PASSWORD,
};

const SOCIALFLOW_URL = process.env.SOCIALFLOW_API_URL ?? "http://localhost:8000";

export const publishWorker = new Worker(
  "publish",
  async (job: Job) => {
    const { publicationId } = job.data as { publicationId: string };

    console.log(`[PublishWorker] Processando publicação: ${publicationId} (tentativa ${job.attemptsMade + 1})`);

    // Buscar publicação
    const publication = await prisma.publication.findUnique({
      where: { id: publicationId },
      include: { socialProfile: true },
    });

    if (!publication) {
      throw new Error(`Publicação ${publicationId} não encontrada`);
    }

    if (publication.status === "PUBLISHED" || publication.status === "CANCELLED") {
      console.log(`[PublishWorker] Publicação ${publicationId} já está em status ${publication.status}. Skip.`);
      return { skipped: true };
    }

    // Atualizar status
    await prisma.publication.update({
      where: { id: publicationId },
      data: { status: "PUBLISHING" },
    });

    // Registrar tentativa
    const attempt = await prisma.publicationAttempt.create({
      data: {
        publicationId,
        attemptNumber: job.attemptsMade + 1,
        status: "PUBLISHING",
        payload: {
          caption: publication.caption,
          mediaUrls: publication.mediaUrls,
          hashtags: publication.hashtags,
          format: publication.format,
        } as any,
        attemptedAt: new Date(),
      },
    });

    try {
      // Chamar SocialFlow para publicação
      const res = await fetch(`${SOCIALFLOW_URL}/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_id: publication.socialProfile.externalAccountId,
          platform: publication.socialProfile.platform.toLowerCase(),
          content: [publication.caption, ...publication.hashtags].join("\n\n"),
          media_urls: publication.mediaUrls,
        }),
        signal: AbortSignal.timeout(60_000),
      });

      let result: any = null;
      if (res.ok) {
        result = await res.json();
      } else {
        // SocialFlow offline → modo de publicação manual
        console.warn(`[PublishWorker] SocialFlow indisponível. Marcando como REQUIRES_MANUAL.`);
        await prisma.publication.update({
          where: { id: publicationId },
          data: { status: "REQUIRES_MANUAL", errorMessage: "SocialFlow offline" },
        });

        await prisma.publicationAttempt.update({
          where: { id: attempt.id },
          data: { status: "REQUIRES_MANUAL", errorMessage: "SocialFlow offline", durationMs: Date.now() - attempt.attemptedAt.getTime() },
        });

        // Notificar usuário
        await prisma.notification.create({
          data: {
            userId: publication.userId,
            type: "alert",
            title: "Publicação requer ação manual",
            message: `O post "${publication.title ?? "sem título"}" precisa ser publicado manualmente. O serviço de automação está offline.`,
            action: { label: "Ver publicação", href: `/publications/${publicationId}` } as any,
          },
        });

        return { manual: true };
      }

      // Sucesso!
      await prisma.publication.update({
        where: { id: publicationId },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
          externalPostId: result?.post_id ?? result?.id,
          externalUrl: result?.url ?? result?.post_url,
          socialflowJobId: result?.job_id,
        },
      });

      await prisma.publicationAttempt.update({
        where: { id: attempt.id },
        data: {
          status: "PUBLISHED",
          response: result as any,
          durationMs: Date.now() - attempt.attemptedAt.getTime(),
        },
      });

      // Log de auditoria
      await prisma.auditLog.create({
        data: {
          userId: publication.userId,
          action: "published",
          entityType: "publication",
          entityId: publicationId,
          after: { externalPostId: result?.post_id, publishedAt: new Date().toISOString() } as any,
        },
      });

      console.log(`[PublishWorker] ✅ Publicação ${publicationId} concluída com sucesso`);
      return { success: true, externalPostId: result?.post_id };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`[PublishWorker] ❌ Erro na publicação ${publicationId}:`, errorMessage);

      await prisma.publicationAttempt.update({
        where: { id: attempt.id },
        data: {
          status: "FAILED",
          errorMessage,
          durationMs: Date.now() - attempt.attemptedAt.getTime(),
        },
      });

      // Se é a última tentativa, marcar como FAILED
      const maxAttempts = job.opts.attempts ?? 3;
      if (job.attemptsMade + 1 >= maxAttempts) {
        await prisma.publication.update({
          where: { id: publicationId },
          data: { status: "FAILED", errorMessage },
        });

        await prisma.notification.create({
          data: {
            userId: publication.userId,
            type: "error",
            title: "Falha na publicação",
            message: `Não foi possível publicar "${publication.title ?? "sem título"}" após ${maxAttempts} tentativas.`,
            action: { label: "Verificar", href: `/publications/${publicationId}` } as any,
          },
        });
      } else {
        // Voltar para PENDING para retry
        await prisma.publication.update({
          where: { id: publicationId },
          data: { status: "PENDING" },
        });
      }

      throw err; // BullMQ vai fazer retry
    }
  },
  {
    connection,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY ?? "3"),
    limiter: { max: 10, duration: 60_000 }, // máx 10 publicações/minuto
  }
);

publishWorker.on("completed", (job, result) => {
  console.log(`[PublishWorker] Job ${job.id} concluído:`, result);
});

publishWorker.on("failed", (job, err) => {
  console.error(`[PublishWorker] Job ${job?.id} falhou:`, err.message);
});

publishWorker.on("error", (err) => {
  console.error("[PublishWorker] Erro no worker:", err);
});

console.log("🚀 Publish Worker iniciado");
