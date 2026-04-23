"use client";

import { trpc } from "@/lib/trpc/client";
import { BookOpen, Play, CheckCircle2, XCircle, Clock, Loader2, ChevronRight } from "lucide-react";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-zinc-800 ${className ?? ""}`} />;
}

const RUN_STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: "Pendente", color: "bg-zinc-700 text-zinc-300", icon: <Clock className="h-3 w-3" /> },
  RUNNING: { label: "Executando", color: "bg-blue-900/60 text-blue-300", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  COMPLETED: { label: "Concluído", color: "bg-emerald-900/60 text-emerald-300", icon: <CheckCircle2 className="h-3 w-3" /> },
  FAILED: { label: "Falhou", color: "bg-red-900/60 text-red-300", icon: <XCircle className="h-3 w-3" /> },
  PAUSED: { label: "Pausado", color: "bg-amber-900/60 text-amber-300", icon: <Clock className="h-3 w-3" /> },
};

export default function PlaybooksPage() {
  const { data: playbooks, isLoading: loadingPlaybooks, refetch: refetchPlaybooks } = trpc.agency.playbooks.useQuery();
  const { data: runsData, isLoading: loadingRuns, refetch: refetchRuns } = trpc.agency.workflowRuns.useQuery({ page: 1 });

  const runPlaybook = trpc.agency.runPlaybook.useMutation({
    onSuccess: () => { refetchPlaybooks(); refetchRuns(); },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-indigo-400" />
          Playbooks
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Execute workflows automatizados de produção de conteúdo</p>
      </div>

      {/* Playbooks */}
      <div>
        <h2 className="text-base font-semibold text-zinc-200 mb-4">Playbooks disponíveis</h2>
        {loadingPlaybooks ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-36" />
            ))}
          </div>
        ) : !playbooks || playbooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-500 rounded-xl border border-dashed border-zinc-800">
            <BookOpen className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm font-medium text-zinc-400">Nenhum playbook disponível</p>
            <p className="text-xs mt-1">Playbooks são configurados pelo administrador do sistema</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {playbooks.map((playbook) => (
              <div
                key={playbook.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-900/50 border border-indigo-800/50 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-indigo-400" />
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${playbook.isActive ? "bg-emerald-900/60 text-emerald-300" : "bg-zinc-800 text-zinc-500"}`}>
                    {playbook.isActive ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-zinc-200 mb-1">{playbook.name}</h3>
                {playbook.description && (
                  <p className="text-xs text-zinc-500 mb-4 line-clamp-2">{playbook.description}</p>
                )}
                <button
                  onClick={() => runPlaybook.mutate({ workflowSlug: playbook.slug })}
                  disabled={!playbook.isActive || runPlaybook.isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors"
                >
                  <Play className="h-3.5 w-3.5" />
                  {runPlaybook.isLoading && runPlaybook.variables?.workflowSlug === playbook.slug
                    ? "Iniciando..."
                    : "Executar playbook"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent runs */}
      <div>
        <h2 className="text-base font-semibold text-zinc-200 mb-4">Execuções recentes</h2>
        {loadingRuns ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : !runsData || runsData.items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-zinc-500">
            <p className="text-sm">Nenhuma execução registrada ainda</p>
          </div>
        ) : (
          <div className="space-y-2">
            {runsData.items.map((run) => {
              const statusCfg = RUN_STATUS_CONFIG[run.status] ?? RUN_STATUS_CONFIG["PENDING"];
              return (
                <div
                  key={run.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-zinc-200">
                        {run.workflow?.name ?? "Playbook desconhecido"}
                      </span>
                      <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${statusCfg?.color ?? "bg-zinc-700 text-zinc-300"}`}>
                        {statusCfg?.icon}
                        {statusCfg?.label ?? run.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-600">
                      <span>{new Date(run.createdAt).toLocaleString("pt-BR")}</span>
                      {run.completedAt && (
                        <span>
                          Duração: {Math.round((new Date(run.completedAt).getTime() - new Date(run.createdAt).getTime()) / 1000)}s
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-700 shrink-0" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
