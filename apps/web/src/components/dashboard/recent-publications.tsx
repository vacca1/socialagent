"use client";

import { trpc } from "@/lib/trpc/provider";
import { Send, ArrowRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const PLATFORM_EMOJI: Record<string, string> = {
  INSTAGRAM: "📸",
  YOUTUBE: "▶️",
  TIKTOK: "🎵",
  TWITTER_X: "𝕏",
  LINKEDIN: "💼",
};

export function RecentPublications() {
  const { data, isLoading } = trpc.dashboard.recentPublications.useQuery({ limit: 5 });

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Send className="w-4 h-4 text-brand-500" />
          <h3 className="font-semibold text-foreground text-sm">Publicações Recentes</h3>
        </div>
        <Link href="/publications" className="text-xs text-brand-500 flex items-center gap-1">
          Ver tudo <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}
        </div>
      ) : !data?.length ? (
        <div className="text-center py-8 text-muted-foreground">
          <Send className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Nenhuma publicação ainda</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.map((pub: any) => (
            <div key={pub.id} className="flex items-center gap-3 py-2 px-2.5 rounded-lg hover:bg-muted/50 transition-colors">
              <span className="text-lg flex-shrink-0">
                {PLATFORM_EMOJI[pub.socialProfile?.platform] ?? "📱"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {pub.title ?? pub.caption?.substring(0, 50) ?? "Post sem título"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {pub.publishedAt
                    ? format(new Date(pub.publishedAt), "dd 'de' MMM, HH:mm", { locale: ptBR })
                    : "—"}
                </p>
              </div>
              {pub.analytics?.[0] && (
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-foreground tabular-nums">
                    {(pub.analytics[0].impressions ?? 0).toLocaleString("pt-BR")}
                  </p>
                  <p className="text-[10px] text-muted-foreground">impressões</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
