"use client";

import React, { useState, useEffect } from "react";
import { Brain, MessageSquare, PenTool, TrendingUp, AlertTriangle, Activity, CheckCircle2, Users, Search, Loader2, Bot, ShieldAlert } from "lucide-react";

type Agent = {
  id: string;
  name: string;
  role: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  status: "idle" | "working" | "done";
  currentTask: string;
  progress: number;
};

const INITIAL_AGENTS: Agent[] = [
  {
    id: "estrategista",
    name: "Estrategista Chefe",
    role: "Direção de Campanha",
    icon: Brain,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    status: "working",
    currentTask: "Analisando debate da TV Opositora...",
    progress: 75,
  },
  {
    id: "crise",
    name: "Monitor de Crise",
    role: "Radar de Oposição",
    icon: ShieldAlert,
    color: "text-red-600",
    bgColor: "bg-red-100",
    status: "working",
    currentTask: "Varrendo WhatsApp e Twitter...",
    progress: 30,
  },
  {
    id: "redator",
    name: "Redator de Discursos",
    role: "Copywriter Político",
    icon: PenTool,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    status: "idle",
    currentTask: "Aguardando diretrizes de crise...",
    progress: 0,
  },
  {
    id: "social",
    name: "Orquestrador de Militância",
    role: "Engajamento",
    icon: MessageSquare,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
    status: "working",
    currentTask: "Distribuindo pauta positiva nos grupos...",
    progress: 90,
  },
];

const LOGS_MOCK = [
  "[Monitor de Crise] ALERTA: Pico de menções negativas no Twitter sobre 'Buracos na Via Expressa'.",
  "[Estrategista Chefe] Analisando impacto do alerta. Risco classificado como MÉDIO.",
  "[Estrategista Chefe] Solicitando resposta rápida focada em 'Obras já licitadas'.",
  "[Redator de Discursos] Gerando 3 opções de Reels para o Instagram.",
  "[Redator de Discursos] Roteiros finalizados e enviados para aprovação humana.",
  "[Orquestrador de Militância] Engajando defensores na publicação do Jornal Local.",
  "[Monitor de Crise] Sentimento da rede começou a normalizar (+12% positivo).",
];

export default function OpenClawScaleDashboard() {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [logs, setLogs] = useState<string[]>([]);

  // Simulate agent progress
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents((prev) =>
        prev.map((agent) => {
          if (agent.status === "working") {
            const nextProgress = agent.progress + Math.floor(Math.random() * 8) + 2;
            if (nextProgress >= 100) {
              return { ...agent, progress: 100, status: "done", currentTask: "Ação concluída e registrada." };
            }
            return { ...agent, progress: nextProgress };
          }
          if (agent.status === "done" && Math.random() > 0.7) {
             return { ...agent, status: "working", progress: 0, currentTask: "Iniciando nova varredura autônoma..." };
          }
          if (agent.status === "idle" && Math.random() > 0.8) {
            return { ...agent, status: "working", progress: 0, currentTask: "Recebendo input do Estrategista..." };
          }
          return agent;
        })
      );
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Simulate logs
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < LOGS_MOCK.length) {
        setLogs((prev) => [LOGS_MOCK[index] as string, ...prev]);
        index++;
      } else {
        index = 0;
      }
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-50 text-slate-800 font-sans rounded-3xl overflow-hidden shadow-2xl border border-slate-200/50">
      <div className="px-6 py-5 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-sm shadow-indigo-200/50">
            <Activity className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">War Room Digital <span className="font-light text-slate-500">Autônomo</span></h1>
            <p className="text-xs text-slate-500 font-medium">Bunker de Agentes Inteligentes operando em tempo real</p>
          </div>
        </div>
      </div>
      <main className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Agents Grid */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-500" />
              Esquadrão Operacional
            </h2>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-200">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              Ativos
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {agents.map((agent) => (
              <div 
                key={agent.id} 
                className={`relative p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 ${agent.id === 'estrategista' ? 'border-indigo-200 ring-1 ring-indigo-100' : ''}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${agent.bgColor} ${agent.color}`}>
                      <agent.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        {agent.name}
                        {agent.id === 'estrategista' && <Bot className="w-4 h-4 text-indigo-500" />}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium">{agent.role}</p>
                    </div>
                  </div>
                  
                  <div className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 ${agent.status === 'working' ? 'bg-indigo-50 text-indigo-700' : agent.status === 'done' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {agent.status === 'working' && <Loader2 className="w-3 h-3 animate-spin" />}
                    {agent.status === 'done' && <CheckCircle2 className="w-3 h-3" />}
                    {agent.status === 'idle' && <Activity className="w-3 h-3" />}
                    <span className="capitalize">{agent.status === 'working' ? 'Executando' : agent.status === 'done' ? 'Pronto' : 'Standby'}</span>
                  </div>
                </div>

                <div className="mt-2 text-sm font-medium text-slate-700 break-words mb-3">
                  <span className="inline-block py-1">
                    {agent.currentTask}
                  </span>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2 mb-1 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ease-out ${agent.status === 'done' ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                    style={{ width: `${agent.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-end mt-1">
                  <span className="text-xs font-bold text-slate-400">{Math.min(100, agent.progress)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Orchestration */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-slate-900 border text-sm border-slate-800 rounded-2xl shadow-xl flex flex-col overflow-hidden h-full min-h-[600px]">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <Search className="w-4 h-4 text-brand-500" />
                Stream de Inteligência Artificial
              </h3>
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Recording / Live"></div>
            </div>
            <div className="flex-1 p-5 overflow-y-auto space-y-4 font-mono text-xs flex flex-col-reverse bg-[#050505]">
              {logs.map((log, i) => {
                if (!log) return null;
                let colorClass = "text-slate-300";
                if (log.includes("ALERTA")) colorClass = "text-red-400 font-bold";
                if (log.includes("Estrategista")) colorClass = "text-blue-300";
                if (log.includes("Redator")) colorClass = "text-purple-300";
                if (log.includes("Orquestrador") || log.includes("normalizar")) colorClass = "text-emerald-300";
                
                return (
                  <div key={i} className={`animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out ${colorClass}`}>
                    <span className="text-zinc-600 mr-2">{'>'}</span>
                    {log}
                  </div>
                );
              })}
              {logs.length === 0 && (
                <div className="text-slate-500 italic">Estabelecendo rede neural da campanha...</div>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
