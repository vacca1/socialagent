"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Layers, Plus, LayoutGrid, Sparkles } from "lucide-react";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-zinc-800 ${className ?? ""}`} />;
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-zinc-700 text-zinc-300",
  IN_PRODUCTION: "bg-blue-900/60 text-blue-300",
  IN_REVIEW: "bg-amber-900/60 text-amber-300",
  APPROVED: "bg-emerald-900/60 text-emerald-300",
  PUBLISHED: "bg-indigo-900/60 text-indigo-300",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Rascunho",
  IN_PRODUCTION: "Em produção",
  IN_REVIEW: "Em revisão",
  APPROVED: "Aprovado",
  PUBLISHED: "Publicado",
};

const STATUS_OPTIONS = ["", "DRAFT", "IN_PRODUCTION", "IN_REVIEW", "APPROVED", "PUBLISHED"];

export default function CarouselsPage() {
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading, refetch } = trpc.carousels.list.useQuery({
    status: statusFilter || undefined,
    page: 1,
    pageSize: 12,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Layers className="h-6 w-6 text-indigo-400" />
            Carrosséis
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Crie e gerencie seus carrosséis de conteúdo</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
          <Sparkles className="h-4 w-4" />
          Gerar com IA
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === s
                ? "bg-indigo-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {s ? STATUS_LABELS[s] : "Todos"}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <Layers className="h-14 w-14 mb-4 opacity-30" />
          <p className="text-base font-medium text-zinc-400">Nenhum carrossel encontrado</p>
          <p className="text-sm mt-1">Crie seu primeiro carrossel com IA ou manualmente</p>
          <button className="mt-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="h-4 w-4" />
            Criar carrossel
          </button>
        </div>
      ) : (
        <>
          <p className="text-xs text-zinc-500">{data.total} carrosséis</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.items.map((carousel) => (
              <div
                key={carousel.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 transition-colors cursor-pointer group"
              >
                {/* Cover preview */}
                <div className="aspect-[4/3] rounded-lg bg-zinc-800 mb-3 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                  <LayoutGrid className="h-8 w-8 text-zinc-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-zinc-200 truncate">{carousel.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[carousel.status] ?? "bg-zinc-800 text-zinc-400"}`}>
                      {STATUS_LABELS[carousel.status] ?? carousel.status}
                    </span>
                    <span className="text-xs text-zinc-500">{carousel.slideCount} slides</span>
                  </div>
                  {carousel.readabilityScore > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <div className="flex-1 bg-zinc-800 rounded-full h-1">
                        <div
                          className="h-1 rounded-full bg-indigo-500"
                          style={{ width: `${Math.min(carousel.readabilityScore * 10, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-500">{carousel.readabilityScore.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
