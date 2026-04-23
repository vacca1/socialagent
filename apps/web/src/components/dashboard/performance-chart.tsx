"use client";

import { trpc } from "@/lib/trpc/provider";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart3 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Period = "7d" | "30d";

export function PerformanceChart() {
  const [period, setPeriod] = useState<Period>("30d");
  const { data, isLoading } = trpc.dashboard.performanceChart.useQuery({ period });

  const chartData = (data ?? []).map((s: any) => ({
    date: format(new Date(s.snapshotAt), "dd/MM", { locale: ptBR }),
    impressões: s.impressions,
    alcance: s.reach,
    engajamento: s.engagementRate ? Math.round(s.engagementRate * 100) / 100 : 0,
    score: s.performanceScore,
  }));

  return (
    <div className="bg-card rounded-xl border border-border p-5 h-full">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-brand-500" />
          <h3 className="font-semibold text-foreground text-sm">Performance</h3>
        </div>
        <div className="flex gap-1">
          {(["7d", "30d"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                period === p
                  ? "bg-brand-500 text-white"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 bg-muted rounded-lg animate-pulse" />
      ) : chartData.length === 0 ? (
        <div className="h-48 flex flex-col items-center justify-center text-muted-foreground">
          <BarChart3 className="w-8 h-8 mb-2 opacity-30" />
          <p className="text-sm">Nenhum dado de performance ainda</p>
          <p className="text-xs">Publique posts para ver analytics aqui</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            <Area type="monotone" dataKey="impressões" stroke="#6366f1" fill="url(#colorImpressions)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="alcance" stroke="#10b981" fill="url(#colorReach)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
