"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Lightbulb,
  TrendingUp,
  Calendar,
  Kanban,
  Images,
  Video,
  FolderOpen,
  Send,
  MessageSquare,
  BarChart3,
  Radar,
  Bot,
  Settings,
  ChevronRight,
  Zap,
  Workflow,
  Users,
} from "lucide-react";

// ─── Navigation structure ────────────────────────────────────────────────────

interface NavItemConfig {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | null;
}

interface NavGroup {
  label: string | null;
  items: NavItemConfig[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [
      { label: "Dashboard",   href: "/dashboard",  icon: LayoutDashboard, badge: null },
      { label: "Ideias",      href: "/ideas",       icon: Lightbulb,       badge: null },
      { label: "Tendências",  href: "/trends",      icon: TrendingUp,      badge: "NOVO" },
      { label: "Calendário",  href: "/calendar",    icon: Calendar,        badge: null },
    ],
  },
  {
    label: "Criação",
    items: [
      { label: "Pipeline",    href: "/pipeline",    icon: Kanban,          badge: null },
      { label: "Carrosséis",  href: "/carousels",   icon: Images,          badge: null },
      { label: "Vídeos",      href: "/videos",      icon: Video,           badge: null },
      { label: "Assets",      href: "/assets",      icon: FolderOpen,      badge: null },
    ],
  },
  {
    label: "Engajamento",
    items: [
      { label: "Militância IA", href: "/fans",         icon: Users,          badge: "BOTS" },
      { label: "Comentários", href: "/comments",     icon: MessageSquare,  badge: null },
      { label: "Publicações", href: "/publications", icon: Send,           badge: null },
    ],
  },
  {
    label: "Sistema",
    items: [
      { label: "Sentimento",    href: "/sentiment",          icon: BarChart3,     badge: "IA" },
      { label: "Radar de Refs", href: "/reference-radar",    icon: Radar,         badge: null },
      { label: "Agentes IA",    href: "/agency/agents",      icon: Bot,           badge: null },
      { label: "OpenClaw",      href: "/openclaw",           icon: Workflow,      badge: "AUTO" },
      { label: "Aprovações",    href: "/agency/approvals",   icon: ChevronRight,  badge: null },
    ],
  },
];

// ─── NavItem component ────────────────────────────────────────────────────────

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  badge,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  badge?: string | null;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 py-2 rounded-lg text-sm transition-all duration-200 relative",
        "border-l-2 pl-[10px] pr-3",
        active
          ? "bg-violet-500/10 text-violet-300 border-violet-500"
          : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04] border-transparent"
      )}
    >
      {/* Ícone */}
      <Icon
        className={cn(
          "w-4 h-4 flex-shrink-0 transition-all duration-200",
          active
            ? "text-violet-400 drop-shadow-[0_0_6px_rgba(167,139,250,0.8)]"
            : "group-hover:text-zinc-300"
        )}
      />

      {/* Label */}
      <span className="flex-1 truncate font-medium">{label}</span>

      {/* Badge */}
      {badge && (
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400 font-bold tracking-wide border border-violet-500/20">
          {badge}
        </span>
      )}

      {/* Indicador ativo */}
      {active && (
        <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.9)] flex-shrink-0" />
      )}
    </Link>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 pt-5 pb-1.5">
      <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
        {label}
      </span>
      <div className="flex-1 h-px bg-zinc-800/60" />
    </div>
  );
}

// ─── Main Sidebar ─────────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-[#08080f] border-r border-zinc-900 flex-shrink-0 relative">
      {/* Glow ambiental no topo */}
      <div
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,58,237,0.12) 0%, transparent 70%)",
        }}
      />

      {/* ── Logo ─────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-zinc-900 relative z-10">
        <div
          className="relative flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0"
          style={{
            background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)",
            boxShadow: "0 0 16px rgba(124,58,237,0.5), 0 1px 0 0 rgba(255,255,255,0.1) inset",
          }}
        >
          <Zap className="w-4 h-4 text-white drop-shadow-sm" />
        </div>

        <div className="min-w-0">
          <span className="font-bold text-white text-sm tracking-wide">Social OS</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <p className="text-[10px] text-emerald-400 font-medium">IA Online</p>
          </div>
        </div>
      </div>

      {/* ── Navegação ────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 py-3 relative z-10">
        {NAV_GROUPS.map((group, groupIndex) => (
          <div key={groupIndex}>
            {/* Label de seção */}
            {group.label && <SectionLabel label={group.label} />}

            {/* Itens */}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={isActive(item.href)}
                  badge={item.badge}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Rodapé ───────────────────────────────── */}
      <div className="px-2 py-3 border-t border-zinc-900 relative z-10">
        <NavItem
          href="/settings"
          label="Configurações"
          icon={Settings}
          active={isActive("/settings")}
        />
      </div>
    </aside>
  );
}
