import type { Metadata } from "next";
import { LayoutTemplate, Plus, Sparkles, FileText, Layers, Video } from "lucide-react";

export const metadata: Metadata = { title: "Templates" };

const TEMPLATE_TYPES = [
  { label: "Carrossel", icon: <Layers className="h-5 w-5 text-indigo-400" />, description: "Templates de slides para carrosséis educativos, listas e storytelling" },
  { label: "Roteiro de Vídeo", icon: <Video className="h-5 w-5 text-blue-400" />, description: "Estruturas para Reels, shorts e vídeos de diferentes estilos" },
  { label: "Post de Texto", icon: <FileText className="h-5 w-5 text-emerald-400" />, description: "Estruturas de copy para posts e threads" },
  { label: "Briefing", icon: <Sparkles className="h-5 w-5 text-amber-400" />, description: "Templates de briefing editorial para diferentes formatos" },
];

const BUILT_IN_TEMPLATES = [
  { name: "Carrossel Educativo 8 Slides", type: "Carrossel", format: "CAROUSEL", description: "Hook forte + desenvolvimento didático + CTA", isPremium: false },
  { name: "Carrossel Lista Top 10", type: "Carrossel", format: "CAROUSEL", description: "Formato lista com contagem regressiva", isPremium: false },
  { name: "Reel Hook & Reveal", type: "Roteiro de Vídeo", format: "REEL", description: "Gancho nos primeiros 3 segundos + revelação", isPremium: false },
  { name: "Thread de Valor", type: "Post de Texto", format: "TEXT_POST", description: "Thread estruturada com múltiplos insights", isPremium: false },
  { name: "Carrossel Storytelling", type: "Carrossel", format: "CAROUSEL", description: "Estrutura narrativa com arco de transformação", isPremium: true },
  { name: "Vídeo Tutorial Passo a Passo", type: "Roteiro de Vídeo", format: "VIDEO", description: "Formato tutorial com demonstração e resultado", isPremium: true },
];

export default function TemplatesPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <LayoutTemplate className="h-6 w-6 text-indigo-400" />
            Templates
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Acelere a produção com templates prontos e personalizáveis</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="h-4 w-4" />
          Criar template
        </button>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {TEMPLATE_TYPES.map((type) => (
          <button
            key={type.label}
            className="text-left rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-600 hover:bg-zinc-800/50 transition-all group"
          >
            <div className="mb-3">{type.icon}</div>
            <h3 className="text-sm font-semibold text-zinc-200 mb-1 group-hover:text-white transition-colors">
              {type.label}
            </h3>
            <p className="text-xs text-zinc-500 line-clamp-2">{type.description}</p>
          </button>
        ))}
      </div>

      {/* Built-in templates */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-zinc-100">Templates disponíveis</h2>
          <span className="text-xs text-zinc-500">{BUILT_IN_TEMPLATES.length} templates</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BUILT_IN_TEMPLATES.map((template) => (
            <div
              key={template.name}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-700 transition-colors group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">{template.type}</span>
                {template.isPremium && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-300 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Premium
                  </span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-zinc-200 mb-1 group-hover:text-white transition-colors">
                {template.name}
              </h3>
              <p className="text-xs text-zinc-500 mb-4">{template.description}</p>
              <button className="w-full py-2 rounded-lg bg-zinc-800 hover:bg-indigo-600 text-zinc-400 hover:text-white text-xs font-medium transition-colors">
                Usar template
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Empty state for custom templates */}
      <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/50 p-8 text-center">
        <LayoutTemplate className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
        <h3 className="text-sm font-medium text-zinc-400 mb-1">Seus templates personalizados</h3>
        <p className="text-xs text-zinc-600 mb-4">Crie templates baseados nos seus melhores conteúdos</p>
        <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm font-medium transition-colors mx-auto">
          <Plus className="h-4 w-4" />
          Criar meu primeiro template
        </button>
      </div>
    </div>
  );
}
