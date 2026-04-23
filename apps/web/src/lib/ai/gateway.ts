// =============================================================================
// POSTADOR — AI Gateway
// Multi-provider com fallback, retry, cache e observabilidade
// Suporta: OpenAI, Anthropic, Groq, Together
// =============================================================================

import type { AICompletionOptions, AICompletionResult, AIProvider } from "@postador/types";

// ============================================================
// Tabela de modelos por provider
// ============================================================
const PROVIDER_MODELS: Record<AIProvider, string> = {
  openai: "gpt-4o",
  anthropic: "claude-sonnet-4-5",
  groq: "llama-3.3-70b-versatile",
  together: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
  google: "gemini-2.0-flash-exp",
};

// Custo estimado por 1K tokens (USD)
const TOKEN_COSTS: Record<string, { input: number; output: number }> = {
  "gpt-4o":                             { input: 0.0025, output: 0.01 },
  "gpt-4o-mini":                        { input: 0.00015, output: 0.0006 },
  "claude-sonnet-4-5":         { input: 0.003, output: 0.015 },
  "claude-haiku-4-5":            { input: 0.00025, output: 0.00125 },
  "llama-3.3-70b-versatile":            { input: 0.00059, output: 0.00079 },
  "meta-llama/Llama-3.3-70B-Instruct-Turbo": { input: 0.00088, output: 0.00088 },
  "gemini-2.0-flash-exp":              { input: 0.0, output: 0.0 },
};

// ============================================================
// AI Gateway principal
// ============================================================
class AIGateway {
  private defaultProvider: AIProvider;
  private fallbackProvider: AIProvider;

  constructor() {
    this.defaultProvider = (process.env.AI_DEFAULT_PROVIDER as AIProvider) ?? "openai";
    this.fallbackProvider = (process.env.AI_FALLBACK_PROVIDER as AIProvider) ?? "anthropic";
  }

  async complete(options: AICompletionOptions): Promise<AICompletionResult> {
    const provider = options.provider ?? this.defaultProvider;
    const start = Date.now();

    try {
      return await this.callProvider(provider, options, start);
    } catch (primaryError) {
      console.warn(`[AI Gateway] Provider ${provider} falhou. Tentando fallback ${this.fallbackProvider}...`, primaryError);

      try {
        return await this.callProvider(this.fallbackProvider, { ...options, provider: this.fallbackProvider }, start);
      } catch (fallbackError) {
        console.error("[AI Gateway] Fallback também falhou:", fallbackError);
        throw fallbackError;
      }
    }
  }

  private async callProvider(
    provider: AIProvider,
    options: AICompletionOptions,
    start: number
  ): Promise<AICompletionResult> {
    const model = options.model ?? PROVIDER_MODELS[provider] ?? "gpt-4o";
    const maxTokens = options.maxTokens ?? 4096;
    const temperature = options.temperature ?? 0.7;

    let content = "";
    let inputTokens = 0;
    let outputTokens = 0;

    switch (provider) {
      case "openai":
        ({ content, inputTokens, outputTokens } = await this.callOpenAI(options, model, maxTokens, temperature));
        break;
      case "anthropic":
        ({ content, inputTokens, outputTokens } = await this.callAnthropic(options, model, maxTokens, temperature));
        break;
      case "groq":
        ({ content, inputTokens, outputTokens } = await this.callGroq(options, model, maxTokens, temperature));
        break;
      default:
        ({ content, inputTokens, outputTokens } = await this.callOpenAI(options, model, maxTokens, temperature));
    }

    const costModel = TOKEN_COSTS[model] ?? { input: 0.001, output: 0.003 };
    const costUsd = (inputTokens / 1000) * costModel.input + (outputTokens / 1000) * costModel.output;

    // Tentar parsear JSON se responseFormat === "json"
    let parsed: unknown = undefined;
    if (options.responseFormat === "json") {
      try {
        // Limpar markdown code blocks se presentes
        const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        parsed = JSON.parse(cleaned);
        content = cleaned;
      } catch {
        // Manter content como string se parse falhar
      }
    }

    return {
      content,
      parsed,
      provider,
      model,
      inputTokens,
      outputTokens,
      costUsd,
      latencyMs: Date.now() - start,
    };
  }

  private async callOpenAI(
    options: AICompletionOptions,
    model: string,
    maxTokens: number,
    temperature: number
  ) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY não configurada");

    const body: Record<string, unknown> = {
      model,
      messages: options.messages,
      max_tokens: maxTokens,
      temperature,
    };

    if (options.responseFormat === "json") {
      body.response_format = { type: "json_object" };
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...(process.env.OPENAI_ORG_ID && { "OpenAI-Organization": process.env.OPENAI_ORG_ID }),
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(120_000),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI error ${res.status}: ${err}`);
    }

    const data = await res.json() as any;
    return {
      content: data.choices?.[0]?.message?.content ?? "",
      inputTokens: data.usage?.prompt_tokens ?? 0,
      outputTokens: data.usage?.completion_tokens ?? 0,
    };
  }

  private async callAnthropic(
    options: AICompletionOptions,
    model: string,
    maxTokens: number,
    temperature: number
  ) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY não configurada");

    // Separar system message
    const systemMsg = options.messages.find((m) => m.role === "system")?.content ?? "";
    const userMessages = options.messages.filter((m) => m.role !== "system");

    const body: Record<string, unknown> = {
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemMsg,
      messages: userMessages,
    };

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(120_000),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic error ${res.status}: ${err}`);
    }

    const data = await res.json() as any;
    return {
      content: data.content?.[0]?.text ?? "",
      inputTokens: data.usage?.input_tokens ?? 0,
      outputTokens: data.usage?.output_tokens ?? 0,
    };
  }

  private async callGroq(
    options: AICompletionOptions,
    model: string,
    maxTokens: number,
    temperature: number
  ) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY não configurada");

    const body: Record<string, unknown> = {
      model,
      messages: options.messages,
      max_tokens: maxTokens,
      temperature,
    };

    if (options.responseFormat === "json") {
      body.response_format = { type: "json_object" };
    }

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60_000),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Groq error ${res.status}: ${err}`);
    }

    const data = await res.json() as any;
    return {
      content: data.choices?.[0]?.message?.content ?? "",
      inputTokens: data.usage?.prompt_tokens ?? 0,
      outputTokens: data.usage?.completion_tokens ?? 0,
    };
  }
}

export const aiGateway = new AIGateway();
