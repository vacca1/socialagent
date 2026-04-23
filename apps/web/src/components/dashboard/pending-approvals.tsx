"use client";

import { trpc } from "@/lib/trpc/provider";
import { CheckCircle2, XCircle, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function PendingApprovals() {
  const { data, isLoading, refetch } = trpc.dashboard.pendingApprovals.useQuery();
  const reviewMutation = trpc.agency.reviewApproval.useMutation({
    onSuccess: () => { toast.success("Revisão registrada"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-agency-yellow" />
          <h3 className="font-semibold text-foreground text-sm">Aprovações Pendentes</h3>
          {(data?.length ?? 0) > 0 && (
            <span className="bg-agency-yellow text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {data?.length}
            </span>
          )}
        </div>
        <Link href="/agency/approvals" className="text-xs text-brand-500 flex items-center gap-1">
          Ver tudo <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />)}
        </div>
      ) : !data?.length ? (
        <div className="text-center py-8 text-muted-foreground">
          <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-agency-green opacity-70" />
          <p className="text-sm">Tudo em dia! Sem aprovações pendentes.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.map((approval: any) => (
            <div key={approval.id} className={cn(
              "p-3 rounded-lg border transition-colors",
              approval.riskScore > 0.6 ? "border-agency-red/30 bg-agency-red/5" : "border-border hover:bg-muted/30"
            )}>
              <p className="text-xs font-medium text-foreground mb-0.5">{approval.title}</p>
              {approval.description && (
                <p className="text-[10px] text-muted-foreground truncate mb-2">{approval.description}</p>
              )}
              <div className="flex items-center gap-2">
                <ScorePill label="Conf." value={approval.confidence} color="blue" />
                <ScorePill label="Risco" value={approval.riskScore} color={approval.riskScore > 0.6 ? "red" : "green"} />
                <div className="ml-auto flex gap-1.5">
                  <button
                    onClick={() => reviewMutation.mutate({ id: approval.id, decision: "APPROVED" })}
                    disabled={reviewMutation.isPending}
                    className="p-1.5 rounded-md hover:bg-agency-green/10 text-agency-green transition-colors"
                    title="Aprovar"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => reviewMutation.mutate({ id: approval.id, decision: "REJECTED" })}
                    disabled={reviewMutation.isPending}
                    className="p-1.5 rounded-md hover:bg-agency-red/10 text-agency-red transition-colors"
                    title="Rejeitar"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ScorePill({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClass = color === "red" ? "text-agency-red" : color === "green" ? "text-agency-green" : "text-agency-blue";
  return (
    <span className="text-[10px] text-muted-foreground">
      {label}: <span className={cn("font-medium", colorClass)}>{Math.round(value * 100)}%</span>
    </span>
  );
}
