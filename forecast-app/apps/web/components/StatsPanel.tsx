"use client";

import { formatMW, formatPercent } from "@/lib/dataUtils";
import type { Stats } from "@/lib/dataUtils";
import { TrendingDown, TrendingUp, Zap, Target } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ label, value, sublabel, icon, color }: StatCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400">{label}</p>
          <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
          {sublabel && <p className="mt-0.5 text-xs text-slate-500">{sublabel}</p>}
        </div>
        <div className={`rounded-lg p-2 ${color.replace("text-", "bg-").replace("400", "400/10")}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

interface StatsPanelProps {
  stats: Stats;
  totalPoints: number;
}

export function StatsPanel({ stats, totalPoints }: StatsPanelProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        label="MAE"
        value={formatMW(stats.mae)}
        sublabel="Mean Absolute Error"
        icon={<Target className="h-4 w-4 text-blue-400" />}
        color="text-blue-400"
      />
      <StatCard
        label="RMSE"
        value={formatMW(stats.rmse)}
        sublabel="Root Mean Sq. Error"
        icon={<Zap className="h-4 w-4 text-amber-400" />}
        color="text-amber-400"
      />
      <StatCard
        label="Bias"
        value={formatMW(stats.bias)}
        sublabel={stats.bias !== null ? (stats.bias >= 0 ? "Over-forecast" : "Under-forecast") : "—"}
        icon={stats.bias !== null && stats.bias >= 0
          ? <TrendingUp className="h-4 w-4 text-rose-400" />
          : <TrendingDown className="h-4 w-4 text-emerald-400" />}
        color={stats.bias !== null && stats.bias >= 0 ? "text-rose-400" : "text-emerald-400"}
      />
      <StatCard
        label="Coverage"
        value={formatPercent(stats.coverage)}
        sublabel={`${totalPoints} target times`}
        icon={<Target className="h-4 w-4 text-purple-400" />}
        color="text-purple-400"
      />
    </div>
  );
}
