"use client";

import { trpc } from "@/lib/trpc/provider";
import { TrendingUp, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function TrendRadar() {
  const { data: trends, isLoading } = trpc.dashboard.trendRadar.useQuery();

  return (
    <div className="bg-card rounded-xl border border-border p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-500" />
          <h3 className="font-semibold text-foreground text-sm">Radar de Tendências</h3>
        </div>
        <Link href="/trends" className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1">
          Ver tudo <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : !trends?.length ? (
        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
          <TrendingUp className="w-8 h-8 mb-2 opacity-30" />
          <p className="text-sm">Nenhuma tendência detectada</p>
          <Link href="/trends" className="text-xs text-brand-500 mt-1">Pesquisar temas →</Link>
        </div>
      ) : (
        <div className="space-y-1.5">
          {trends.map((signal: any) => (
            <div key={signal.id} className="flex items-center gap-2.5 py-2 px-2.5 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-shrink-0">
                <ScoreBar score={signal.relevanceScore * 10} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate capitalize">{signal.topic}</p>
                <p className="text-[10px] text-muted-foreground">{signal.source}</p>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-agency-yellow" />
                <span className="text-[10px] text-muted-foreground">
                  {Math.round(signal.relevanceScore * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 7 ? "bg-agency-green" : score >= 4 ? "bg-agency-yellow" : "bg-muted";
  return (
    <div className="w-1 h-8 bg-muted rounded-full overflow-hidden">
      <div
        className={cn("w-full rounded-full transition-all", color)}
        style={{ height: `${Math.min(score * 10, 100)}%`, marginTop: "auto" }}
      />
    </div>
  );
}
