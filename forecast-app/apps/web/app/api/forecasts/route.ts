import { NextResponse } from "next/server";

export const revalidate = 3600;

export interface ForecastRecord {
  startTime: string;
  publishTime: string;
  generation: number;
}

async function fetchWindow(from: string, to: string): Promise<ForecastRecord[]> {
  const url = new URL("https://data.elexon.co.uk/bmrs/api/v1/datasets/WINDFOR");
  url.searchParams.set("publishDateTimeFrom", from);
  url.searchParams.set("publishDateTimeTo", to);
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`WINDFOR HTTP ${res.status} for ${from}–${to}: ${body.slice(0, 200)}`);
    return [];
  }

  const body = await res.json();
  const items: Record<string, unknown>[] = Array.isArray(body) ? body : (body?.data ?? []);

  return items
    .filter((d) => d.startTime && d.publishTime && d.generation !== undefined)
    .map((d) => ({
      startTime: d.startTime as string,
      publishTime: d.publishTime as string,
      generation: Number(d.generation ?? 0),
    }))
    .filter((d) => {
      const horizonH = (new Date(d.startTime).getTime() - new Date(d.publishTime).getTime()) / 3_600_000;
      return horizonH >= 0 && horizonH <= 48;
    });
}

export async function GET() {
  try {

    const windows: [string, string][] = [
      ["2024-01-01T00:00:00Z", "2024-01-02T23:59:59Z"],
      ["2024-01-03T00:00:00Z", "2024-01-04T23:59:59Z"],
      ["2024-01-05T00:00:00Z", "2024-01-06T23:59:59Z"],
      ["2024-01-07T00:00:00Z", "2024-01-08T23:59:59Z"],
      ["2024-01-09T00:00:00Z", "2024-01-10T23:59:59Z"],
      ["2024-01-11T00:00:00Z", "2024-01-12T23:59:59Z"],
      ["2024-01-13T00:00:00Z", "2024-01-14T23:59:59Z"],
      ["2024-01-15T00:00:00Z", "2024-01-16T23:59:59Z"],
      ["2024-01-17T00:00:00Z", "2024-01-18T23:59:59Z"],
      ["2024-01-19T00:00:00Z", "2024-01-20T23:59:59Z"],
      ["2024-01-21T00:00:00Z", "2024-01-22T23:59:59Z"],
      ["2024-01-23T00:00:00Z", "2024-01-24T23:59:59Z"],
      ["2024-01-25T00:00:00Z", "2024-01-26T23:59:59Z"],
      ["2024-01-27T00:00:00Z", "2024-01-28T23:59:59Z"],
      ["2024-01-29T00:00:00Z", "2024-01-30T23:59:59Z"],
      ["2024-01-31T00:00:00Z", "2024-01-31T23:59:59Z"],
    ];


    const all: ForecastRecord[] = [];
    const BATCH = 4;
    for (let i = 0; i < windows.length; i += BATCH) {
      const batch = windows.slice(i, i + BATCH);
      const results = await Promise.all(batch.map(([f, t]) => fetchWindow(f, t)));
      results.forEach((r) => all.push(...r));
    }

    all.sort((a, b) => a.publishTime.localeCompare(b.publishTime) || a.startTime.localeCompare(b.startTime));
    console.log(`[forecasts] ${all.length} forecast rows returned`);
    return NextResponse.json(all);
  } catch (err) {
    console.error("[forecasts] Error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
