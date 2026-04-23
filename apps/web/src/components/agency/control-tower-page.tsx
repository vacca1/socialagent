"use client";

import { trpc } from "@/lib/trpc/provider";
import { toast } from "sonner";
import {
  Zap, Bot, AlertCircle, CheckCircle2, Play,
  DollarSign, Activity, Clock, TrendingUp, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

const AGENT_LABELS: Record<string, { name: string; emoji: string; role: string }> = {
  chief_strategy:    { name: "Chief Strategy",    emoji: "🎯", role: "Estratégia" },
  trend_research:    { name: "Trend Research",    emoji: "🔍", role: "Pesquisa" },
  reference_radar:   { name: "Reference Radar",   emoji: "📡", role: "Benchmark" },
  content_planner:   { name: "Content Planner",   emoji: "📅", role: "Planejamento" },
  creative_director: { name: "Creative Director", emoji: "🎨", role: "Criativo" },
  carousel:          { name: "Carousel",          emoji: "🎴", role: "Produção" },
  video_script:      { name: "Video Script",      emoji: "🎬", role: "Produção" },
  production:        { name: "Production",        emoji: "⚙️", role: "Produção" },
  copy:              { name: "Copy",              emoji: "✍️", role: "Copy" },
  compliance:        { name: "Compliance",        emoji: "🛡️", role: "Qualidade" },
  publishing:        { name: "Publishing",        emoji: "📤", role: "Publicação" },
  community:         { name: "Community",         emoji: "💬", role: "Comunidade" },
  analytics:         { name: "Analytics",         emoji: "📊", role: "Analytics" },
  repurpose:         { name: "Repurpose",         emoji: "♻️", role: "Estratégia" },
  ops_manager:       { name: "Ops Manager",       emoji: "🏭", role: "Operações" },
};

export function ControlTowerPage() {
  const { data, isLoading, refetch } = trpc.agency.controlTower.useQuery();
  const runAgentMutation = trpc.agency.runAgent.useMutation({
    onSuccess: (r) => { toast.success(`Agente enfileirado (Run: ${r.runId.substring(0, 8)}...)`); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const budgetPct = data?.budgetLimit
    ? Math.round((data.budgetUsed / data.budgetLimit) * 100)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-brand-500" />
            <h1 className="text-2xl font-bold text-foreground">Control Tower</h1>
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Monitoramento e controle da operação agêntica
          </p>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors">
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </button>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatusCard icon={Bot} label="Agentes Habilitados" value={data?.agents.filter((a: any) => a.isEnabled).length ?? 0} color="brand-500" />
        <StatusCard icon={Activity} label="Runs esta Semana" value={data?.weeklyRuns ?? 0} color="agency-green" />
        <StatusCard icon={AlertCircle} label="Aprovações Pendentes" value={data?.pendingApprovals ?? 0} color="agency-yellow" urgent={(data?.pendingApprovals ?? 0) > 0} />
        <StatusCard icon={AlertCircle} label="Jobs com Falha" value={data?.failedJobs ?? 0} color="agency-red" urgent={(data?.failedJobs ?? 0) > 0} />
      </div>

      {/* Orçamento */}
      {data?.budgetLimit ? (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-brand-500" />
              <h3 className="font-semibold text-sm">Orçamento IA (Semana)</h3>
            </div>
            <span className={cn("text-sm font-bold", budgetPct > 80 ? "text-agency-red" : "text-foreground")}>
              ${data.budgetUsed.toFixed(2)} / ${data.budgetLimit.toFixed(2)}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", budgetPct > 80 ? "bg-agency-red" : budgetPct > 50 ? "bg-agency-yellow" : "bg-agency-green")}
              style={{ width: `${Math.min(budgetPct, 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">{budgetPct}% utilizado</p>
        </div>
      ) : null}

      {/* Grid de Agentes */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Agentes Especializados</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {(data?.agents ?? []).map((agent: any) => {
              const meta = AGENT_LABELS[agent.slug] ?? { name: agent.name, emoji: "🤖", role: "Agente" };
              return (
                <div
                  key={agent.slug}
                  className={cn(
                    "bg-card border rounded-xl p-4 transition-all hover:shadow-sm",
                    agent.status === "RUNNING" ? "border-agency-green/30 bg-agency-green/5" :
                    agent.status === "ERROR" ? "border-agency-red/30 bg-agency-red/5" :
                    "border-border"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">{meta.emoji}</span>
                    <StatusBadge status={agent.status} isEnabled={agent.isEnabled} />
                  </div>
                  <p className="text-xs font-semibold text-foreground">{meta.name}</p>
                  <p className="text-[10px] text-muted-foreground mb-3">{meta.role}</p>
                  <button
                    onClick={() => runAgentMutation.mutate({ agentSlug: agent.slug })}
                    disabled={!agent.isEnabled || runAgentMutation.isPending}
                    className="w-full flex items-center justify-center gap-1 py-1 text-[10px] border border-border rounded-md hover:bg-brand-500/10 hover:border-brand-500/30 hover:text-brand-500 transition-all disabled:opacity-40"
                  >
                    <Play className="w-2.5 h-2.5" />
                    Executar
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Playbooks rápidos */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Playbooks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { slug: "daily_routine",   label: "Rotina Diária",        emoji: "☀️", desc: "Tendências + Planejamento + Comentários" },
            { slug: "weekly_planning", label: "Planejamento Semanal",  emoji: "📅", desc: "Estratégia + Calendário editorial" },
            { slug: "content_creation",label: "Criar Conteúdo",       emoji: "✨", desc: "Brief → Produção → Revisão → Aprovação" },
            { slug: "weekly_analysis", label: "Análise Semanal",      emoji: "📈", desc: "Performance + Insights + Recomendações" },
          ].map((pb) => (
            <div key={pb.slug} className="bg-card border border-border rounded-xl p-4 hover:border-brand-500/30 transition-all cursor-pointer group">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{pb.emoji}</span>
                <div>
                  <p className="text-xs font-semibold text-foreground">{pb.label}</p>
                  <p className="text-[10px] text-muted-foreground">{pb.desc}</p>
                </div>
              </div>
              <button className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] bg-brand-500/10 text-brand-500 rounded-md hover:bg-brand-500/20 transition-colors font-medium">
                <Play className="w-3 h-3" />
                Executar Playbook
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusCard({ icon: Icon, label, value, color, urgent }: any) {
  return (
    <div className={cn("bg-card border rounded-xl p-4", urgent ? "border-agency-red/30 bg-agency-red/5" : "border-border")}>
      <div className={cn("p-1.5 rounded-lg w-fit mb-2", `bg-${color}/10`)}>
        <Icon className={cn("w-4 h-4", `text-${color}`)} />
      </div>
      <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function StatusBadge({ status, isEnabled }: { status: string; isEnabled: boolean }) {
  if (!isEnabled) return <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">OFF</span>;
  if (status === "RUNNING") return <span className="text-[9px] text-agency-green bg-agency-green/10 px-1.5 py-0.5 rounded font-medium">● ATIVO</span>;
  if (status === "ERROR") return <span className="text-[9px] text-agency-red bg-agency-red/10 px-1.5 py-0.5 rounded font-medium">ERRO</span>;
  return <span className="text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">IDLE</span>;
}
