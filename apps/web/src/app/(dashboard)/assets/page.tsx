"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { FolderOpen, Image, Video, Music, Search, Heart, Trash2, Plus } from "lucide-react";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-zinc-800 ${className ?? ""}`} />;
}

const TYPE_OPTIONS = [
  { label: "Todos", value: "" },
  { label: "Imagem", value: "image" },
  { label: "Vídeo", value: "video" },
  { label: "Áudio", value: "audio" },
];

function AssetTypeIcon({ type }: { type: string }) {
  if (type?.startsWith("video")) return <Video className="h-8 w-8 text-blue-400" />;
  if (type?.startsWith("audio")) return <Music className="h-8 w-8 text-purple-400" />;
  return <Image className="h-8 w-8 text-zinc-400" />;
}

export default function AssetsPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const { data, isLoading, refetch } = trpc.assets.list.useQuery({
    search: search || undefined,
    type: typeFilter || undefined,
    page: 1,
    pageSize: 24,
  });

  const toggleFavorite = trpc.assets.toggleFavorite.useMutation({
    onSuccess: () => refetch(),
  });

  const deleteAsset = trpc.assets.delete.useMutation({
    onSuccess: () => refetch(),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <FolderOpen className="h-6 w-6 text-indigo-400" />
            Biblioteca de Assets
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Gerencie suas imagens, vídeos e áudios</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="h-4 w-4" />
          Upload
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar assets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex gap-2">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTypeFilter(opt.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === opt.value
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <FolderOpen className="h-14 w-14 mb-4 opacity-30" />
          <p className="text-base font-medium text-zinc-400">Nenhum asset encontrado</p>
          <p className="text-sm mt-1">Faça upload de imagens, vídeos ou áudios para começar</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-zinc-500">{data.total} assets encontrados</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {data.items.map((asset) => (
              <div
                key={asset.id}
                className="group relative aspect-square rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 hover:border-zinc-600 transition-all"
              >
                {asset.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <AssetTypeIcon type={asset.type} />
                  </div>
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-zinc-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => toggleFavorite.mutate({ id: asset.id })}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                    >
                      <Heart
                        className={`h-3.5 w-3.5 ${asset.isFavorite ? "fill-red-400 text-red-400" : "text-zinc-400"}`}
                      />
                    </button>
                    <button
                      onClick={() => deleteAsset.mutate({ id: asset.id })}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-900 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-zinc-400 hover:text-red-400" />
                    </button>
                  </div>
                  <p className="text-xs text-zinc-300 truncate">{asset.name}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
