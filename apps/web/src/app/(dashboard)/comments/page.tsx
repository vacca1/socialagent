"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { MessageCircle, Search, Flame, Bot, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-zinc-800 ${className ?? ""}`} />;
}

const INTENT_COLORS: Record<string, string> = {
  QUESTION: "bg-blue-900/60 text-blue-300",
  PRAISE: "bg-emerald-900/60 text-emerald-300",
  COMPLAINT: "bg-red-900/60 text-red-300",
  BUY_SIGNAL: "bg-amber-900/60 text-amber-300",
  OBJECTION: "bg-orange-900/60 text-orange-300",
  OTHER: "bg-zinc-700 text-zinc-400",
};

const INTENT_LABELS: Record<string, string> = {
  QUESTION: "Pergunta",
  PRAISE: "Elogio",
  COMPLAINT: "Reclamação",
  BUY_SIGNAL: "Sinal de compra",
  OBJECTION: "Objeção",
  OTHER: "Outro",
};

const SUGGESTION_STATUS_ICON: Record<string, JSX.Element> = {
  APPROVED: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />,
  AWAITING_APPROVAL: <AlertCircle className="h-3.5 w-3.5 text-amber-400" />,
  REJECTED: <XCircle className="h-3.5 w-3.5 text-red-400" />,
};

export default function CommentsPage() {
  const [search, setSearch] = useState("");
  const [intentFilter, setIntentFilter] = useState<string>("");
  const [hotLeadOnly, setHotLeadOnly] = useState(false);

  const { data, isLoading, refetch } = trpc.comments.list.useQuery({
    search: search || undefined,
    intent: intentFilter || undefined,
    isHotLead: hotLeadOnly || undefined,
    page: 1,
    pageSize: 20,
  });

  const processSuggestion = trpc.comments.processSuggestion.useMutation({
    onSuccess: () => refetch(),
  });

  const markSpam = trpc.comments.markSpam.useMutation({
    onSuccess: () => refetch(),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-indigo-400" />
            Comentários
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            {data ? `${data.total} comentários` : "Gerencie e responda comentários com IA"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar comentários..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setHotLeadOnly(!hotLeadOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              hotLeadOnly ? "bg-amber-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            Hot Leads
          </button>
          {Object.keys(INTENT_LABELS).map((intent) => (
            <button
              key={intent}
              onClick={() => setIntentFilter(intentFilter === intent ? "" : intent)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                intentFilter === intent
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {INTENT_LABELS[intent]}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <MessageCircle className="h-14 w-14 mb-4 opacity-30" />
          <p className="text-base font-medium text-zinc-400">Nenhum comentário encontrado</p>
          <p className="text-sm mt-1">Os comentários das suas publicações aparecerão aqui</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.items.map((comment) => {
            const suggestion = comment.suggestions?.[0];
            return (
              <div
                key={comment.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-zinc-400">
                      {(comment.authorHandle ?? "?")[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-medium text-zinc-200">
                        @{comment.authorHandle ?? "usuário"}
                      </span>
                      {comment.isHotLead && (
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-300">
                          <Flame className="h-3 w-3" /> Hot Lead
                        </span>
                      )}
                      {comment.intent && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${INTENT_COLORS[comment.intent] ?? "bg-zinc-700 text-zinc-400"}`}>
                          {INTENT_LABELS[comment.intent] ?? comment.intent}
                        </span>
                      )}
                      {suggestion && SUGGESTION_STATUS_ICON[suggestion.status] && (
                        <span className="flex items-center gap-1 text-xs text-zinc-500">
                          {SUGGESTION_STATUS_ICON[suggestion.status]}
                          Sugestão {suggestion.status === "APPROVED" ? "aprovada" : suggestion.status === "AWAITING_APPROVAL" ? "pendente" : "rejeitada"}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-300">{comment.text}</p>
                    {suggestion && (
                      <div className="mt-2 p-2 rounded-lg bg-zinc-800/60 border border-zinc-700/50">
                        <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
                          <Bot className="h-3 w-3" /> Sugestão de resposta
                        </p>
                        <p className="text-xs text-zinc-300">{suggestion.suggestedText}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {!comment.intent && (
                      <button
                        onClick={() => processSuggestion.mutate({ commentId: comment.id })}
                        disabled={processSuggestion.isLoading}
                        className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-indigo-900/60 text-indigo-300 hover:bg-indigo-800 transition-colors disabled:opacity-50"
                      >
                        <Bot className="h-3 w-3" />
                        Analisar
                      </button>
                    )}
                    <button
                      onClick={() => markSpam.mutate({ id: comment.id })}
                      className="text-xs px-2 py-1 rounded-lg bg-zinc-800 text-zinc-500 hover:bg-zinc-700 transition-colors"
                    >
                      Spam
                    </button>
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
