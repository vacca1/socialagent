"use client";

import { trpc } from "@/lib/trpc/provider";
import { Bot, CheckCircle2, Circle, AlertCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const AGENT_LABELS: Record<string, string> = {
  chief_strategy: "Chief Strategy",
  trend_research: "Trend Research",
  reference_radar: "Ref. Radar",
  content_planner: "Content Planner",
  creative_director: "Creative Dir.",
  carousel: "Carousel",
  video_script: "Video Script",
  production: "Production",
  copy: "Copy",
  compliance: "Compliance",
  publishing: "Publishing",
  community: "Community",
  analytics: "Analytics",
  repurpose: "Repurpose",
  ops_manager: "Ops Manager",
};

export function AgencyStatus() {
  const { data, isLoading } = trpc.dashboard.agencyStatus.useQuery();

  if (isLoading) return <div className="bg-card rounded-xl border border-border p-5 h-64 animate-pulse" />;

  const budgetPct = data?.budgetLimit ? Math.round((data.budgetUsed / data.budgetLimit) * 100) : 0;

  return (
    <div className="bg-card rounded-xl border border-border p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-brand-500" />
          <h3 className="font-semibold text-foreground text-sm">Agency Status</h3>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {data?.weekJobs ?? 0} runs/semana
        </span>
      </div>

      {/* Agentes */}
      <div className="space-y-1.5 mb-4">
        {(data?.agents ?? []).slice(0, 6).map((agent: any) => (
          <div key={agent.slug} className="flex items-center gap-2">
            <StatusDot status={agent.status} />
            <span className="text-xs text-foreground flex-1 truncate">
              {AGENT_LABELS[agent.slug] ?? agent.name}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {agent.status === "RUNNING" ? "rodando" : agent.status === "IDLE" ? "idle" : agent.status.toLowerCase()}
            </span>
          </div>
        ))}
      </div>

      {/* Aprovações pendentes */}
      {(data?.pendingApprovals ?? 0) > 0 && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-agency-yellow/10 border border-agency-yellow/20 mb-3">
          <AlertCircle className="w-3.5 h-3.5 text-agency-yellow flex-shrink-0" />
          <span className="text-xs text-foreground">
            {data?.pendingApprovals} aprovações aguardando
          </span>
        </div>
      )}

      {/* Orçamento */}
      {data?.budgetLimit ? (
        <div>
          <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
            <span>Orçamento IA (semana)</span>
            <span className={cn(budgetPct > 80 ? "text-agency-red" : "text-foreground")}>
              ${data.budgetUsed.toFixed(2)} / ${data.budgetLimit.toFixed(2)}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                budgetPct > 80 ? "bg-agency-red" : budgetPct > 50 ? "bg-agency-yellow" : "bg-agency-green"
              )}
              style={{ width: `${Math.min(budgetPct, 100)}%` }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  if (status === "RUNNING") return <div className="w-2 h-2 rounded-full bg-agency-green animate-pulse-slow" />;
  if (status === "ERROR") return <AlertCircle className="w-3 h-3 text-agency-red" />;
  if (status === "IDLE") return <Circle className="w-2 h-2 text-muted-foreground" />;
  return <CheckCircle2 className="w-2.5 h-2.5 text-muted-foreground" />;
}
