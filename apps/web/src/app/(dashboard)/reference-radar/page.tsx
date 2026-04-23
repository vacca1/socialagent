"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Radar, Search, Plus, Instagram, Youtube, Twitter, Linkedin, Globe, Star } from "lucide-react";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-zinc-800 ${className ?? ""}`} />;
}

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  instagram: <Instagram className="h-4 w-4" />,
  youtube: <Youtube className="h-4 w-4" />,
  twitter_x: <Twitter className="h-4 w-4" />,
  linkedin: <Linkedin className="h-4 w-4" />,
  blog: <Globe className="h-4 w-4" />,
  newsletter: <Globe className="h-4 w-4" />,
  other: <Globe className="h-4 w-4" />,
};

const SOURCE_LABELS: Record<string, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  twitter_x: "Twitter/X",
  linkedin: "LinkedIn",
  blog: "Blog",
  newsletter: "Newsletter",
  rss: "RSS",
  other: "Outro",
};

function PriorityStars({ priority }: { priority: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < priority ? "fill-amber-400 text-amber-400" : "text-zinc-700"}`}
        />
      ))}
    </div>
  );
}

export default function ReferenceRadarPage() {
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("");

  const { data: profiles, isLoading } = trpc.referenceRadar.profiles.useQuery({
    search: search || undefined,
    sourceType: sourceFilter || undefined,
    isActive: true,
  });

  const { data: groups } = trpc.referenceRadar.groups.useQuery();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Radar className="h-6 w-6 text-indigo-400" />
            Reference Radar
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            {profiles ? `${profiles.length} perfis monitorados` : "Monitore referências e extraia oportunidades"}
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="h-4 w-4" />
          Adicionar Perfil
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar perfis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSourceFilter("")}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
              sourceFilter === "" ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            Todos
          </button>
          {Object.entries(SOURCE_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSourceFilter(sourceFilter === key ? "" : key)}
              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                sourceFilter === key ? "bg-indigo-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {SOURCE_ICONS[key]}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Groups summary */}
      {groups && groups.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {groups.map((g) => (
            <div
              key={g.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs"
              style={{ borderColor: g.color ?? "#3f3f46", color: g.color ?? "#a1a1aa" }}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: g.color ?? "#71717a" }} />
              {g.name}
              <span className="text-zinc-500">({g._count.profiles})</span>
            </div>
          ))}
        </div>
      )}

      {/* Profile list */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : !profiles || profiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <Radar className="h-14 w-14 mb-4 opacity-30" />
          <p className="text-base font-medium text-zinc-400">Nenhum perfil monitorado</p>
          <p className="text-sm mt-1">Adicione perfis de referência para extrair oportunidades de conteúdo</p>
          <button className="mt-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="h-4 w-4" />
            Adicionar primeiro perfil
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 text-zinc-400">
                  {SOURCE_ICONS[profile.sourceType] ?? <Globe className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-zinc-200 truncate">{profile.displayName}</h3>
                  <p className="text-xs text-zinc-500">@{profile.handle}</p>
                </div>
                {profile.group && (
                  <div
                    className="text-xs px-2 py-0.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: `${profile.group.color ?? "#3f3f46"}30`,
                      color: profile.group.color ?? "#a1a1aa",
                    }}
                  >
                    {profile.group.name}
                  </div>
                )}
              </div>

              {profile.niche && (
                <p className="text-xs text-zinc-500 mb-3 line-clamp-1">{profile.niche}</p>
              )}

              <div className="flex items-center justify-between">
                <PriorityStars priority={profile.priority} />
                <div className="flex gap-3 text-xs text-zinc-500">
                  <span>{profile._count.contentEntries} entradas</span>
                  <span>{profile._count.signals} sinais</span>
                  <span>{profile._count.opportunities} oport.</span>
                </div>
              </div>

              {profile.relevanceScore != null && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-zinc-600">Relevância</span>
                    <span className="text-zinc-400">{(profile.relevanceScore * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-1">
                    <div
                      className="h-1 rounded-full bg-indigo-500"
                      style={{ width: `${(profile.relevanceScore ?? 0) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
