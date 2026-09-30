import { NextResponse } from "next/server";

type StateVector = [
  string,
  string | null,
  string | null,
  number,
  number,
  number | null,
  number | null,
  number | null,
  boolean | null,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null,
  number | null
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const lamin = searchParams.get("lamin") ?? "24";
  const lamax = searchParams.get("lamax") ?? "50";
  const lomin = searchParams.get("lomin") ?? "-125";
  const lomax = searchParams.get("lomax") ?? "-65";

  const params = new URLSearchParams({
    lamin,
    lamax,
    lomin,
    lomax,
  });

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  try {
    const clientId = process.env.OPENSKY_CLIENT_ID;
    const clientSecret = process.env.OPENSKY_CLIENT_SECRET;

    if (clientId && clientSecret) {
      const tokenResponse = await fetch(
        "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "client_credentials",
            client_id: clientId,
            client_secret: clientSecret,
          }),
          cache: "no-store",
        }
      );

      if (tokenResponse.ok) {
        const token = await tokenResponse.json();
        headers.Authorization = `Bearer ${token.access_token}`;
      }
    }

    const response = await fetch(
      `https://opensky-network.org/api/states/all?${params}`,
      {
        headers,
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          source: "OpenSky Network",
          fetchedAt: new Date().toISOString(),
          count: 0,
          states: [],
          degraded: true,
          error: `OpenSky returned ${response.status}`,
        },
        { status: 200 }
      );
    }

    const data = await response.json();

    const states = ((data.states ?? []) as StateVector[])
      .map((s) => ({
        icao24: s[0],
        callsign: s[1]?.trim() || "UNKNOWN",
        country: s[2] || "Unknown",
        lon: s[5],
        lat: s[6],
        altitude: s[7],
        velocity: s[9],
        heading: s[10],
        verticalRate: s[11],
        onGround: s[8],
        lastContact: s[4],
      }))
      .filter((f) => f.lat !== null && f.lon !== null);

    return NextResponse.json({
      source: "OpenSky Network",
      fetchedAt: new Date().toISOString(),
      count: states.length,
      states,
      degraded: false,
    });
  } catch (error) {
    console.error("OpenSky request failed:", error);

    return NextResponse.json(
      {
        source: "OpenSky Network",
        fetchedAt: new Date().toISOString(),
        count: 0,
        states: [],
        degraded: true,
        error: "Live flight data is temporarily unavailable.",
      },
      { status: 200 }
    );
  }
}
