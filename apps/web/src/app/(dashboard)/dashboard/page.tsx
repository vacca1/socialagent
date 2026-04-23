import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { PipelineOverview } from "@/components/dashboard/pipeline-overview";
import { RecentPublications } from "@/components/dashboard/recent-publications";
import { AgencyStatus } from "@/components/dashboard/agency-status";
import { TrendRadar } from "@/components/dashboard/trend-radar";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { PendingApprovals } from "@/components/dashboard/pending-approvals";
import { OpportunityFeed } from "@/components/dashboard/opportunity-feed";

export const metadata: Metadata = { title: "Dashboard" };

// ─── Premium skeleton components ──────────────────────────────────────────────

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-zinc-900 p-4"
          style={{
            background: "#0d0d18",
            animationDelay: `${i * 80}ms`,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg skeleton-premium" />
            <div className="w-12 h-4 rounded skeleton-premium" />
          </div>
          <div className="h-7 w-20 rounded skeleton-premium mb-1.5" />
          <div className="h-3 w-28 rounded skeleton-premium" />
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton({ height = "h-64" }: { height?: string }) {
  return (
    <div
      className={`${height} rounded-xl border border-zinc-900 p-5`}
      style={{ background: "#0d0d18" }}
    >
      <div className="h-5 w-32 rounded skeleton-premium mb-2" />
      <div className="h-3 w-48 rounded skeleton-premium mb-6" />
      <div className="flex items-end gap-2 h-32">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-t skeleton-premium"
            style={{ height: `${40 + Math.sin(i) * 30 + 30}%`, animationDelay: `${i * 60}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Greeting helper ──────────────────────────────────────────────────────────

function getGreeting(): { text: string; emoji: string } {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Bom dia", emoji: "☀️" };
  if (hour < 18) return { text: "Boa tarde", emoji: "🌤️" };
  return { text: "Boa noite", emoji: "🌙" };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { text: greeting, emoji } = getGreeting();

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Header ──────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-900 px-6 py-5"
        style={{
          background: "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(99,102,241,0.04) 40%, rgba(8,8,15,0) 70%)",
        }}
      >
        {/* Glow de fundo */}
        <div
          className="absolute -top-10 -right-10 w-64 h-64 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)",
          }}
        />

        <div className="relative flex items-start justify-between flex-wrap gap-4">
          {/* Saudação */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{emoji}</span>
              <h1 className="text-xl font-bold text-white">
                {greeting}!{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #c4b5fd 0%, #a78bfa 50%, #818cf8 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Pronto para criar conteúdo?
                </span>
              </h1>
            </div>
            <p className="text-sm text-zinc-500">
              Visão geral da sua operação de conteúdo — tudo em um só lugar.
            </p>
          </div>

          {/* Indicador de status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-zinc-400 font-medium">Atualizado agora</span>
          </div>
        </div>
      </div>

      {/* ── Stats Cards ─────────────────────────── */}
      <Suspense fallback={<StatsSkeleton />}>
        <DashboardStats />
      </Suspense>

      {/* ── Grid Principal ──────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Performance Chart — 2/3 */}
        <div className="xl:col-span-2">
          <Suspense fallback={<ChartSkeleton height="h-64" />}>
            <PerformanceChart />
          </Suspense>
        </div>

        {/* Agency Status — 1/3 */}
        <div>
          <Suspense fallback={<ChartSkeleton height="h-64" />}>
            <AgencyStatus />
          </Suspense>
        </div>
      </div>

      {/* ── Segunda linha ───────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Pipeline */}
        <div>
          <Suspense fallback={<ChartSkeleton height="h-80" />}>
            <PipelineOverview />
          </Suspense>
        </div>

        {/* Trend Radar */}
        <div>
          <Suspense fallback={<ChartSkeleton height="h-80" />}>
            <TrendRadar />
          </Suspense>
        </div>

        {/* Oportunidades */}
        <div>
          <Suspense fallback={<ChartSkeleton height="h-80" />}>
            <OpportunityFeed />
          </Suspense>
        </div>
      </div>

      {/* ── Terceira linha ──────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Suspense fallback={<ChartSkeleton height="h-64" />}>
          <RecentPublications />
        </Suspense>

        <Suspense fallback={<ChartSkeleton height="h-64" />}>
          <PendingApprovals />
        </Suspense>
      </div>
    </div>
  );
}
