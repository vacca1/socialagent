"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Target, Plus, TrendingUp, TrendingDown, Minus } from "lucide-react";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-zinc-800 ${className ?? ""}`} />;
}

function ProgressRing({ value, target, size = 64 }: { value: number; target: number; size?: number }) {
  const pct = Math.min((value / target) * 100, 100);
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (pct / 100) * circumference;
  const color = pct >= 100 ? "#10b981" : pct >= 70 ? "#f59e0b" : "#6366f1";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#27272a" strokeWidth={4} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em" className="text-xs" fill={color} fontSize={size < 64 ? 10 : 12} fontWeight="bold">
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

export default function KpisPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", metric: "", target: "", period: "monthly" as "weekly" | "monthly" });

  const { data: kpis, isLoading, refetch } = trpc.agency.kpiTargets.useQuery();

  const createKpi = trpc.agency.createKpiTarget.useMutation({
    onSuccess: () => { refetch(); setShowCreate(false); setForm({ name: "", metric: "", target: "", period: "monthly" }); },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Target className="h-6 w-6 text-indigo-400" />
            KPIs
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Defina e acompanhe seus indicadores de performance</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nova meta
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="rounded-xl border border-indigo-800/50 bg-zinc-900 p-5">
          <h2 className="text-sm font-semibold text-zinc-200 mb-4">Nova Meta de KPI</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Nome da meta</label>
              <input
                type="text"
                placeholder="Ex: Posts publicados"
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Métrica</label>
              <input
                type="text"
                placeholder="Ex: publications_count"
                value={form.metric}
                onChange={(e) => setForm(f => ({ ...f, metric: e.target.value }))}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Meta</label>
              <input
                type="number"
                placeholder="100"
                value={form.target}
                onChange={(e) => setForm(f => ({ ...f, target: e.target.value }))}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 block mb-1">Período</label>
              <select
                value={form.period}
                onChange={(e) => setForm(f => ({ ...f, period: e.target.value as "weekly" | "monthly" }))}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => createKpi.mutate({ name: form.name, metric: form.metric, target: Number(form.target), period: form.period })}
              disabled={!form.name || !form.metric || !form.target || createKpi.isLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {createKpi.isLoading ? "Criando..." : "Criar meta"}
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg text-sm transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* KPI cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : !kpis || kpis.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <Target className="h-14 w-14 mb-4 opacity-30" />
          <p className="text-base font-medium text-zinc-400">Nenhuma meta definida</p>
          <p className="text-sm mt-1">Crie metas de KPI para acompanhar sua performance</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Criar primeira meta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map((kpi) => {
            const latestResult = kpi.results?.[0];
            const currentValue = latestResult?.actual ?? 0;
            const pct = Math.min((currentValue / kpi.target) * 100, 100);
            const prevResult = kpi.results?.[1];
            const trend = prevResult
              ? currentValue > prevResult.actual
                ? "up"
                : currentValue < prevResult.actual
                ? "down"
                : "flat"
              : null;

            return (
              <div key={kpi.id} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 hover:border-zinc-700 transition-colors">
                <div className="flex items-start gap-4">
                  <ProgressRing value={currentValue} target={kpi.target} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-zinc-200">{kpi.name}</h3>
                      {trend && (
                        <div>
                          {trend === "up" && <TrendingUp className="h-4 w-4 text-emerald-400" />}
                          {trend === "down" && <TrendingDown className="h-4 w-4 text-red-400" />}
                          {trend === "flat" && <Minus className="h-4 w-4 text-zinc-500" />}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5 font-mono">{kpi.metric}</p>
                    <div className="mt-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-zinc-100">{currentValue.toLocaleString()}</span>
                        <span className="text-sm text-zinc-500">/ {kpi.target.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-zinc-600 mt-0.5 capitalize">{kpi.period}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
