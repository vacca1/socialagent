"use client";

import { trpc } from "@/lib/trpc/provider";
import { FileText, Clock, CheckCircle2, Eye, TrendingUp, Bot, AlertCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardStats() {
  const { data, isLoading } = trpc.dashboard.stats.useQuery({ period: "30d" });

  const cards = [
    {
      label: "Publicados (30d)",
      value: data?.postsPublished ?? 0,
      icon: CheckCircle2,
      color: "text-agency-green",
      bg: "bg-agency-green/10",
      delta: "+12%",
      deltaPositive: true,
    },
    {
      label: "Agendados",
      value: data?.postsScheduled ?? 0,
      icon: Clock,
      color: "text-agency-blue",
      bg: "bg-agency-blue/10",
    },
    {
      label: "Em Produção",
      value: data?.postsDraft ?? 0,
      icon: FileText,
      color: "text-agency-yellow",
      bg: "bg-agency-yellow/10",
    },
    {
      label: "Em Revisão",
      value: data?.postsInReview ?? 0,
      icon: Eye,
      color: "text-agency-purple",
      bg: "bg-agency-purple/10",
    },
    {
      label: "Aprovações Pendentes",
      value: data?.pendingApprovals ?? 0,
      icon: AlertCircle,
      color: "text-agency-red",
      bg: "bg-agency-red/10",
      urgent: (data?.pendingApprovals ?? 0) > 0,
    },
    {
      label: "Tendências Novas",
      value: data?.trendSignals ?? 0,
      icon: TrendingUp,
      color: "text-brand-500",
      bg: "bg-brand-500/10",
    },
    {
      label: "Agentes Ativos",
      value: data?.activeAgents ?? 0,
      icon: Bot,
      color: "text-agency-green",
      bg: "bg-agency-green/10",
    },
    {
      label: "Jobs Rodando",
      value: data?.runningJobs ?? 0,
      icon: Zap,
      color: "text-agency-yellow",
      bg: "bg-agency-yellow/10",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-3" />
            <div className="h-7 bg-muted rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={cn(
            "bg-card rounded-xl border border-border p-4 hover:shadow-sm transition-shadow",
            card.urgent && "border-agency-red/30 bg-agency-red/5"
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={cn("p-1.5 rounded-lg", card.bg)}>
              <card.icon className={cn("w-3.5 h-3.5", card.color)} />
            </div>
            {card.delta && (
              <span className={cn("text-[10px] font-medium", card.deltaPositive ? "text-agency-green" : "text-agency-red")}>
                {card.delta}
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums">{card.value}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{card.label}</p>
        </div>
      ))}
    </div>
  );
}
