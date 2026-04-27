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
  "/fans":            "Militância IA",
  "/sentiment":       "Sentimento",
  "/settings":        "Configurações",
  "/openclaw":        "OpenClaw",
};

function getPageLabel(pathname: string): string {
  for (const [key, label] of Object.entries(PAGE_LABELS)) {
    if (pathname === key || pathname.startsWith(key + "/")) {
      return label;
    }
  }
  return "Social OS";
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
    <span className="text-xs font-mono text-muted-foreground tabular-nums select-none">
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
        className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/30"
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
    : "S";

  return (
    <div
      className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold text-white flex-shrink-0 btn-liquid"
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
    <div className="p-4 z-40 sticky top-0">
      <header
        className={cn(
          "h-14 flex items-center justify-between px-6 flex-shrink-0 liquid-glass rounded-2xl animate-slide-up"
        )}
      >
        {/* ── Esquerda: breadcrumb + busca ─────────── */}
        <div className="flex items-center gap-5">
          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-bold tracking-wider uppercase">Social OS</span>
            <ChevronMicro />
            <span className="text-xs text-foreground font-black">{pageLabel}</span>
          </div>

          {/* Divisor vertical */}
          <div className="hidden sm:block w-px h-4 bg-border/80" />

          {/* Search */}
          <div className="relative w-56 lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar ideias, posts, assets..."
              className={cn(
                "w-full pl-9 pr-12 py-1.5 text-xs rounded-full",
                "text-foreground placeholder:text-muted-foreground",
                "input-liquid",
                "transition-all duration-200"
              )}
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-mono hidden sm:block select-none bg-background/50 px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* ── Direita: ações + usuário ──────────────── */}
        <div className="flex items-center gap-3">
          {/* Relógio */}
          <LiveClock />

          {/* Divisor */}
          <div className="w-px h-4 bg-border/80" />

          {/* Botão Nova Ideia */}
          <button
            className={cn(
              "hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white",
              "btn-liquid transition-all duration-200"
            )}
          >
            <Plus className="w-3.5 h-3.5" />
            Nova Ideia
          </button>

          {/* Notificações */}
          <button className="relative p-2 rounded-full hover:bg-foreground/5 transition-colors group">
            <Bell className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse-glow"
            />
          </button>

          {/* Divisor */}
          <div className="w-px h-4 bg-border/80" />

          {/* Usuário */}
          <div className="flex items-center gap-2.5">
            <div className="text-right hidden md:block">
              <p className="text-xs font-bold text-foreground leading-tight">
                {user.name ?? "Admin"}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium leading-tight">{user.email}</p>
            </div>

            <UserAvatar user={user} />

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-2 rounded-full hover:bg-red-500/10 transition-colors group"
              title="Sair"
            >
              <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-red-500 transition-colors" />
            </button>
          </div>
        </div>
      </header>
    </div>
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
      className="text-muted-foreground opacity-50"
    >
      <path
        d="M3.5 2L6.5 5L3.5 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
