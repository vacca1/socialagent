"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from "lucide-react";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-zinc-800 ${className ?? ""}`} />;
}

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data, isLoading } = trpc.calendar.month.useQuery({ year, month });

  const goPrev = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const goNext = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  // Build calendar grid — pad start with empty cells
  const firstDay = data?.days[0]?.dayOfWeek ?? 0;
  const emptyPrefix = Array.from({ length: firstDay });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-indigo-400" />
            Calendário Editorial
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            {data ? `${data.totalScheduled} publicações agendadas` : "Agende e visualize suas publicações"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={goPrev}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-zinc-200 font-semibold min-w-[140px] text-center">
            {MONTHS[month - 1]} {year}
          </span>
          <button
            onClick={goNext}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-zinc-800">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        {isLoading ? (
          <div className="grid grid-cols-7 gap-px bg-zinc-800 p-px">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-24 bg-zinc-900 rounded-none" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {emptyPrefix.map((_, i) => (
              <div key={`empty-${i}`} className="min-h-24 border-b border-r border-zinc-800/50 bg-zinc-950/30" />
            ))}
            {data?.days.map((day, idx) => {
              const isToday = day.date === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
              const dayNum = parseInt(day.date.split("-")[2] ?? "0");
              const hasItems = day.publications.length > 0 || day.projects.length > 0;

              return (
                <div
                  key={day.date}
                  className={`min-h-24 p-2 border-b border-r border-zinc-800/50 transition-colors hover:bg-zinc-800/30 ${
                    isToday ? "bg-indigo-950/30" : ""
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                    isToday ? "bg-indigo-600 text-white" : "text-zinc-400"
                  }`}>
                    {dayNum}
                  </div>
                  <div className="space-y-0.5">
                    {day.publications.slice(0, 2).map((pub) => (
                      <div
                        key={pub.id}
                        className="text-xs px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-300 truncate flex items-center gap-1"
                      >
                        <Clock className="h-2.5 w-2.5 shrink-0" />
                        {pub.caption?.substring(0, 20) ?? pub.format}
                      </div>
                    ))}
                    {day.projects.slice(0, 1).map((proj) => (
                      <div
                        key={proj.id}
                        className="text-xs px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 truncate"
                      >
                        {proj.title?.substring(0, 20) ?? "Projeto"}
                      </div>
                    ))}
                    {(day.publications.length + day.projects.length) > 3 && (
                      <div className="text-xs text-zinc-500 px-1">
                        +{day.publications.length + day.projects.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-zinc-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-indigo-900/60" />
          <span>Publicações</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-900/60" />
          <span>Projetos</span>
        </div>
      </div>
    </div>
  );
}
