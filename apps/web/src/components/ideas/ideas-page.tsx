"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/provider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Lightbulb, Plus, Sparkles, Filter, Search,
  BookOpen, Star, ArrowRight, Loader2, CheckCircle2, X,
  Target, Mic, Users, Zap, FileText, Hash, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const FORMAT_LABELS: Record<string, string> = {
  REEL: "🎬 Reel",
  CAROUSEL: "📊 Carrossel",
  SINGLE_IMAGE: "🖼️ Imagem",
  VIDEO: "📹 Vídeo",
  STORY: "⚡ Story",
  TEXT_POST: "📝 Texto",
};

const FORMAT_ROUTES: Record<string, string> = {
  REEL: "/pipeline",
  CAROUSEL: "/carousels",
  SINGLE_IMAGE: "/pipeline",
  VIDEO: "/pipeline",
  STORY: "/pipeline",
  TEXT_POST: "/pipeline",
};

const STATUS_LABELS: Record<string, string> = {
  IDEA: "Ideia",
  BRIEFING: "Briefing",
  IN_PRODUCTION: "Produção",
  APPROVED: "Aprovado",
};

const STATUS_COLORS: Record<string, string> = {
  IDEA: "bg-zinc-700/50 text-zinc-300",
  BRIEFING: "bg-blue-500/20 text-blue-400",
  IN_PRODUCTION: "bg-yellow-500/20 text-yellow-400",
  APPROVED: "bg-green-500/20 text-green-400",
};

// ── Briefing Modal ──────────────────────────────────────────────────────────

function BriefingModal({ brief, onClose }: { brief: any; onClose: () => void }) {
  if (!brief) return null;

  const sections = [
    { icon: Target, label: "Objetivo", value: brief.objective },
    { icon: Mic, label: "Hook de abertura", value: brief.hook },
    { icon: FileText, label: "Estrutura narrativa", value: brief.narrativeStructure },
    { icon: Zap, label: "Promessa principal", value: brief.mainPromise },
    { icon: Users, label: "Público-alvo", value: brief.targetAudience },
    { icon: Hash, label: "Tom de voz", value: brief.toneOfVoice },
    { icon: ArrowRight, label: "CTA", value: brief.cta },
    { icon: AlertCircle, label: "Notas importantes", value: brief.notes },
  ].filter((s) => s.value);

  const versions = (() => {
    try { return typeof brief.versions === "string" ? JSON.parse(brief.versions) : brief.versions; }
    catch { return null; }
  })();

  const assets = (() => {
    try { return typeof brief.requiredAssets === "string" ? JSON.parse(brief.requiredAssets) : brief.requiredAssets; }
    catch { return null; }
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-xl h-full bg-zinc-900 border-l border-zinc-800 overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-brand-500" />
              <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">Briefing Editorial</span>
            </div>
            <h2 className="text-base font-bold text-white leading-snug">{brief.title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Seções principais */}
          {sections.map(({ icon: Icon, label, value }) => (
            <div key={label} className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">{label}</span>
              </div>
              <p className="text-sm text-zinc-200 leading-relaxed pl-5">{value}</p>
            </div>
          ))}

          {/* Versões de ângulo */}
          {versions && Array.isArray(versions) && versions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Ângulos alternativos</span>
              </div>
              <div className="space-y-2 pl-5">
                {versions.map((v: any, i: number) => (
                  <div key={i} className="bg-zinc-800/60 rounded-lg p-3 border border-zinc-700/50">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-brand-400">{v.type ?? `Versão ${i + 1}`}</span>
                    </div>
                    {v.hook && <p className="text-xs text-zinc-300 italic">"{v.hook}"</p>}
                    {v.didactic && <p className="text-xs text-zinc-400 mt-1">{v.didactic}</p>}
                    {v.authority && <p className="text-xs text-zinc-400 mt-1">{v.authority}</p>}
                    {v.minimalist && <p className="text-xs text-zinc-400 mt-1">{v.minimalist}</p>}
                    {v.provocative && <p className="text-xs text-zinc-400 mt-1">{v.provocative}</p>}
                    {typeof v === "string" && <p className="text-xs text-zinc-300">{v}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assets necessários */}
          {assets && Array.isArray(assets) && assets.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Assets necessários</span>
              </div>
              <ul className="pl-5 space-y-1">
                {assets.map((a: string, i: number) => (
                  <li key={i} className="text-xs text-zinc-300 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-brand-500 flex-shrink-0" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Score de risco */}
          {brief.redundancyRisk > 0 && (
            <div className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-yellow-300">Risco de redundância</p>
                <p className="text-xs text-yellow-400/70">Score {brief.redundancyRisk}/10 — verifique conteúdos similares no backlog</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export function IdeasPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showGenerator, setShowGenerator] = useState(false);
  const [genTopic, setGenTopic] = useState("");
  const [genCount, setGenCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [activeBrief, setActiveBrief] = useState<any>(null);
  const [briefingIdeaId, setBriefingIdeaId] = useState<string | null>(null);

  const { data, isLoading, refetch } = trpc.ideas.list.useQuery({
    search: search || undefined,
    pageSize: 24,
  });

  const generateMutation = trpc.ideas.generate.useMutation({
    onSuccess: (result) => {
      toast.success(`${result.ideas.length} ideias geradas!`);
      refetch();
      setShowGenerator(false);
      setGenTopic("");
      setGenerating(false);
    },
    onError: (err) => { toast.error(err.message); setGenerating(false); },
  });

  const freezeMutation = trpc.ideas.freeze.useMutation({
    onSuccess: () => { toast.success("Ideia aprovada! ✅"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const briefMutation = trpc.ideas.generateBrief.useMutation({
    onSuccess: (result) => {
      setActiveBrief(result?.brief ?? result);
      setBriefingIdeaId(null);
      refetch();
    },
    onError: (err) => {
      setBriefingIdeaId(null);
      toast.error(`Erro no briefing: ${err.message}`);
    },
  });

  function handleGenerate() {
    if (!genTopic.trim()) { toast.error("Informe um tema"); return; }
    setGenerating(true);
    generateMutation.mutate({ topic: genTopic, count: genCount });
  }

  function handleBrief(idea: any) {
    setBriefingIdeaId(idea.id);
    briefMutation.mutate({ ideaId: idea.id });
  }

  function handleProduzir(idea: any) {
    const route = FORMAT_ROUTES[idea.format] ?? "/pipeline";
    toast.success(`Abrindo ${route === "/carousels" ? "Carrosséis" : "Pipeline"} para produção...`);
    router.push(route);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Briefing Panel */}
      {activeBrief && (
        <BriefingModal brief={activeBrief} onClose={() => setActiveBrief(null)} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ideias de Conteúdo</h1>
          <p className="text-muted-foreground text-sm mt-1">{data?.total ?? 0} ideias no backlog</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowGenerator(!showGenerator)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors shadow-sm shadow-brand-500/20"
          >
            <Sparkles className="w-4 h-4" />
            Gerar com IA
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm transition-colors">
            <Plus className="w-4 h-4" />
            Manual
          </button>
        </div>
      </div>

      {/* Gerador */}
      {showGenerator && (
        <div className="bg-card border border-brand-500/30 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <h3 className="font-semibold text-sm text-foreground">Gerar Ideias com IA</h3>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={genTopic}
              onChange={(e) => setGenTopic(e.target.value)}
              placeholder="Ex: 'ChatGPT para iniciantes', 'automação com n8n'..."
              className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            />
            <select
              value={genCount}
              onChange={(e) => setGenCount(Number(e.target.value))}
              className="px-3 py-2 text-sm bg-background border border-border rounded-lg"
            >
              {[3, 5, 8, 10].map((n) => <option key={n} value={n}>{n} ideias</option>)}
            </select>
            <button
              onClick={handleGenerate}
              disabled={generating || !genTopic.trim()}
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? "Gerando..." : "Gerar"}
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">💡 Powered by Claude Sonnet</p>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar ideias..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Filter className="w-4 h-4" />
          Filtrar
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 h-48 animate-pulse" />
          ))}
        </div>
      ) : !data?.items.length ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Lightbulb className="w-12 h-12 mb-3 opacity-20" />
          <p className="font-medium">Nenhuma ideia ainda</p>
          <p className="text-sm mt-1">Use o gerador de IA para criar suas primeiras ideias</p>
          <button
            onClick={() => setShowGenerator(true)}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-brand-500 text-white text-sm rounded-lg hover:bg-brand-600"
          >
            <Sparkles className="w-4 h-4" />
            Gerar com IA
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.items.map((idea: any) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onFreeze={() => freezeMutation.mutate({ id: idea.id })}
              onBrief={() => handleBrief(idea)}
              onProduzir={() => handleProduzir(idea)}
              isLoadingBrief={briefingIdeaId === idea.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Idea Card ───────────────────────────────────────────────────────────────

function IdeaCard({
  idea, onFreeze, onBrief, onProduzir, isLoadingBrief,
}: {
  idea: any;
  onFreeze: () => void;
  onBrief: () => void;
  onProduzir: () => void;
  isLoadingBrief: boolean;
}) {
  const overallScore = (
    (idea.viralPotentialScore + idea.authorityScore + idea.clarityScore) / 3
  ).toFixed(1);

  const scoreNum = parseFloat(overallScore);
  const scoreColor = scoreNum >= 8.5 ? "#10b981" : scoreNum >= 7 ? "#f59e0b" : "#6366f1";

  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:shadow-lg hover:border-brand-500/30 transition-all group cursor-default">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-semibold text-foreground leading-snug flex-1 line-clamp-2">{idea.title}</h3>
        <div
          className="flex items-center gap-1 flex-shrink-0 px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${scoreColor}20` }}
        >
          <Star className="w-3 h-3 fill-current" style={{ color: scoreColor }} />
          <span className="text-xs font-bold" style={{ color: scoreColor }}>{overallScore}</span>
        </div>
      </div>

      {/* Hook */}
      {idea.hook && (
        <p className="text-[12px] text-muted-foreground italic mb-3 line-clamp-2">"{idea.hook}"</p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {idea.format && (
          <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-medium">
            {FORMAT_LABELS[idea.format] ?? idea.format}
          </span>
        )}
        <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", STATUS_COLORS[idea.status] ?? "bg-muted text-muted-foreground")}>
          {STATUS_LABELS[idea.status] ?? idea.status}
        </span>
      </div>

      {/* Score bars */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <ScoreBar label="Viral" score={idea.viralPotentialScore} color="#ef4444" />
        <ScoreBar label="Autor." score={idea.authorityScore} color="#6366f1" />
        <ScoreBar label="Clareza" score={idea.clarityScore} color="#10b981" />
      </div>

      {/* Actions */}
      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity pt-1 border-t border-border/50">
        {!idea.frozenAt && (
          <button
            onClick={onFreeze}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] border border-border rounded-md hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-400 transition-all font-medium"
          >
            <CheckCircle2 className="w-3 h-3" />
            Aprovar
          </button>
        )}
        <button
          onClick={onBrief}
          disabled={isLoadingBrief}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] border border-border rounded-md hover:bg-brand-500/10 hover:border-brand-500/30 hover:text-brand-400 transition-all disabled:opacity-50 font-medium"
        >
          {isLoadingBrief ? <Loader2 className="w-3 h-3 animate-spin" /> : <BookOpen className="w-3 h-3" />}
          {isLoadingBrief ? "Gerando..." : "Briefing"}
        </button>
        <button
          onClick={onProduzir}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 text-[11px] bg-brand-500/10 border border-brand-500/30 text-brand-400 rounded-md hover:bg-brand-500 hover:text-white transition-all font-medium"
        >
          <ArrowRight className="w-3 h-3" />
          Produzir
        </button>
      </div>
    </div>
  );
}

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  const pct = Math.min((score / 10) * 100, 100);
  return (
    <div>
      <div className="flex justify-between mb-0.5">
        <span className="text-[9px] text-muted-foreground">{label}</span>
        <span className="text-[9px] font-bold" style={{ color }}>{score.toFixed(1)}</span>
      </div>
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
