"use client";

import React, { useEffect, useState } from "react";
import { Activity, BarChart3, TrendingUp, Users, Target, ShieldAlert, Heart, Zap, Search, Eye } from "lucide-react";

export default function SentimentAnalysisPage() {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setPulse((p) => !p), 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-fade-in relative z-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
            <div className="p-2 rounded-xl liquid-glass glow-emerald">
              <Activity className="h-6 w-6 text-emerald-500" />
            </div>
            Sentimento Agêntico
          </h1>
          <p className="text-muted-foreground text-sm mt-2 font-medium">
            Monitoramento cognitivo da percepção pública em tempo real nas redes sociais.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Status da Rede</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-sm font-semibold text-emerald-500">Alta Aprovação</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Painel Central: Sensor de Popularidade (Gauge) */}
        <div className="lg:col-span-5 liquid-panel p-6 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-yellow-400 to-emerald-500"></div>
          
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6">Termômetro de Aprovação</h2>
          
          <div className="relative w-64 h-32 flex items-end justify-center overflow-hidden">
            {/* Semicircle Track */}
            <div className="absolute top-0 left-0 w-64 h-64 border-[30px] border-border/50 rounded-full box-border border-b-transparent border-r-transparent rotate-45"></div>
            {/* Semicircle Fill (Animated) */}
            <div className="absolute top-0 left-0 w-64 h-64 border-[30px] border-emerald-500 rounded-full box-border border-b-transparent border-r-transparent rotate-45 transition-transform duration-1000 ease-out" style={{ transform: "rotate(130deg)" }}></div>
            
            <div className="flex flex-col items-center z-10 bg-background/50 backdrop-blur-sm pt-4 px-8 rounded-t-full">
              <span className="text-5xl font-black text-foreground tracking-tighter">78<span className="text-3xl text-muted-foreground">%</span></span>
              <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3" /> +5% vs ontem
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 w-full mt-8 gap-4 text-center divide-x divide-border/50">
            <div>
              <p className="text-2xl font-bold text-emerald-500">78%</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Positivo</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-muted-foreground">12%</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Neutro</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">10%</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Negativo</p>
            </div>
          </div>
        </div>

        {/* Radar de Atributos (SVG Radar Chart Simulation) */}
        <div className="lg:col-span-4 liquid-panel p-6 flex flex-col">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6 text-center">Radar de Percepção</h2>
          
          <div className="flex-1 flex items-center justify-center relative min-h-[250px]">
            {/* Hexagon Base Grid */}
            <svg viewBox="0 0 200 200" className="w-full h-full max-w-[220px] overflow-visible">
              <polygon points="100,20 170,60 170,140 100,180 30,140 30,60" fill="none" stroke="currentColor" className="text-border/50" strokeWidth="1" />
              <polygon points="100,45 145,75 145,125 100,155 55,125 55,75" fill="none" stroke="currentColor" className="text-border/50" strokeWidth="1" />
              <polygon points="100,70 120,85 120,115 100,130 80,115 80,85" fill="none" stroke="currentColor" className="text-border/50" strokeWidth="1" />
              
              {/* Data Polygon */}
              <polygon 
                points="100,30 160,80 150,150 100,165 40,130 60,60" 
                fill="var(--glow-violet)" 
                stroke="#7c3aed" 
                strokeWidth="3" 
                className="transition-all duration-1000 opacity-60"
              />
              
              {/* Axes lines */}
              <line x1="100" y1="100" x2="100" y2="20" stroke="currentColor" className="text-border/30" strokeWidth="1" />
              <line x1="100" y1="100" x2="170" y2="60" stroke="currentColor" className="text-border/30" strokeWidth="1" />
              <line x1="100" y1="100" x2="170" y2="140" stroke="currentColor" className="text-border/30" strokeWidth="1" />
              <line x1="100" y1="100" x2="100" y2="180" stroke="currentColor" className="text-border/30" strokeWidth="1" />
              <line x1="100" y1="100" x2="30" y2="140" stroke="currentColor" className="text-border/30" strokeWidth="1" />
              <line x1="100" y1="100" x2="30" y2="60" stroke="currentColor" className="text-border/30" strokeWidth="1" />

              {/* Labels */}
              <text x="100" y="10" textAnchor="middle" fill="currentColor" className="text-muted-foreground" fontSize="10" fontWeight="bold">Confiança</text>
              <text x="185" y="55" textAnchor="middle" fill="currentColor" className="text-muted-foreground" fontSize="10" fontWeight="bold">Inovação</text>
              <text x="185" y="150" textAnchor="middle" fill="currentColor" className="text-muted-foreground" fontSize="10" fontWeight="bold">Saúde</text>
              <text x="100" y="195" textAnchor="middle" fill="currentColor" className="text-muted-foreground" fontSize="10" fontWeight="bold">Segurança</text>
              <text x="15" y="150" textAnchor="middle" fill="currentColor" className="text-muted-foreground" fontSize="10" fontWeight="bold">Economia</text>
              <text x="15" y="55" textAnchor="middle" fill="currentColor" className="text-muted-foreground" fontSize="10" fontWeight="bold">Empatia</text>
            </svg>
          </div>
        </div>

        {/* Sensores de Rede */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="liquid-panel bg-foreground/5 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Alerta de Crise</span>
              <ShieldAlert className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-3xl font-black text-foreground mb-1">Baixo</p>
            <p className="text-xs text-muted-foreground">Nenhuma narrativa de ataque ganhou tração nas últimas 24h.</p>
          </div>
          
          <div className="liquid-panel bg-primary/20 border-primary/30 p-5 relative overflow-hidden">
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-primary rounded-full blur-2xl ${pulse ? 'opacity-80' : 'opacity-40'} transition-opacity duration-1000`}></div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Engajamento IA</span>
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <p className="text-3xl font-black text-foreground mb-1 relative z-10">4.2k</p>
            <p className="text-xs text-foreground/80 font-medium relative z-10">Interações orquestradas por agentes hoje.</p>
          </div>
        </div>
      </div>

      {/* Top Topics & Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tópicos Quentes */}
        <div className="liquid-panel p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Temas mais associados</h2>
            <Target className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {[
              { topic: "Novas Creches", mentions: 1450, sentiment: 92, color: "bg-emerald-500" },
              { topic: "Buracos na Rua XV", mentions: 850, sentiment: 15, color: "bg-red-500" },
              { pos: "Combate à Corrupção", mentions: 1200, sentiment: 85, color: "bg-emerald-400" },
              { topic: "IPTU", mentions: 450, sentiment: 40, color: "bg-orange-500" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-foreground">{item.topic || item.pos}</span>
                    <span className="text-xs font-bold text-muted-foreground">{item.mentions} menções</span>
                  </div>
                  <div className="w-full bg-border/50 rounded-full h-2 overflow-hidden flex">
                    <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.sentiment}%` }}></div>
                  </div>
                </div>
                <div className="w-12 text-right">
                  <span className="text-xs font-bold text-foreground">{item.sentiment}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Sentiment Feed */}
        <div className="liquid-panel p-6 flex flex-col h-[350px]">
          <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-4">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              Observatório das Redes
            </h2>
            <span className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
              Tempo Real
            </span>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin">
            {[
              { user: "@eleitor_comum", platform: "Instagram", text: "Graças a Deus arrumaram a iluminação do meu bairro! 🙏", sentiment: "positive" },
              { user: "@jovem_tech", platform: "Twitter/X", text: "O candidato mandou muito bem no debate hoje, não deitou pra ninguém.", sentiment: "positive" },
              { user: "@joao_silva123", platform: "Facebook", text: "E o hospital que prometeram? Até agora nada, só propaganda.", sentiment: "negative" },
              { user: "@maria_oli", platform: "TikTok", text: "Amei o projeto das creches, meu voto é seu com certeza! ❤️", sentiment: "positive" },
            ].map((feed, i) => (
              <div key={i} className="flex gap-3 items-start border-b border-border/30 pb-3 last:border-0">
                <div className={`p-2 rounded-xl shrink-0 liquid-glass ${feed.sentiment === 'positive' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {feed.sentiment === 'positive' ? <Heart className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">{feed.user}</span>
                    <span className="text-[10px] font-bold bg-foreground/5 text-muted-foreground px-1.5 py-0.5 rounded uppercase">{feed.platform}</span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mt-0.5 line-clamp-2">{feed.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
