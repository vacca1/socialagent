"use client";

import { trpc } from "@/lib/trpc/provider";
import { Radar, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const FORMAT_LABELS: Record<string, string> = {
  REEL: "Reel",
  CAROUSEL: "Carrossel",
  SINGLE_IMAGE: "Imagem",
  VIDEO: "Vídeo",
};

export function OpportunityFeed() {
  const { data } = trpc.dashboard.opportunities.useQuery({ limit: 5 });

  return (
    <div className="bg-card rounded-xl border border-border p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Radar className="w-4 h-4 text-brand-500" />
          <h3 className="font-semibold text-foreground text-sm">Oportunidades</h3>
        </div>
        <Link href="/reference-radar" className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-1">
          Ver tudo <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {!data?.length ? (
        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
          <Radar className="w-8 h-8 mb-2 opacity-30" />
          <p className="text-sm">Nenhuma oportunidade</p>
          <Link href="/reference-radar" className="text-xs text-brand-500 mt-1">Configurar radar →</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {data.map((opp: any) => (
            <div key={opp.id} className="p-2.5 rounded-lg border border-border hover:border-brand-500/30 hover:bg-brand-500/5 transition-all cursor-pointer">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-medium text-foreground leading-snug flex-1">{opp.topic}</p>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <Star className="w-3 h-3 text-agency-yellow fill-agency-yellow" />
                  <span className="text-[10px] font-bold text-foreground">
                    {Math.round(opp.fitScore * 10) / 10}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                {opp.referenceProfile && (
                  <span className="text-[10px] text-muted-foreground">
                    @{opp.referenceProfile.handle}
                  </span>
                )}
                {opp.recommendedFormat && (
                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                    {FORMAT_LABELS[opp.recommendedFormat] ?? opp.recommendedFormat}
                  </span>
                )}
                <UrgencyBadge score={opp.urgencyScore} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UrgencyBadge({ score }: { score: number }) {
  if (score >= 8) return <span className="text-[10px] text-agency-red font-medium">🔥 Urgente</span>;
  if (score >= 5) return <span className="text-[10px] text-agency-yellow font-medium">⚡ Alta</span>;
  return null;
}
