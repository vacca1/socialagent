// =============================================================================
// POSTADOR — SocialFlow Adapter
// Integração com o repositório SocialFlow-main (FastAPI Python)
// Permite publicação via Playwright + HeyGen + agendamento
// =============================================================================

import type {
  SocialFlowAccount,
  SocialFlowPublishPayload,
  SocialFlowPublishResult,
} from "@postador/types";

const SOCIALFLOW_BASE_URL = process.env.SOCIALFLOW_API_URL ?? "http://localhost:8000";
const SOCIALFLOW_API_KEY = process.env.SOCIALFLOW_API_KEY ?? "";

class SocialFlowAdapter {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseUrl = SOCIALFLOW_BASE_URL;
    this.headers = {
      "Content-Type": "application/json",
      ...(SOCIALFLOW_API_KEY && { "X-API-Key": SOCIALFLOW_API_KEY }),
    };
  }

  // Verificar se o serviço está disponível
  async isHealthy(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/health`, {
        headers: this.headers,
        signal: AbortSignal.timeout(5000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Listar contas configuradas no SocialFlow
  async getAccounts(): Promise<SocialFlowAccount[]> {
    try {
      const res = await fetch(`${this.baseUrl}/api/accounts`, {
        headers: this.headers,
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(`SocialFlow accounts error: ${res.status}`);
      const data = await res.json() as any;
      return data.accounts ?? [];
    } catch (err) {
      console.error("[SocialFlowAdapter] Erro ao buscar contas:", err);
      return [];
    }
  }

  // Publicar conteúdo
  async publish(payload: SocialFlowPublishPayload): Promise<SocialFlowPublishResult> {
    const healthy = await this.isHealthy();

    if (!healthy) {
      console.warn("[SocialFlowAdapter] Serviço indisponível. Retornando modo manual.");
      return {
        jobId: `manual-${Date.now()}`,
        status: "failed",
        error: "SocialFlow offline. Publicação manual necessária.",
      };
    }

    try {
      const res = await fetch(`${this.baseUrl}/api/posts`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({
          account_id: payload.accountId,
          platform: payload.platform.toLowerCase(),
          content: payload.caption,
          hashtags: payload.hashtags.join(" "),
          media_urls: payload.mediaUrls,
          scheduled_time: payload.scheduledAt,
        }),
        signal: AbortSignal.timeout(30000),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`SocialFlow publish error: ${err}`);
      }

      const data = await res.json() as any;
      return {
        jobId: data.post_id ?? data.id ?? String(Date.now()),
        status: "queued",
        externalPostId: data.external_post_id,
        externalUrl: data.external_url,
      };
    } catch (err) {
      console.error("[SocialFlowAdapter] Erro ao publicar:", err);
      return {
        jobId: `error-${Date.now()}`,
        status: "failed",
        error: String(err),
      };
    }
  }

  // Verificar status de um job de publicação
  async getJobStatus(jobId: string): Promise<SocialFlowPublishResult> {
    try {
      const res = await fetch(`${this.baseUrl}/api/posts/${jobId}`, {
        headers: this.headers,
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(`Status error: ${res.status}`);
      const data = await res.json() as any;
      return {
        jobId,
        status: this.mapStatus(data.status),
        externalPostId: data.external_post_id,
        externalUrl: data.external_url,
        error: data.error,
      };
    } catch (err) {
      return { jobId, status: "failed", error: String(err) };
    }
  }

  // Gerar conteúdo via SocialFlow (usa seus providers de IA)
  async generateContent(prompt: string, platform: string): Promise<string> {
    try {
      const res = await fetch(`${this.baseUrl}/api/generate`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({ prompt, platform }),
        signal: AbortSignal.timeout(60000),
      });
      if (!res.ok) throw new Error(`Generate error: ${res.status}`);
      const data = await res.json() as any;
      return data.content ?? "";
    } catch (err) {
      console.error("[SocialFlowAdapter] Erro ao gerar conteúdo:", err);
      return "";
    }
  }

  // Gerar vídeo com HeyGen (via SocialFlow)
  async generateAvatarVideo(payload: {
    script: string;
    avatarId?: string;
    voiceId?: string;
  }): Promise<{ taskId: string; status: string }> {
    try {
      const res = await fetch(`${this.baseUrl}/api/generate-avatar`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({
          script: payload.script,
          avatar_id: payload.avatarId,
          voice_id: payload.voiceId,
        }),
        signal: AbortSignal.timeout(30000),
      });
      if (!res.ok) throw new Error(`Avatar gen error: ${res.status}`);
      const data = await res.json() as any;
      return { taskId: data.task_id ?? "", status: "queued" };
    } catch (err) {
      console.error("[SocialFlowAdapter] Erro ao gerar vídeo avatar:", err);
      return { taskId: "", status: "failed" };
    }
  }

  private mapStatus(status: string): SocialFlowPublishResult["status"] {
    const map: Record<string, SocialFlowPublishResult["status"]> = {
      pending: "queued",
      queued: "queued",
      publishing: "publishing",
      published: "published",
      completed: "published",
      failed: "failed",
      error: "failed",
    };
    return map[status?.toLowerCase()] ?? "failed";
  }
}

export const socialFlowAdapter = new SocialFlowAdapter();
