"use client";

import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { format } from "date-fns";
import type { ChartDataPoint } from "@/lib/dataUtils";

interface ForecastChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
}

interface TooltipPayloadEntry {
  name: string;
  value: number | null;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  const actual = payload.find((p) => p.name === "Actual");
  const forecast = payload.find((p) => p.name === "Forecast");
  const error =
    actual?.value != null && forecast?.value != null
      ? forecast.value - actual.value
      : null;

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/95 px-4 py-3 shadow-2xl backdrop-blur-md text-sm">
      <p className="mb-2 font-semibold text-slate-300">
        {label ? format(new Date(label), "dd MMM yyyy, HH:mm") : ""}
      </p>
      {actual && (
        <p className="flex items-center gap-2 text-blue-400">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-400" />
          Actual: <strong>{actual.value != null ? `${Math.round(actual.value).toLocaleString()} MW` : "—"}</strong>
        </p>
      )}
      {forecast && (
        <p className="flex items-center gap-2 text-emerald-400">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
          Forecast: <strong>{forecast.value != null ? `${Math.round(forecast.value).toLocaleString()} MW` : "No data"}</strong>
        </p>
      )}
      {error !== null && (
        <p className={`mt-1 text-xs ${error >= 0 ? "text-rose-400" : "text-sky-400"}`}>
          Error: {error >= 0 ? "+" : ""}{Math.round(error).toLocaleString()} MW
        </p>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
        <p className="text-sm text-slate-400">Loading generation data…</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <p className="text-slate-500">No data available for the selected range.</p>
    </div>
  );
}

export function ForecastChart({ data, loading }: ForecastChartProps) {
  if (loading) return <div className="h-80 md:h-[420px]"><LoadingSkeleton /></div>;
  if (!data.length) return <div className="h-80 md:h-[420px]"><EmptyState /></div>;

  const minVal = Math.min(
    ...data.map((d) => Math.min(d.actual ?? Infinity, d.forecast ?? Infinity)).filter(isFinite)
  );
  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.actual ?? -Infinity, d.forecast ?? -Infinity)).filter(isFinite)
  );
  const yMin = Math.max(0, Math.floor((minVal * 0.9) / 500) * 500);
  const yMax = Math.ceil((maxVal * 1.05) / 500) * 500;


  const tickCount = Math.min(data.length, 8);
  const tickInterval = Math.max(1, Math.floor(data.length / tickCount));

  return (
    <div className="h-80 md:h-[420px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis
            dataKey="time"
            tickFormatter={(v: string) => {
              try { return format(new Date(v), "dd MMM HH:mm"); } catch { return v; }
            }}
            interval={tickInterval}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            tickLine={false}
          />
          <YAxis
            domain={[yMin, yMax]}
            tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}GW`}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            tickLine={false}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: "12px", fontSize: "13px" }}
            formatter={(value: string) => (
              <span style={{ color: value === "Actual" ? "#60a5fa" : "#34d399" }}>{value}</span>
            )}
          />
          <Line
            type="monotone"
            dataKey="actual"
            name="Actual"
            stroke="#60a5fa"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#60a5fa", strokeWidth: 0 }}
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="forecast"
            name="Forecast"
            stroke="#34d399"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#34d399", strokeWidth: 0 }}
            connectNulls={false}
            strokeDasharray="0"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
