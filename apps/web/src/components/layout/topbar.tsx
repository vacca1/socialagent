"use client";

import { Bell, Search, LogOut, User, Plus } from "lucide-react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TopbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

// ─── Page label map ───────────────────────────────────────────────────────────

const PAGE_LABELS: Record<string, string> = {
  "/dashboard":       "Dashboard",
  "/ideas":           "Ideias",
  "/trends":          "Tendências",
  "/calendar":        "Calendário",
  "/pipeline":        "Pipeline",
  "/carousels":       "Carrosséis",
  "/videos":          "Vídeos",
  "/assets":          "Assets",
  "/publications":    "Publicações",
  "/comments":        "Comentários",
  "/analytics":       "Analytics",
  "/reference-radar": "Radar de Refs",
  "/agency/agents":   "Agentes IA",
  "/agency/approvals":"Aprovações",
  "/settings":        "Configurações",
};

function getPageLabel(pathname: string): string {
  for (const [key, label] of Object.entries(PAGE_LABELS)) {
    if (pathname === key || pathname.startsWith(key + "/")) {
      return label;
    }
  }
  return "POSTADOR";
}

// ─── Clock component ──────────────────────────────────────────────────────────

function LiveClock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null;

  return (
    <span className="text-xs font-mono text-zinc-600 tabular-nums select-none">
      {time}
    </span>
  );
}

// ─── Avatar component ─────────────────────────────────────────────────────────

function UserAvatar({ user }: { user: TopbarProps["user"] }) {
  if (user.image) {
    return (
      <img
        src={user.image}
        alt={user.name ?? "Avatar"}
        className="w-8 h-8 rounded-full object-cover ring-1 ring-violet-500/30"
      />
    );
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "P";

  return (
    <div
      className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white flex-shrink-0"
      style={{
        background: "linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)",
        boxShadow: "0 0 12px rgba(124,58,237,0.35)",
      }}
    >
      {initials}
    </div>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

export function Topbar({ user }: TopbarProps) {
  const pathname = usePathname();
  const pageLabel = getPageLabel(pathname);

  return (
    <header
      className={cn(
        "h-14 flex items-center justify-between px-6 flex-shrink-0 z-10",
        "border-b border-zinc-900"
      )}
      style={{
        background: "rgba(8, 8, 15, 0.85)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
      }}
    >
      {/* ── Esquerda: breadcrumb + busca ─────────── */}
      <div className="flex items-center gap-5">
        {/* Breadcrumb */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs text-zinc-600 font-medium">POSTADOR</span>
          <ChevronMicro />
          <span className="text-xs text-zinc-300 font-semibold">{pageLabel}</span>
        </div>

        {/* Divisor vertical */}
        <div className="hidden sm:block w-px h-4 bg-zinc-800" />

        {/* Search */}
        <div className="relative w-56 lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar ideias, posts, assets..."
            className={cn(
              "w-full pl-9 pr-12 py-1.5 text-xs rounded-lg",
              "text-zinc-300 placeholder:text-zinc-600",
              "input-premium",
              "transition-all duration-200"
            )}
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-600 font-mono hidden sm:block select-none">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* ── Direita: ações + usuário ──────────────── */}
      <div className="flex items-center gap-3">
        {/* Relógio */}
        <LiveClock />

        {/* Divisor */}
        <div className="w-px h-4 bg-zinc-800" />

        {/* Botão Nova Ideia */}
        <button
          className={cn(
            "hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white",
            "btn-violet transition-all duration-200"
          )}
        >
          <Plus className="w-3.5 h-3.5" />
          Nova Ideia
        </button>

        {/* Notificações */}
        <button className="relative p-2 rounded-lg hover:bg-white/[0.04] transition-colors group">
          <Bell className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
            style={{
              background: "#7c3aed",
              boxShadow: "0 0 6px rgba(124,58,237,0.8)",
            }}
          />
        </button>

        {/* Divisor */}
        <div className="w-px h-4 bg-zinc-800" />

        {/* Usuário */}
        <div className="flex items-center gap-2.5">
          <div className="text-right hidden md:block">
            <p className="text-xs font-semibold text-zinc-200 leading-tight">
              {user.name ?? "Admin"}
            </p>
            <p className="text-[10px] text-zinc-600 leading-tight">{user.email}</p>
          </div>

          <UserAvatar user={user} />

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-2 rounded-lg hover:bg-red-500/10 transition-colors group"
            title="Sair"
          >
            <LogOut className="w-3.5 h-3.5 text-zinc-600 group-hover:text-red-400 transition-colors" />
          </button>
        </div>
      </div>
    </header>
  );
}

// ─── Micro chevron ─────────────────────────────────────────────────────────────

function ChevronMicro() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      className="text-zinc-700"
    >
      <path
        d="M3.5 2L6.5 5L3.5 8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
