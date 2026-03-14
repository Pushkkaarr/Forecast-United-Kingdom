"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { ForecastChart } from "@/components/ForecastChart";
import { DateRangePicker } from "@/components/DateRangePicker";
import { HorizonSlider } from "@/components/HorizonSlider";
import { StatsPanel } from "@/components/StatsPanel";
import { buildChartData, computeStats } from "@/lib/dataUtils";
import type { ActualRecord } from "@/app/api/actuals/route";
import type { ForecastRecord } from "@/app/api/forecasts/route";
import { Wind, AlertCircle, RefreshCw } from "lucide-react";

const DATA_START = new Date("2024-01-01T00:00:00Z");
const DATA_END = new Date("2024-01-31T23:30:00Z");
const DEFAULT_HORIZON = 4;

type FetchState<T> = { data: T | null; loading: boolean; error: string | null };

function useFetch<T>(url: string): FetchState<T> {
  const [state, setState] = useState<FetchState<T>>({ data: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState({ data: null, loading: true, error: null });
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<T>;
      })
      .then((data) => { if (!cancelled) setState({ data, loading: false, error: null }); })
      .catch((e) => { if (!cancelled) setState({ data: null, loading: false, error: e.message }); });
    return () => { cancelled = true; };
  }, [url]);

  return state;
}

export function ForecastDashboard() {
  const [startDate, setStartDate] = useState(new Date("2024-01-01T00:00:00Z"));
  const [endDate, setEndDate] = useState(new Date("2024-01-31T23:30:00Z"));
  const [horizonHours, setHorizonHours] = useState(DEFAULT_HORIZON);

  const actualsState = useFetch<ActualRecord[]>("/api/actuals");
  const forecastsState = useFetch<ForecastRecord[]>("/api/forecasts");

  const handleDateChange = useCallback((from: Date, to: Date) => {
    setStartDate(from);
    setEndDate(to);
  }, []);

  const chartData = useMemo(() => {
    if (!actualsState.data || !forecastsState.data) return [];

    const startMs = Date.UTC(
      startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()
    );
    const endMs = Date.UTC(
      endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate(), 23, 59, 59, 999
    );
    return buildChartData(
      actualsState.data,
      forecastsState.data,
      startMs,
      endMs,
      horizonHours
    );
  }, [actualsState.data, forecastsState.data, startDate, endDate, horizonHours]);

  const stats = useMemo(() => computeStats(chartData), [chartData]);

  const isLoading = actualsState.loading || forecastsState.loading;
  const error = actualsState.error || forecastsState.error;

  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white">
      {/* Background gradient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute top-60 right-1/4 h-96 w-96 rounded-full bg-emerald-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-purple-600/8 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 shadow-lg shadow-emerald-500/25">
            <Wind className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              UK Wind Forecast Monitor
            </h1>
            <p className="text-xs text-slate-400">
              National-level wind power generation · January 2024
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {isLoading && (
              <div className="flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Loading data…
              </div>
            )}
          </div>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Failed to load data: {error}. Please check your connection and try again.</span>
          </div>
        )}

        {/* Controls Bar */}
        <div className="mb-6 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DateRangePicker
              from={startDate}
              to={endDate}
              onChange={handleDateChange}
              minDate={DATA_START}
              maxDate={DATA_END}
            />
          </div>
          <div>
            <HorizonSlider
              value={horizonHours}
              onChange={setHorizonHours}
              min={0}
              max={48}
              step={1}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <StatsPanel stats={stats} totalPoints={chartData.length} />
        </div>

        {/* Chart */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:p-6">
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <h2 className="font-semibold text-slate-200">Generation Timeline</h2>
            <div className="flex items-center gap-4 ml-auto text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-sm bg-blue-400" />
                Actual Generation
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-sm bg-emerald-400" />
                Forecast (≥{horizonHours}h horizon)
              </span>
            </div>
          </div>
          <ForecastChart data={chartData} loading={isLoading} />
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-xs text-slate-600">
          Data sourced from{" "}
          <a href="https://bmrs.elexon.co.uk" target="_blank" rel="noreferrer" className="underline hover:text-slate-400">
            Elexon BMRS API
          </a>{" "}
          · Built by Pushkar
        </footer>
      </div>
    </div>
  );
}
