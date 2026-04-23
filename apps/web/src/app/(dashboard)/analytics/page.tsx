"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { BarChart3, TrendingUp, Star, RefreshCw, ArrowUpRight } from "lucide-react";

type Period = "7d" | "30d" | "90d";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-zinc-800 ${className ?? ""}`} />;
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("30d");

  const { data: byFormat, isLoading: loadingFormat } = trpc.analytics.byFormat.useQuery({ period });
  const { data: topPosts, isLoading: loadingPosts } = trpc.analytics.topPosts.useQuery({ period, limit: 10 });
  const { data: frequency, isLoading: loadingFreq } = trpc.analytics.frequencyAnalysis.useQuery();

  const periods: { label: string; value: Period }[] = [
    { label: "7 dias", value: "7d" },
    { label: "30 dias", value: "30d" },
    { label: "90 dias", value: "90d" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-400" />
            Analytics
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Performance e insights do seu conteúdo</p>
        </div>
        <div className="flex gap-2">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                period === p.value
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Performance por Formato */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-400" />
          Performance por Formato
        </h2>
        {loadingFormat ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !byFormat || byFormat.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
            <BarChart3 className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm">Nenhum dado de performance ainda.</p>
            <p className="text-xs mt-1">Publique conteúdo e aguarde as métricas.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {byFormat.map((item) => {
              const maxScore = Math.max(...byFormat.map((i) => i.avgScore ?? 0));
              const pct = maxScore > 0 ? ((item.avgScore ?? 0) / maxScore) * 100 : 0;
              return (
                <div key={item.format} className="flex items-center gap-4">
                  <span className="w-28 text-sm text-zinc-400 shrink-0">{item.format}</span>
                  <div className="flex-1 bg-zinc-800 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-indigo-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-sm font-medium text-zinc-300">
                    {item.avgScore?.toFixed(1) ?? "—"}
                  </span>
                  <span className="text-xs text-zinc-500 w-12 text-right">{item.count} posts</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top Posts */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-400" />
          Top Posts
        </h2>
        {loadingPosts ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : !topPosts || topPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
            <Star className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm">Nenhum post publicado no período.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {topPosts.map((post, idx) => (
              <div
                key={post.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors"
              >
                <span className="text-lg font-bold text-zinc-600 w-6 text-center">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200 truncate">{post.title ?? "Sem título"}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{post.format}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-indigo-400">{post.score?.toFixed(1) ?? "—"}</p>
                  <p className="text-xs text-zinc-500">score</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-zinc-600 shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Frequência */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-emerald-400" />
          Frequência de Publicação
        </h2>
        {loadingFreq ? (
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : !frequency ? (
          <div className="text-center text-zinc-500 py-8 text-sm">Nenhum dado disponível.</div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">
              Total publicado: <span className="text-zinc-200 font-semibold">{frequency.totalPublished} posts</span>
            </p>
            <div className="grid grid-cols-7 gap-2">
              {frequency.byDayOfWeek.map((d) => {
                const max = Math.max(...frequency.byDayOfWeek.map((x) => x.count), 1);
                const h = Math.max(8, (d.count / max) * 80);
                return (
                  <div key={d.day} className="flex flex-col items-center gap-1">
                    <div className="w-full flex items-end justify-center" style={{ height: 80 }}>
                      <div
                        className="w-full rounded-t bg-indigo-600 opacity-80"
                        style={{ height: h }}
                      />
                    </div>
                    <span className="text-xs text-zinc-500">{d.day}</span>
                    <span className="text-xs font-medium text-zinc-300">{d.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
