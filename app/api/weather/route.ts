import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const icao = (searchParams.get("icao") || process.env.DEFAULT_ICAO || "KJFK").toUpperCase();

  const url = `https://aviationweather.gov/api/data/metar?ids=${encodeURIComponent(icao)}&format=json`;

  const response = await fetch(url, {
    headers: { "User-Agent": "flight-ops-monitor/1.0 github-portfolio" },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    return NextResponse.json({ error: `AviationWeather.gov returned ${response.status}` }, { status: response.status });
  }

  const data = await response.json();
  const report = Array.isArray(data) ? data[0] : data;

  return NextResponse.json({
    source: "NOAA Aviation Weather Center",
    fetchedAt: new Date().toISOString(),
    report: report ?? null,
  });
}