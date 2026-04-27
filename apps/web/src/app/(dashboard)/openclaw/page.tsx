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
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    status: "working",
    currentTask: "Analisando debate da TV Opositora...",
    progress: 75,
  },
  {
    id: "crise",
    name: "Monitor de Crise",
    role: "Radar de Oposição",
    icon: ShieldAlert,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    status: "working",
    currentTask: "Varrendo WhatsApp e Twitter...",
    progress: 30,
  },
  {
    id: "redator",
    name: "Redator de Discursos",
    role: "Copywriter Político",
    icon: PenTool,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    status: "idle",
    currentTask: "Aguardando diretrizes de crise...",
    progress: 0,
  },
  {
    id: "social",
    name: "Orquestrador de Militância",
    role: "Engajamento",
    icon: MessageSquare,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
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
    <div className="space-y-6 animate-fade-in relative z-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
            <div className="p-2 rounded-xl liquid-glass glow-violet">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            War Room Digital
          </h1>
          <p className="text-muted-foreground text-sm mt-2 font-medium">
            Bunker de Agentes Inteligentes operando em tempo real.
          </p>
        </div>
      </div>
      
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Agents Grid */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
              <Bot className="w-5 h-5 text-primary" />
              Esquadrão Operacional
            </h2>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              Ativos
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {agents.map((agent) => (
              <div 
                key={agent.id} 
                className={`relative p-5 liquid-panel group ${agent.id === 'estrategista' ? 'border-primary/50' : ''}`}
              >
                {/* Glow on hover */}
                <div className="absolute inset-0 rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" 
                     style={{ boxShadow: `inset 0 0 20px ${agent.id === 'estrategista' ? 'var(--glow-violet)' : 'rgba(255,255,255,0.05)'}` }} />

                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl liquid-glass ${agent.color}`}>
                      <agent.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground flex items-center gap-2">
                        {agent.name}
                        {agent.id === 'estrategista' && <Bot className="w-4 h-4 text-primary" />}
                      </h3>
                      <p className="text-sm text-muted-foreground font-medium">{agent.role}</p>
                    </div>
                  </div>
                  
                  <div className={`px-2.5 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 border ${agent.status === 'working' ? 'bg-primary/10 text-primary border-primary/20' : agent.status === 'done' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-foreground/5 text-muted-foreground border-border/50'}`}>
                    {agent.status === 'working' && <Loader2 className="w-3 h-3 animate-spin" />}
                    {agent.status === 'done' && <CheckCircle2 className="w-3 h-3" />}
                    {agent.status === 'idle' && <Activity className="w-3 h-3" />}
                    <span className="capitalize">{agent.status === 'working' ? 'Executando' : agent.status === 'done' ? 'Pronto' : 'Standby'}</span>
                  </div>
                </div>

                <div className="mt-2 text-sm font-medium text-foreground/80 break-words mb-4 relative z-10">
                  <span className="inline-block py-1">
                    {agent.currentTask}
                  </span>
                </div>

                <div className="w-full bg-border/50 rounded-full h-2 mb-1 overflow-hidden relative z-10">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ease-out ${agent.status === 'done' ? 'bg-emerald-500' : 'bg-primary'}`} 
                    style={{ width: `${agent.progress}%`, boxShadow: agent.status === 'done' ? '0 0 10px rgba(16,185,129,0.5)' : '0 0 10px rgba(124,58,237,0.5)' }}
                  ></div>
                </div>
                <div className="flex justify-end mt-1 relative z-10">
                  <span className="text-xs font-bold text-muted-foreground">{Math.min(100, agent.progress)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Orchestration */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="liquid-panel flex flex-col overflow-hidden h-full min-h-[600px] border-border/50">
            <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between bg-foreground/5 backdrop-blur-sm">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" />
                Stream de Inteligência Artificial
              </h3>
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Recording / Live"></div>
            </div>
            <div className="flex-1 p-5 overflow-y-auto space-y-4 font-mono text-xs flex flex-col-reverse scrollbar-thin bg-black/40 dark:bg-black/80">
              {logs.map((log, i) => {
                if (!log) return null;
                let colorClass = "text-slate-400";
                if (log.includes("ALERTA")) colorClass = "text-red-400 font-bold drop-shadow-[0_0_5px_rgba(248,113,113,0.8)]";
                if (log.includes("Estrategista")) colorClass = "text-blue-400";
                if (log.includes("Redator")) colorClass = "text-purple-400";
                if (log.includes("Orquestrador") || log.includes("normalizar")) colorClass = "text-emerald-400";
                
                return (
                  <div key={i} className={`animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out ${colorClass}`}>
                    <span className="text-zinc-600 mr-2">{'>'}</span>
                    {log}
                  </div>
                );
              })}
              {logs.length === 0 && (
                <div className="text-muted-foreground italic">Estabelecendo rede neural da campanha...</div>
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
