// Publish Queue — usa BullMQ se Redis disponível, senão modo stub
let Queue: any = null;

try {
  // Tenta importar BullMQ dinamicamente
  const bullmq = require("bullmq");
  Queue = bullmq.Queue;
} catch {
  // BullMQ não disponível
}

const connection = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: parseInt(process.env.REDIS_PORT ?? "6379"),
};

function getQueue() {
  if (!Queue) return null;
  try {
    return new Queue("publish", { connection });
  } catch {
    return null;
  }
}

export const publishQueue = {
  async schedule(publicationId: string, scheduledFor: Date) {
    const q = getQueue();
    if (!q) {
      console.warn("[PublishQueue] Redis não disponível. Publicação manual necessária:", publicationId);
      return;
    }
    const delay = Math.max(0, scheduledFor.getTime() - Date.now());
    await q.add("publish-post", { publicationId }, {
      delay,
      attempts: 3,
      jobId: `pub-${publicationId}`,
    });
  },

  async publishNow(publicationId: string) {
    const q = getQueue();
    if (!q) {
      console.warn("[PublishQueue] Redis não disponível. Publicação manual necessária:", publicationId);
      return;
    }
    await q.add("publish-post", { publicationId }, {
      attempts: 3,
      jobId: `pub-now-${publicationId}-${Date.now()}`,
    });
  },

  async cancel(publicationId: string) {
    const q = getQueue();
    if (!q) return;
    const job = await q.getJob(`pub-${publicationId}`);
    if (job) await job.remove();
  },
};
