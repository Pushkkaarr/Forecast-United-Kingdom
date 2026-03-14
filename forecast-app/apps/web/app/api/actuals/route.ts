import { NextResponse } from "next/server";

export const revalidate = 3600;

export interface ActualRecord {
  startTime: string; 
  generation: number;
}

async function fetchDay(date: string): Promise<ActualRecord[]> {
  const url = new URL("https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH");
  url.searchParams.set("settlementDateFrom", date);
  url.searchParams.set("settlementDateTo", date);
  url.searchParams.set("fuelType", "WIND");
  url.searchParams.set("format", "json");

  const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`FUELHH ${date}: HTTP ${res.status}`);

  const body = await res.json();
  const items: Record<string, unknown>[] = Array.isArray(body) ? body : (body?.data ?? []);

  return items.map((d) => ({
    startTime: d.startTime as string,
    generation: Number(d.generation ?? 0),
  }));
}

export async function GET() {
  try {

    const days: string[] = [];
    for (let d = 1; d <= 31; d++) {
      days.push(`2024-01-${String(d).padStart(2, "0")}`);
    }

    const results: ActualRecord[] = [];
    const BATCH = 7;
    for (let i = 0; i < days.length; i += BATCH) {
      const batch = days.slice(i, i + BATCH);
      const fetched = await Promise.all(batch.map(fetchDay));
      fetched.forEach((r) => results.push(...r));
    }

    const records = results
      .filter((r) => r.startTime && !isNaN(r.generation))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    console.log(`[actuals] ${records.length} WIND rows returned`);
    return NextResponse.json(records);
  } catch (err) {
    console.error("[actuals] Error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
