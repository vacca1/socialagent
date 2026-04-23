"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { ShieldCheck, CheckCircle2, XCircle, AlertCircle, Clock, ChevronDown } from "lucide-react";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-zinc-800 ${className ?? ""}`} />;
}

type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_REVISION";

const STATUS_CONFIG: Record<ApprovalStatus, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: "Pendente", color: "bg-amber-900/60 text-amber-300 border-amber-800/50", icon: <Clock className="h-3.5 w-3.5" /> },
  APPROVED: { label: "Aprovado", color: "bg-emerald-900/60 text-emerald-300 border-emerald-800/50", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  REJECTED: { label: "Rejeitado", color: "bg-red-900/60 text-red-300 border-red-800/50", icon: <XCircle className="h-3.5 w-3.5" /> },
  NEEDS_REVISION: { label: "Revisão", color: "bg-orange-900/60 text-orange-300 border-orange-800/50", icon: <AlertCircle className="h-3.5 w-3.5" /> },
};

function RiskBar({ score }: { score: number | null }) {
  if (score == null) return null;
  const pct = Math.round(score * 100);
  const color = score > 0.7 ? "bg-red-500" : score > 0.4 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-zinc-800 rounded-full">
        <div className={`h-1 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-zinc-500 w-8 text-right">{pct}%</span>
    </div>
  );
}

export default function ApprovalsPage() {
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | undefined>("PENDING");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const { data, isLoading, refetch } = trpc.agency.approvals.useQuery({
    status: statusFilter,
    page: 1,
    pageSize: 20,
  });

  const reviewApproval = trpc.agency.reviewApproval.useMutation({
    onSuccess: () => { refetch(); setExpandedId(null); },
  });

  const statusOptions: (ApprovalStatus | undefined)[] = [undefined, "PENDING", "APPROVED", "REJECTED", "NEEDS_REVISION"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-indigo-400" />
            Centro de Aprovações
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            {data ? `${data.total} aprovações` : "Revise e aprove conteúdo gerado pelos agentes"}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {statusOptions.map((s) => {
          const cfg = s ? STATUS_CONFIG[s] : null;
          return (
            <button
              key={String(s)}
              onClick={() => setStatusFilter(s)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                statusFilter === s
                  ? "bg-indigo-600 text-white border-indigo-500"
                  : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700"
              }`}
            >
              {cfg?.icon}
              {cfg?.label ?? "Todos"}
            </button>
          );
        })}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <ShieldCheck className="h-14 w-14 mb-4 opacity-30" />
          <p className="text-base font-medium text-zinc-400">
            {statusFilter === "PENDING" ? "Nenhuma aprovação pendente" : "Nenhuma aprovação encontrada"}
          </p>
          <p className="text-sm mt-1">Os agentes criarão itens de aprovação automaticamente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map((approval) => {
            const statusCfg = STATUS_CONFIG[approval.status as ApprovalStatus] ?? STATUS_CONFIG["PENDING"];
            const isExpanded = expandedId === approval.id;

            return (
              <div
                key={approval.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer hover:bg-zinc-800/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : approval.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${statusCfg.color}`}>
                          {statusCfg.icon}
                          {statusCfg.label}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 capitalize">
                          {approval.type}
                        </span>
                        <span className="text-xs text-zinc-600 font-mono">{approval.entityType}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-zinc-200 mb-0.5">{approval.title}</h3>
                      {approval.description && (
                        <p className="text-sm text-zinc-500 line-clamp-1">{approval.description}</p>
                      )}
                      <div className="mt-2 space-y-1">
                        {approval.riskScore != null && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-600 w-16">Risco</span>
                            <RiskBar score={approval.riskScore} />
                          </div>
                        )}
                        {approval.confidence != null && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-600 w-16">Confiança</span>
                            <RiskBar score={approval.confidence} />
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-zinc-600 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </div>

                {/* Expanded actions */}
                {isExpanded && approval.status === "PENDING" && (
                  <div className="border-t border-zinc-800 p-4 bg-zinc-950/40">
                    <textarea
                      rows={2}
                      placeholder="Notas de revisão (opcional)..."
                      value={notes[approval.id] ?? ""}
                      onChange={(e) => setNotes(prev => ({ ...prev, [approval.id]: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none mb-3"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => reviewApproval.mutate({ id: approval.id, decision: "APPROVED", notes: notes[approval.id] })}
                        disabled={reviewApproval.isLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Aprovar
                      </button>
                      <button
                        onClick={() => reviewApproval.mutate({ id: approval.id, decision: "NEEDS_REVISION", notes: notes[approval.id] })}
                        disabled={reviewApproval.isLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        <AlertCircle className="h-3.5 w-3.5" />
                        Revisar
                      </button>
                      <button
                        onClick={() => reviewApproval.mutate({ id: approval.id, decision: "REJECTED", notes: notes[approval.id] })}
                        disabled={reviewApproval.isLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Rejeitar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
