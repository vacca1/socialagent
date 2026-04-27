"use client";

import React, { useState } from "react";
import { Users, Bot, ShieldAlert, Plus, MessageCircle, Heart, Star, Activity, Settings2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MilitancyPage() {
  const [showModal, setShowModal] = useState(false);

  const BOTS = [
    { id: 1, name: "Dona Maria - Saúde", type: "Defensora Fiel", status: "Ativa", avatar: "👵", traits: ["Mãe", "Foco no SUS", "Emocional"], interactions: 1420 },
    { id: 2, name: "Lucas Empreendedor", type: "Apoiador Técnico", status: "Ativa", avatar: "👨‍💻", traits: ["Liberal", "Impostos", "Racional"], interactions: 850 },
    { id: 3, name: "Professor Silva", type: "Educador", status: "Ativa", avatar: "👨‍🏫", traits: ["Didático", "Escolas", "Longo texto"], interactions: 620 },
    { id: 4, name: "Jovem Universitária", type: "Engajamento", status: "Pausada", avatar: "👩‍🎓", traits: ["Gírias", "TikTok", "Agressiva na defesa"], interactions: 120 },
  ];

  return (
    <div className="space-y-6 animate-fade-in relative z-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
            <div className="p-2 rounded-xl liquid-glass glow-emerald">
              <Users className="h-6 w-6 text-emerald-500" />
            </div>
            Exército Agêntico
          </h1>
          <p className="text-muted-foreground text-sm mt-2 font-medium">
            Crie personas autônomas baseadas em IA para defender narrativas e engajar a audiência.
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 btn-liquid rounded-full text-sm font-bold shadow-lg"
        >
          <Plus className="h-4 w-4" />
          Nova Persona
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="liquid-panel p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Exército Ativo</span>
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <p className="text-3xl font-black text-foreground">24</p>
        </div>
        <div className="liquid-panel p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Interações Hoje</span>
            <MessageCircle className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-3xl font-black text-foreground">3.010</p>
        </div>
        <div className="liquid-panel p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Defesas de Crise</span>
            <ShieldAlert className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-3xl font-black text-foreground">45</p>
        </div>
        <div className="liquid-panel p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Engajamento Extra</span>
            <Heart className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-foreground">+15%</p>
        </div>
      </div>

      {/* Bots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {BOTS.map((bot) => (
          <div key={bot.id} className="liquid-panel p-5 relative group">
            {/* Efeito Glow no hover */}
            <div className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" 
                 style={{ boxShadow: 'inset 0 0 20px var(--glow-violet)' }} />
            
            <div className="flex justify-between items-start mb-5 relative z-10">
              <div className="w-16 h-16 rounded-2xl liquid-glass flex items-center justify-center text-3xl shadow-inner">
                {bot.avatar}
              </div>
              <div className={cn(
                "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                bot.status === 'Ativa' 
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                  : 'bg-foreground/5 text-muted-foreground border-border'
              )}>
                {bot.status}
              </div>
            </div>
            
            <div className="relative z-10">
              <h3 className="font-bold text-lg text-foreground leading-tight mb-1">{bot.name}</h3>
              <p className="text-xs font-medium text-primary mb-4">{bot.type}</p>
              
              <div className="flex flex-wrap gap-1.5 mb-6">
                {bot.traits.map((trait, i) => (
                  <span key={i} className="bg-foreground/5 border border-border text-foreground px-2 py-1 rounded-md text-[10px] font-bold">
                    {trait}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                  <Activity className="w-3.5 h-3.5 text-primary" />
                  {bot.interactions} ops
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-muted-foreground hover:text-primary transition-colors bg-foreground/5 rounded-lg hover:bg-primary/10">
                    <Settings2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Criar Persona */}
      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowModal(false)}>
          <div className="liquid-glass rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-border/50" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border/50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
                  <Star className="w-5 h-5" />
                </div>
                Forjar Nova Persona
              </h2>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Identidade</label>
                <div className="flex gap-3">
                  <input type="text" placeholder="Ex: Seu João do Táxi" className="flex-1 input-liquid rounded-xl px-4 py-3 text-sm font-medium" />
                  <input type="text" placeholder="🚕" className="w-16 input-liquid rounded-xl px-4 py-3 text-center text-xl" />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Matriz de Comportamento</label>
                <select className="w-full input-liquid rounded-xl px-4 py-3 text-sm font-medium">
                  <option>Defensor Fiel (Lealdade Incondicional)</option>
                  <option>Atacante (Foco na Oposição)</option>
                  <option>Especialista (Dados e Fatos)</option>
                  <option>Eleitor Comum (Orgânico e Emocional)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Prompt de Consciência</label>
                <textarea 
                  rows={4}
                  placeholder="Instrua a IA sobre como essa persona enxerga o mundo, quais gírias usa e o que ela defende..."
                  className="w-full input-liquid rounded-xl px-4 py-3 text-sm font-medium resize-none"
                ></textarea>
              </div>
            </div>
            <div className="p-6 bg-foreground/5 border-t border-border/50 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-foreground hover:bg-foreground/10 transition-colors">Cancelar</button>
              <button onClick={() => setShowModal(false)} className="px-6 py-2.5 rounded-xl text-sm font-bold btn-liquid">Ativar Consciência</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
