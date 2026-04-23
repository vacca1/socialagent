"use client";

import { trpc } from "@/lib/trpc/provider";
import { Kanban, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  IN_PRODUCTION: "bg-agency-yellow/20 text-agency-yellow border-agency-yellow/30",
  IN_REVIEW: "bg-agency-purple/20 text-agency-purple border-agency-purple/30",
  APPROVED: "bg-agency-green/20 text-agency-green border-agency-green/30",
  IDEA: "bg-muted text-muted-foreground border-border",
  BRIEFING: "bg-agency-blue/20 text-agency-blue border-agency-blue/30",
};

const STATUS_LABELS: Record<string, string> = {
  IDEA: "Ideia",
  BRIEFING: "Briefing",
  IN_PRODUCTION: "Produção",
  IN_REVIEW: "Revisão",
  APPROVED: "Aprovado",
};

const FORMAT_LABELS: Record<string, string> = {
  REEL: "🎬 Reel",
  CAROUSEL: "📊 Carrossel",
  SINGLE_IMAGE: "🖼️ Imagem",
  VIDEO: "📹 Vídeo",
  STORY: "⚡ Story",
  TEXT_POST: "📝 Texto",
};

export function PipelineOverview() {
  const { data: pipeline, isLoading } = trpc.dashboard.pipeline.useQuery();

  return (
    <div className="bg-card rounded-xl border border-border p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Kanban className="w-4 h-4 text-brand-500" />
          <h3 className="font-semibold text-foreground text-sm">Pipeline</h3>
        </div>
        <Link href="/pipeline" className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1">
          Ver tudo <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : !pipeline?.length ? (
        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
          <Kanban className="w-8 h-8 mb-2 opacity-30" />
          <p className="text-sm">Pipeline vazio</p>
          <Link href="/ideas" className="text-xs text-brand-500 mt-1">Criar ideia →</Link>
        </div>
      ) : (
        <div className="space-y-1.5">
          {pipeline.map((item: any) => (
            <div key={item.id} className="flex items-center gap-2.5 py-2 px-2.5 rounded-lg hover:bg-muted/50 transition-colors group">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
                <p className="text-[10px] text-muted-foreground">
                  {FORMAT_LABELS[item.format] ?? item.format}
                </p>
              </div>
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-md border font-medium flex-shrink-0",
                STATUS_COLORS[item.status] ?? "bg-muted text-muted-foreground border-border"
              )}>
                {STATUS_LABELS[item.status] ?? item.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
