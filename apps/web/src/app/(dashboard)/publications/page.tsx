"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Send, Instagram, Youtube, Twitter, Linkedin, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-zinc-800 ${className ?? ""}`} />;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: "Pendente", color: "bg-zinc-700 text-zinc-300", icon: <Clock className="h-3 w-3" /> },
  SCHEDULED: { label: "Agendado", color: "bg-blue-900/60 text-blue-300", icon: <Clock className="h-3 w-3" /> },
  PUBLISHING: { label: "Publicando", color: "bg-amber-900/60 text-amber-300", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  PUBLISHED: { label: "Publicado", color: "bg-emerald-900/60 text-emerald-300", icon: <CheckCircle2 className="h-3 w-3" /> },
  FAILED: { label: "Falhou", color: "bg-red-900/60 text-red-300", icon: <XCircle className="h-3 w-3" /> },
  CANCELLED: { label: "Cancelado", color: "bg-zinc-800 text-zinc-500", icon: <XCircle className="h-3 w-3" /> },
};

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  INSTAGRAM: <Instagram className="h-4 w-4" />,
  YOUTUBE: <Youtube className="h-4 w-4" />,
  TWITTER_X: <Twitter className="h-4 w-4" />,
  LINKEDIN: <Linkedin className="h-4 w-4" />,
};

const FORMAT_LABELS: Record<string, string> = {
  CAROUSEL: "Carrossel",
  REEL: "Reel",
  SINGLE_IMAGE: "Imagem",
  VIDEO: "Vídeo",
  TEXT_POST: "Texto",
  SHORT_VIDEO: "Short",
  STORY: "Story",
};

const STATUS_OPTIONS = ["", "PENDING", "SCHEDULED", "PUBLISHED", "FAILED"];

export default function PublicationsPage() {
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading, refetch } = trpc.publications.list.useQuery({
    status: statusFilter || undefined,
    page: 1,
    pageSize: 20,
  });

  const cancel = trpc.publications.cancel.useMutation({
    onSuccess: () => refetch(),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Send className="h-6 w-6 text-indigo-400" />
            Publicações
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            {data ? `${data.total} publicações` : "Gerencie suas publicações agendadas e publicadas"}
          </p>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === s
                ? "bg-indigo-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            {s ? STATUS_CONFIG[s]?.label ?? s : "Todos"}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <Send className="h-14 w-14 mb-4 opacity-30" />
          <p className="text-base font-medium text-zinc-400">Nenhuma publicação encontrada</p>
          <p className="text-sm mt-1">Agende publicações a partir do pipeline</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map((pub) => {
            const statusCfg = STATUS_CONFIG[pub.status] ?? { label: pub.status, color: "bg-zinc-800 text-zinc-400", icon: null };
            const platform = pub.socialProfile?.platform;
            const analytics = pub.analytics?.[0];

            return (
              <div
                key={pub.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Platform icon */}
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-400">
                    {platform ? PLATFORM_ICONS[platform] ?? <Send className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${statusCfg.color}`}>
                        {statusCfg.icon}
                        {statusCfg.label}
                      </span>
                      {pub.format && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                          {FORMAT_LABELS[pub.format] ?? pub.format}
                        </span>
                      )}
                      {pub.socialProfile?.handle && (
                        <span className="text-xs text-zinc-500">@{pub.socialProfile.handle}</span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-300 line-clamp-2">
                      {pub.caption ?? pub.title ?? "Sem legenda"}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                      {pub.scheduledFor && (
                        <span>{new Date(pub.scheduledFor).toLocaleString("pt-BR")}</span>
                      )}
                      {analytics && (
                        <>
                          <span>{analytics.impressions?.toLocaleString()} impressões</span>
                          <span>{analytics.likes?.toLocaleString()} curtidas</span>
                          {analytics.engagementRate && (
                            <span>{(analytics.engagementRate * 100).toFixed(1)}% eng.</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {(pub.status === "PENDING" || pub.status === "SCHEDULED") && (
                    <button
                      onClick={() => cancel.mutate({ id: pub.id })}
                      className="text-xs px-2 py-1 rounded-lg bg-zinc-800 text-zinc-500 hover:bg-red-900/40 hover:text-red-400 transition-colors shrink-0"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
