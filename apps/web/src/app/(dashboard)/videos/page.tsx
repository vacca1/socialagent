"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload,
  Video,
  Play,
  Trash2,
  Copy,
  CheckCircle2,
  Film,
  Clock,
  HardDrive,
  Plus,
  Search,
  Send,
} from "lucide-react";

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface VideoFile {
  filename: string;
  originalName: string;
  url: string;
  size: number;
  createdAt: string;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<VideoFile | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadVideos = useCallback(async () => {
    const res = await fetch("/api/videos/list");
    const data = await res.json();
    setVideos(data.videos || []);
  }, []);

  useEffect(() => {
    loadVideos();
  }, [loadVideos]);

  async function uploadFile(file: File) {
    setUploading(true);
    setUploadProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const interval = setInterval(() => {
      setUploadProgress((p) => Math.min(p + 8, 90));
    }, 200);

    try {
      const res = await fetch("/api/videos/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      clearInterval(interval);
      if (data.success) {
        setUploadProgress(100);
        setTimeout(() => {
          setUploading(false);
          setUploadProgress(0);
          loadVideos();
        }, 600);
      } else {
        setError(data.error || "Erro no upload");
        setUploading(false);
      }
    } catch {
      clearInterval(interval);
      setError("Erro de conexão ao fazer upload");
      setUploading(false);
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file) {
      uploadFile(file);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function deleteVideo(filename: string) {
    if (!confirm("Remover este vídeo?")) return;
    setVideos((prev) => prev.filter((v) => v.filename !== filename));
    if (preview?.filename === filename) setPreview(null);
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(`${window.location.origin}${url}`);
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  }

  const filtered = videos.filter((v) =>
    v.originalName.toLowerCase().includes(search.toLowerCase())
  );

  const totalSize = videos.reduce((s, v) => s + v.size, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0d0d14] px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600">
              <Film className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Meus Vídeos</h1>
              <p className="text-sm text-white/50">
                {videos.length} vídeo{videos.length !== 1 ? "s" : ""} · {formatSize(totalSize)} usados
              </p>
            </div>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Enviar Vídeo
          </button>
        </div>

        {/* Stats */}
        <div className="mt-5 flex gap-4">
          {[
            { icon: Film, label: "Total", value: `${videos.length} vídeos` },
            { icon: HardDrive, label: "Armazenamento", value: formatSize(totalSize) },
            { icon: Clock, label: "Último upload", value: videos[0] ? formatDate(videos[0].createdAt) : "—" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-2.5 rounded-xl bg-white/5 px-4 py-2.5">
              <Icon className="h-4 w-4 text-violet-400" />
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/40">{label}</p>
                <p className="text-sm font-semibold text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-6 p-8">
        {/* Coluna principal */}
        <div className="min-w-0 flex-1">
          {/* Upload area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`relative mb-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed py-14 transition-all ${
              dragging
                ? "border-violet-400 bg-violet-600/10 scale-[1.01]"
                : "border-white/15 bg-white/3 hover:border-violet-500/50 hover:bg-violet-600/5"
            } ${uploading ? "pointer-events-none" : ""}`}
          >
            {uploading ? (
              <div className="flex w-72 flex-col items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-600/20">
                  <Upload className="h-7 w-7 animate-bounce text-violet-400" />
                </div>
                <p className="text-sm font-medium text-white">Enviando vídeo...</p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-600 to-purple-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-white/40">{uploadProgress}%</p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-600/15">
                  <Upload className="h-8 w-8 text-violet-400" />
                </div>
                <p className="mb-1 text-base font-semibold text-white">
                  {dragging ? "Solte o vídeo aqui" : "Clique ou arraste um vídeo"}
                </p>
                <p className="text-sm text-white/40">MP4, MOV, AVI, WebM · Máximo 500MB</p>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/mov,video/quicktime,video/avi,video/webm"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Busca */}
          {videos.length > 0 && (
            <div className="relative mb-5">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar vídeos..."
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:border-violet-500/50 focus:outline-none"
              />
            </div>
          )}

          {/* Grid de vídeos */}
          {filtered.length === 0 && videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Video className="mb-4 h-12 w-12 text-white/20" />
              <p className="text-sm text-white/40">
                Nenhum vídeo ainda.
                <br />
                Faça upload para começar.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-white/40">
              Nenhum vídeo encontrado para &quot;{search}&quot;
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {filtered.map((video) => (
                <div
                  key={video.filename}
                  className={`group relative overflow-hidden rounded-2xl border bg-white/5 transition-all hover:border-violet-500/40 ${
                    preview?.filename === video.filename
                      ? "border-violet-500"
                      : "border-white/10"
                  }`}
                >
                  {/* Thumbnail */}
                  <div
                    className="relative aspect-video cursor-pointer overflow-hidden bg-black"
                    onClick={() =>
                      setPreview(preview?.filename === video.filename ? null : video)
                    }
                  >
                    <video
                      src={video.url}
                      className="h-full w-full object-cover opacity-80"
                      muted
                      preload="metadata"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                        <Play className="ml-0.5 h-5 w-5 fill-white text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p
                      className="mb-1 truncate text-sm font-medium text-white"
                      title={video.originalName}
                    >
                      {video.originalName}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-white/40">{formatSize(video.size)}</p>
                      <p className="text-xs text-white/30">{formatDate(video.createdAt)}</p>
                    </div>

                    {/* Ações */}
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => copyUrl(video.url)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/8 py-1.5 text-xs font-medium text-white/70 transition hover:bg-violet-600/30 hover:text-violet-300"
                      >
                        {copied === video.url ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            Copiar link
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setPreview(video)}
                        className="flex items-center justify-center gap-1.5 rounded-lg bg-violet-600/20 px-3 py-1.5 text-xs font-medium text-violet-300 transition hover:bg-violet-600/40"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Usar
                      </button>
                      <button
                        onClick={() => deleteVideo(video.filename)}
                        className="flex items-center justify-center rounded-lg bg-white/5 px-2 py-1.5 text-xs text-white/30 transition hover:bg-red-500/20 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview lateral */}
        {preview && (
          <div className="w-80 shrink-0">
            <div className="sticky top-6 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <video
                src={preview.url}
                controls
                autoPlay
                className="aspect-video w-full bg-black"
              />
              <div className="p-4">
                <p className="mb-1 truncate font-semibold text-white">{preview.originalName}</p>
                <p className="mb-4 text-xs text-white/40">
                  {formatSize(preview.size)} · {formatDate(preview.createdAt)}
                </p>

                <div className="space-y-2">
                  <button
                    onClick={() => copyUrl(preview.url)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500"
                  >
                    {copied === preview.url ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" /> Link copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" /> Copiar link do vídeo
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setPreview(null)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/8 py-2.5 text-sm text-white/60 transition hover:bg-white/12"
                  >
                    Fechar preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
