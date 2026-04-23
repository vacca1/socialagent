"use client";

import { trpc } from "@/lib/trpc/client";
import { GitBranch, Lightbulb, FileText, Hammer, Eye, CheckCircle2, Clock, Send } from "lucide-react";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-zinc-800 ${className ?? ""}`} />;
}

type PipelineStatus = "IDEA" | "BRIEFING" | "IN_PRODUCTION" | "IN_REVIEW" | "APPROVED" | "SCHEDULED";

const COLUMNS: { status: PipelineStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { status: "IDEA", label: "Ideia", icon: <Lightbulb className="h-4 w-4" />, color: "text-zinc-400 border-zinc-700" },
  { status: "BRIEFING", label: "Briefing", icon: <FileText className="h-4 w-4" />, color: "text-blue-400 border-blue-900" },
  { status: "IN_PRODUCTION", label: "Produção", icon: <Hammer className="h-4 w-4" />, color: "text-amber-400 border-amber-900" },
  { status: "IN_REVIEW", label: "Revisão", icon: <Eye className="h-4 w-4" />, color: "text-purple-400 border-purple-900" },
  { status: "APPROVED", label: "Aprovado", icon: <CheckCircle2 className="h-4 w-4" />, color: "text-emerald-400 border-emerald-900" },
  { status: "SCHEDULED", label: "Agendado", icon: <Clock className="h-4 w-4" />, color: "text-indigo-400 border-indigo-900" },
];

const FORMAT_LABELS: Record<string, string> = {
  CAROUSEL: "Carrossel",
  REEL: "Reel",
  SINGLE_IMAGE: "Imagem",
  VIDEO: "Vídeo",
  TEXT_POST: "Texto",
  SHORT_VIDEO: "Short",
  STORY: "Story",
};

export default function PipelinePage() {
  const { data: items, isLoading } = trpc.dashboard.pipeline.useQuery();

  const grouped = COLUMNS.reduce<Record<string, typeof items>>((acc, col) => {
    acc[col.status] = items?.filter((i) => i.status === col.status) ?? [];
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <GitBranch className="h-6 w-6 text-indigo-400" />
          Pipeline de Conteúdo
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          {items ? `${items.length} projetos em andamento` : "Acompanhe o progresso do seu conteúdo"}
        </p>
      </div>

      {/* Kanban */}
      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <div key={col.status} className="w-60 shrink-0 space-y-3">
              <Skeleton className="h-8 w-full" />
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const colItems = grouped[col.status] ?? [];
            return (
              <div key={col.status} className="w-60 shrink-0">
                {/* Column header */}
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border mb-3 ${col.color} bg-zinc-900`}>
                  {col.icon}
                  <span className="text-sm font-semibold">{col.label}</span>
                  <span className="ml-auto text-xs bg-zinc-800 px-1.5 py-0.5 rounded-full text-zinc-400">
                    {colItems.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-2">
                  {colItems.length === 0 ? (
                    <div className="border border-dashed border-zinc-800 rounded-lg p-4 text-center text-xs text-zinc-600">
                      Vazio
                    </div>
                  ) : (
                    colItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 hover:border-zinc-600 transition-colors cursor-pointer"
                      >
                        <p className="text-sm font-medium text-zinc-200 line-clamp-2 mb-2">
                          {item.title ?? "Sem título"}
                        </p>
                        <div className="flex items-center justify-between">
                          {item.format && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                              {FORMAT_LABELS[item.format] ?? item.format}
                            </span>
                          )}
                          {item.scheduledFor && (
                            <span className="text-xs text-zinc-500 flex items-center gap-0.5">
                              <Send className="h-2.5 w-2.5" />
                              {new Date(item.scheduledFor).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
