"use client";

import React, { useState } from "react";
import { Users, Bot, ShieldAlert, Plus, MessageCircle, Heart, Star, Activity, Settings2, Trash2 } from "lucide-react";

export default function MilitancyPage() {
  const [showModal, setShowModal] = useState(false);

  const BOTS = [
    { id: 1, name: "Dona Maria - Saúde", type: "Defensora Fiel", status: "Ativa", avatar: "👵", traits: ["Mãe", "Foco no SUS", "Emocional"], interactions: 1420 },
    { id: 2, name: "Lucas Empreendedor", type: "Apoiador Técnico", status: "Ativa", avatar: "👨‍💻", traits: ["Liberal", "Impostos", "Racional"], interactions: 850 },
    { id: 3, name: "Professor Silva", type: "Educador", status: "Ativa", avatar: "👨‍🏫", traits: ["Didático", "Escolas", "Longo texto"], interactions: 620 },
    { id: 4, name: "Jovem Universitária", type: "Engajamento", status: "Pausada", avatar: "👩‍🎓", traits: ["Gírias", "TikTok", "Agressiva na defesa"], interactions: 120 },
  ];

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-500" />
            Militância Agêntica (Bots Fãs)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Crie personas autônomas baseadas em IA para defender a narrativa e engajar nas postagens.
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Criar Nova Persona
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Exército Ativo</span>
            <Bot className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-800">24 Bots</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Interações Hoje</span>
            <MessageCircle className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-800">3.010</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Defesas de Crise</span>
            <ShieldAlert className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-2xl font-black text-slate-800">45</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Engajamento Positivo</span>
            <Heart className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-black text-slate-800">+15%</p>
        </div>
      </div>

      {/* Bots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {BOTS.map((bot) => (
          <div key={bot.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                {bot.avatar}
              </div>
              <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${bot.status === 'Ativa' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                {bot.status}
              </div>
            </div>
            
            <h3 className="font-bold text-lg text-slate-900 leading-tight mb-1">{bot.name}</h3>
            <p className="text-xs font-medium text-slate-500 mb-4">{bot.type}</p>
            
            <div className="flex flex-wrap gap-1.5 mb-5">
              {bot.traits.map((trait, i) => (
                <span key={i} className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-[10px] font-semibold">
                  {trait}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                <Activity className="w-3.5 h-3.5 text-brand-500" />
                {bot.interactions} interações
              </div>
              <div className="flex gap-2">
                <button className="p-1.5 text-slate-400 hover:text-brand-500 transition-colors bg-slate-50 rounded-md hover:bg-brand-50">
                  <Settings2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Criar Persona */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Criar Nova Persona
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Nome e Avatar</label>
                <div className="flex gap-3">
                  <input type="text" placeholder="Ex: Seu João do Táxi" className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500 bg-slate-50 focus:bg-white transition-colors" />
                  <input type="text" placeholder="🚕" className="w-16 border border-slate-200 rounded-xl px-4 py-2.5 text-center text-lg outline-none focus:border-emerald-500 bg-slate-50 focus:bg-white transition-colors" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Personalidade Base</label>
                <select className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-emerald-500 bg-slate-50 focus:bg-white transition-colors">
                  <option>Defensor Fiel (Sempre defende a gestão)</option>
                  <option>Crítico do Adversário (Foca em atacar a oposição)</option>
                  <option>Especialista (Focado em Infraestrutura/Saúde)</option>
                  <option>Eleitor Comum (Usa gírias, linguagem simples)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Instrução Agêntica (Prompt)</label>
                <textarea 
                  rows={3}
                  placeholder="Como o bot deve se comportar? Ex: 'Seja sempre otimista, use emojis de carro, elogie a pavimentação'."
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 bg-slate-50 focus:bg-white transition-colors resize-none"
                ></textarea>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors">Cancelar</button>
              <button onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-sm">Ativar Persona</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
