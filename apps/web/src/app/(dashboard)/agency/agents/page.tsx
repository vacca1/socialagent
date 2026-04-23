"use client";

import { trpc } from "@/lib/trpc/client";
import { Bot, Play, Pause, Activity, Clock, CheckCircle2, AlertCircle } from "lucide-react";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-zinc-800 ${className ?? ""}`} />;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  RUNNING: { label: "Ativo", color: "text-emerald-400", icon: <Activity className="h-3 w-3 text-emerald-400 animate-pulse" /> },
  IDLE: { label: "Ocioso", color: "text-zinc-400", icon: <Clock className="h-3 w-3 text-zinc-500" /> },
  PAUSED: { label: "Pausado", color: "text-amber-400", icon: <Pause className="h-3 w-3 text-amber-400" /> },
  ERROR: { label: "Erro", color: "text-red-400", icon: <AlertCircle className="h-3 w-3 text-red-400" /> },
};

const MODE_LABELS: Record<string, string> = {
  MANUAL: "Manual",
  ASSISTED: "Assistido",
  SEMI_AUTONOMOUS: "Semi-autônomo",
  AUTONOMOUS_WITH_APPROVAL: "Autônomo c/ aprovação",
};

export default function AgentsPage() {
  const { data: agents, isLoading, refetch } = trpc.agency.agents.useQuery();

  const toggleAgent = trpc.agency.toggleAgent.useMutation({
    onSuccess: () => { void refetch(); },
  });

  const runAgent = trpc.agency.runAgent.useMutation({
    onSuccess: () => { void refetch(); },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <Bot className="h-6 w-6 text-indigo-400" />
          Agentes
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Gerencie os agentes de automação da sua agência</p>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : !agents || agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <Bot className="h-14 w-14 mb-4 opacity-30" />
          <p className="text-base font-medium text-zinc-400">Nenhum agente configurado</p>
          <p className="text-sm mt-1">Configure agentes para automatizar sua operação</p>
        </div>
      ) : (
        <div className="space-y-3">
          {agents.map((agent) => {
            const statusCfg = STATUS_CONFIG[agent.status ?? "IDLE"] ?? STATUS_CONFIG["IDLE"];
            return (
              <div
                key={agent.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    agent.isEnabled ? "bg-indigo-900/60 border border-indigo-800" : "bg-zinc-800 border border-zinc-700"
                  }`}>
                    <Bot className={`h-5 w-5 ${agent.isEnabled ? "text-indigo-400" : "text-zinc-600"}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <h3 className="text-sm font-semibold text-zinc-200">{agent.name}</h3>
                      <div className="flex items-center gap-1">
                        {statusCfg?.icon}
                        <span className={`text-xs ${statusCfg?.color ?? ""}`}>{statusCfg?.label ?? agent.status}</span>
                      </div>
                      {agent.mode && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500">
                          {MODE_LABELS[agent.mode] ?? agent.mode}
                        </span>
                      )}
                    </div>
                    {agent.description && (
                      <p className="text-sm text-zinc-500 mb-2">{agent.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-zinc-600">
                      <span className="font-mono text-zinc-700">{agent.slug}</span>
                      {agent.lastRunAt && (
                        <span>Última execução: {new Date(agent.lastRunAt).toLocaleString("pt-BR")}</span>
                      )}
                      {(agent as any).nextRunAt && (
                        <span>Próxima: {new Date((agent as any).nextRunAt).toLocaleString("pt-BR")}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => runAgent.mutate({ agentSlug: agent.slug })}
                      disabled={!agent.isEnabled || runAgent.isLoading}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-indigo-900/60 text-indigo-300 hover:bg-indigo-800 disabled:opacity-40 transition-colors"
                    >
                      <Play className="h-3 w-3" />
                      Executar
                    </button>
                    {/* Toggle */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agent.isEnabled}
                        onChange={(e) => toggleAgent.mutate({ slug: agent.slug, enabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
