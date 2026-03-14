import type { ActualRecord } from "@/app/api/actuals/route";
import type { ForecastRecord } from "@/app/api/forecasts/route";

export interface ChartDataPoint {
  time: string;
  timeMs: number;
  actual: number | null;
  forecast: number | null;
  error: number | null;
}


export function buildChartData(
  actuals: ActualRecord[],
  forecasts: ForecastRecord[],
  startMs: number,
  endMs: number,
  horizonHours: number
): ChartDataPoint[] {
  const horizonMs = horizonHours * 60 * 60 * 1000;


  const forecastsByTarget = new Map<number, ForecastRecord[]>();
  for (const f of forecasts) {
    const key = new Date(f.startTime).getTime();
    if (!forecastsByTarget.has(key)) forecastsByTarget.set(key, []);
    forecastsByTarget.get(key)!.push(f);
  }

  const results: ChartDataPoint[] = [];

  for (const actual of actuals) {
    const targetMs = new Date(actual.startTime).getTime();
    if (targetMs < startMs || targetMs > endMs) continue;

    const hourAlignedMs = Math.floor(targetMs / 3_600_000) * 3_600_000;
    const cutoffMs = targetMs - horizonMs;

    const candidates =
      forecastsByTarget.get(hourAlignedMs) ??
      forecastsByTarget.get(hourAlignedMs + 1_800_000) ??
      [];

    const best = candidates
      .filter((f) => new Date(f.publishTime).getTime() <= cutoffMs)
      .sort((a, b) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime())[0];

    const forecastVal = best ? best.generation : null;
    const errorVal = forecastVal !== null ? forecastVal - actual.generation : null;

    results.push({
      time: actual.startTime,
      timeMs: targetMs,
      actual: actual.generation,
      forecast: forecastVal,
      error: errorVal,
    });
  }

  return results.sort((a, b) => a.timeMs - b.timeMs);
}

export interface Stats {
  mae: number | null;
  rmse: number | null;
  bias: number | null;
  coverage: number; // % of points with a forecast
}

export function computeStats(points: ChartDataPoint[]): Stats {
  const withForecast = points.filter((p) => p.error !== null);
  if (withForecast.length === 0) {
    return { mae: null, rmse: null, bias: null, coverage: 0 };
  }

  const errors = withForecast.map((p) => p.error!);
  const absErrors = errors.map(Math.abs);

  const mae = absErrors.reduce((s, e) => s + e, 0) / errors.length;
  const rmse = Math.sqrt(errors.reduce((s, e) => s + e * e, 0) / errors.length);
  const bias = errors.reduce((s, e) => s + e, 0) / errors.length;
  const coverage = (withForecast.length / points.length) * 100;

  return { mae, rmse, bias, coverage };
}

export function formatMW(val: number | null | undefined): string {
  if (val === null || val === undefined) return "—";
  return `${Math.round(val).toLocaleString()} MW`;
}

export function formatPercent(val: number): string {
  return `${val.toFixed(1)}%`;
}
