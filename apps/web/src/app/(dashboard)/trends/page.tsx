"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import {
  TrendingUp,
  Search,
  Zap,
  CheckCircle2,
  Plus,
  ArrowRight,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-zinc-800 ${className ?? ""}`} />
  );
}

function ScoreBadge({ score }: { score: number | null | undefined }) {
  if (score == null) return null;
  const s = Math.round(score * 10);
  const color =
    s >= 8
      ? "bg-emerald-900/60 text-emerald-300"
      : s >= 5
      ? "bg-amber-900/60 text-amber-300"
      : "bg-zinc-800 text-zinc-400";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
      {s}/10
    </span>
  );
}

// ---------------------------------------------------------------------------
// How it works section
// ---------------------------------------------------------------------------
function HowItWorksSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-indigo-400 shrink-0" />
          <span className="text-sm font-semibold text-zinc-300">
            Como funciona a pesquisa de tendências
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-zinc-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-zinc-500" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Flow diagram */}
          <div className="flex items-center gap-2 flex-wrap">
            {[
              {
                label: "last30days",
                desc: "Script Python",
                color: "border-indigo-700 bg-indigo-900/30 text-indigo-300",
              },
              null,
              {
                label: "Reddit · X · YouTube · HN · Bluesky",
                desc: "Fontes de dados",
                color: "border-zinc-700 bg-zinc-800 text-zinc-300",
              },
              null,
              {
                label: "Análise IA",
                desc: "OpenAI / Groq",
                color: "border-violet-700 bg-violet-900/30 text-violet-300",
              },
              null,
              {
                label: "Sinais",
                desc: "POSTADOR DB",
                color: "border-emerald-700 bg-emerald-900/30 text-emerald-300",
              },
            ].map((item, i) => {
              if (item === null) {
                return (
                  <ArrowRight key={i} className="h-4 w-4 text-zinc-600 shrink-0" />
                );
              }
              return (
                <div
                  key={i}
                  className={`rounded-lg border px-3 py-2 text-center ${item.color}`}
                >
                  <p className="text-xs font-semibold">{item.label}</p>
                  <p className="text-xs opacity-70 mt-0.5">{item.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Steps */}
          <ol className="space-y-2 text-sm text-zinc-400">
            <li className="flex gap-2">
              <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-900/60 text-indigo-300 text-xs flex items-center justify-center font-bold">
                1
              </span>
              <span>
                O script <code className="text-indigo-300 text-xs">last30days.py</code> recebe o tópico e consulta múltiplas plataformas via ScrapeCreators e Brave Search.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-900/60 text-indigo-300 text-xs flex items-center justify-center font-bold">
                2
              </span>
              <span>
                Os dados brutos são analisados por IA (OpenAI/Groq) para extrair relevância, engajamento e tendências emergentes.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-900/60 text-indigo-300 text-xs flex items-center justify-center font-bold">
                3
              </span>
              <span>
                Os sinais processados são salvos no banco de dados do POSTADOR e ficam disponíveis para geração de conteúdo.
              </span>
            </li>
          </ol>

          {/* Requirements */}
          <div className="rounded-lg border border-emerald-800/50 bg-emerald-900/10 p-3 space-y-2">
            <p className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Status das chaves de API
            </p>
            <div className="space-y-1.5">
              {/* ScrapeCreators — já configurado */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-400 font-bold">✓</span>
                  <span className="text-xs font-mono text-zinc-300">SCRAPECREATORS_API_KEY</span>
                  <span className="text-xs text-emerald-400">— configurado · Reddit + YouTube + TikTok + Instagram</span>
                </div>
              </div>
              {/* Anthropic — já configurado */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-400 font-bold">✓</span>
                  <span className="text-xs font-mono text-zinc-300">ANTHROPIC_API_KEY</span>
                  <span className="text-xs text-emerald-400">— configurado · geração de conteúdo</span>
                </div>
              </div>
              {/* Opcionais */}
              <div className="pt-1 border-t border-zinc-800">
                <p className="text-xs text-zinc-500 mb-1.5">Opcionais — mais fontes de dados:</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 font-bold">+</span>
                      <span className="text-xs font-mono text-zinc-500">XAI_API_KEY</span>
                      <span className="text-xs text-zinc-600">— X/Twitter (Grok)</span>
                    </div>
                    <a href="https://console.x.ai" target="_blank" rel="noopener noreferrer"
                      className="text-xs text-indigo-500 hover:text-indigo-400 flex items-center gap-1">
                      Obter <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 font-bold">+</span>
                      <span className="text-xs font-mono text-zinc-500">BRAVE_API_KEY</span>
                      <span className="text-xs text-zinc-600">— busca na web</span>
                    </div>
                    <a href="https://api.search.brave.com/app/keys" target="_blank" rel="noopener noreferrer"
                      className="text-xs text-indigo-500 hover:text-indigo-400 flex items-center gap-1">
                      Obter <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-zinc-500">
              Chaves opcionais em{" "}
              <a href="/settings" className="text-indigo-400 underline hover:text-indigo-300">
                Configurações
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function TrendsPage() {
  const [topic, setTopic] = useState("");
  const [researching, setResearching] = useState(false);
  const [processedFilter, setProcessedFilter] = useState<
    boolean | undefined
  >(undefined);

  const { data, isLoading, refetch } = trpc.trends.list.useQuery({
    processed: processedFilter,
    page: 1,
    pageSize: 20,
  });

  const researchMutation = trpc.trends.research.useMutation({
    onSuccess: () => {
      setTopic("");
      setResearching(false);
      refetch();
    },
    onError: () => setResearching(false),
  });

  const markProcessed = trpc.trends.markProcessed.useMutation({
    onSuccess: () => refetch(),
  });

  const convertToIdea = trpc.trends.convertToIdea.useMutation({
    onSuccess: () => refetch(),
  });

  const handleResearch = () => {
    if (!topic.trim()) return;
    setResearching(true);
    researchMutation.mutate({ topic: topic.trim(), mode: "quick" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-indigo-400" />
          Tendências
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          {data
            ? `${data.total} sinais capturados`
            : "Sinais de tendência e oportunidades de conteúdo"}
        </p>
      </div>

      {/* How it works — collapsible */}
      <HowItWorksSection />

      {/* Research input */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-2">
          <Search className="h-4 w-4 text-indigo-400" />
          Pesquisar Tendência
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Ex: marketing de conteúdo, IA para negócios..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleResearch()}
            className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleResearch}
            disabled={!topic.trim() || researching}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Zap className="h-4 w-4" />
            {researching ? "Pesquisando..." : "Pesquisar"}
          </button>
        </div>
        {researching && (
          <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-indigo-400 animate-pulse" />
            Consultando last30days — Reddit, X, YouTube, HN, Bluesky... (pode
            levar até 30s)
          </p>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { label: "Todos", value: undefined },
          { label: "Não processados", value: false },
          { label: "Processados", value: true },
        ].map((opt) => (
          <button
            key={String(opt.value)}
            onClick={() => setProcessedFilter(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              processedFilter === opt.value
                ? "bg-indigo-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <TrendingUp className="h-14 w-14 mb-4 opacity-30" />
          <p className="text-base font-medium text-zinc-400">
            Nenhum sinal de tendência
          </p>
          <p className="text-sm mt-1">
            Pesquise um tema para capturar tendências relevantes
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map((signal) => (
            <div
              key={signal.id}
              className={`rounded-xl border bg-zinc-900 p-4 transition-colors ${
                signal.isProcessed
                  ? "border-zinc-800/50 opacity-70"
                  : "border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-semibold text-zinc-200">
                      {signal.topic}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                      {signal.source}
                    </span>
                    <ScoreBadge score={signal.relevanceScore} />
                    {signal.isProcessed && (
                      <span className="flex items-center gap-1 text-xs text-emerald-500">
                        <CheckCircle2 className="h-3 w-3" /> Processado
                      </span>
                    )}
                  </div>
                  {signal.normalizedText && (
                    <p className="text-sm text-zinc-400 line-clamp-2">
                      {signal.normalizedText}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-zinc-600">
                    {signal.capturedAt && (
                      <span>
                        {new Date(signal.capturedAt).toLocaleDateString(
                          "pt-BR"
                        )}
                      </span>
                    )}
                    {signal.engagementScore != null && (
                      <span>Eng: {(signal.engagementScore * 10).toFixed(1)}/10</span>
                    )}
                    {signal.sourceUrl && (
                      <a
                        href={signal.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-500 hover:text-indigo-400 flex items-center gap-0.5"
                      >
                        Fonte <ArrowRight className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                </div>
                {!signal.isProcessed && (
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={() =>
                        convertToIdea.mutate({ signalId: signal.id })
                      }
                      disabled={convertToIdea.isLoading}
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-indigo-900/60 text-indigo-300 hover:bg-indigo-800 transition-colors disabled:opacity-50"
                    >
                      <Plus className="h-3 w-3" />
                      Criar ideia
                    </button>
                    <button
                      onClick={() => markProcessed.mutate({ id: signal.id })}
                      className="text-xs px-2 py-1 rounded-lg bg-zinc-800 text-zinc-500 hover:bg-zinc-700 transition-colors"
                    >
                      Dispensar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
