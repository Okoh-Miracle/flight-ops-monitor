import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.FR24_API_TOKEN;
  if (!token) {
    return NextResponse.json({
      enabled: false,
      message: "FR24 adapter disabled. Add FR24_API_TOKEN to enable it.",
    });
  }

  const base = process.env.FR24_API_BASE || "https://fr24api.flightradar24.com/api";
  const response = await fetch(`${base}/live/flight-positions/light`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Accept": "application/json",
      "Accept-Version": "v1",
    },
    next: { revalidate: 15 },
  });

  const body = await response.json();
  return NextResponse.json({ enabled: true, status: response.status, data: body }, { status: response.status });
}