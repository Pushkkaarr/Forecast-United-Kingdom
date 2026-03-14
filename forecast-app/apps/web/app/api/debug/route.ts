import { NextResponse } from "next/server";

export async function GET() {
  try {

    const [actualsRes, forecastsRes] = await Promise.all([
      fetch("https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH/stream?from=2024-01-01&to=2024-01-02", {
        headers: { Accept: "application/json" },
      }),
      fetch("https://data.elexon.co.uk/bmrs/api/v1/datasets/WINDFOR/stream?from=2024-01-01&to=2024-01-02", {
        headers: { Accept: "application/json" },
      }),
    ]);

    const actualsRaw = await actualsRes.json();
    const forecastsRaw = await forecastsRes.json();

    const actualsArr = Array.isArray(actualsRaw) ? actualsRaw : (actualsRaw?.data ?? actualsRaw);
    const forecastsArr = Array.isArray(forecastsRaw) ? forecastsRaw : (forecastsRaw?.data ?? forecastsRaw);

    return NextResponse.json({
      actuals_status: actualsRes.status,
      actuals_count: Array.isArray(actualsArr) ? actualsArr.length : "not array",
      actuals_sample: Array.isArray(actualsArr) ? actualsArr.slice(0, 3) : actualsArr,
      forecasts_status: forecastsRes.status,
      forecasts_count: Array.isArray(forecastsArr) ? forecastsArr.length : "not array",
      forecasts_sample: Array.isArray(forecastsArr) ? forecastsArr.slice(0, 3) : forecastsArr,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
