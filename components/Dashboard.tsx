"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, Cloud, Gauge, Plane, RefreshCw, Radio, ShieldCheck, Wind } from "lucide-react";

const FlightMap = dynamic(() => import("./Map"), { ssr: false });

type Flight = {
  icao24: string; callsign: string; country: string; lat: number; lon: number;
  altitude: number | null; velocity: number | null; heading: number | null;
  verticalRate: number | null; onGround: boolean | null;
};

type Weather = { report?: Record<string, any> | null };

function Stat({ icon: Icon, label, value, detail }: any) {
  return (
    <div className="panel" style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="label">{label}</span>
        <Icon size={17} color="#5ec7ff" />
      </div>
      <div style={{ fontSize: 27, fontWeight: 800, marginTop: 8 }}>{value}</div>
      <div className="muted" style={{ fontSize: 12, marginTop: 3 }}>{detail}</div>
    </div>
  );
}

export default function Dashboard() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("—");
  const [icao, setIcao] = useState("KJFK");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [f, w] = await Promise.all([
        fetch("/api/flights").then((r) => r.json()),
        fetch(`/api/weather?icao=${encodeURIComponent(icao)}`).then((r) => r.json()),
      ]);
      if (f.error) throw new Error(f.error);
      setFlights(f.states || []);
      setWeather(w);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e: any) {
      setError(e.message || "Unable to load operational data.");
    } finally {
      setLoading(false);
    }
  }, [icao]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, [load]);

  const airborne = useMemo(() => flights.filter((f) => !f.onGround).length, [flights]);
  const climbing = useMemo(() => flights.filter((f) => (f.verticalRate || 0) > 1).length, [flights]);
  const highAltitude = useMemo(() => flights.filter((f) => (f.altitude || 0) > 9000).length, [flights]);

  const r = weather?.report || {};
  const visibility = r.visib ?? r.visibility;
  const wind = r.wspd != null ? `${r.wspd} kt` : "—";
  const temp = r.temp != null ? `${r.temp}°C` : "—";
  const flightCategory = r.fltCat || "—";

  return (
    <main style={{ minHeight: "100vh", padding: 24, maxWidth: 1600, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 20 }}>
        <div>
          <div className="label" style={{ color: "#5ec7ff", marginBottom: 7 }}>OPS / LIVE MONITOR</div>
          <h1 style={{ margin: 0, fontSize: 28, letterSpacing: "-.03em" }}>Flight Operations Control</h1>
          <div className="muted" style={{ marginTop: 6, fontSize: 13 }}>
            Live ADS-B surveillance + aviation weather intelligence
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="badge badge-green"><Radio size={12} /> SYSTEM ONLINE</div>
          <button onClick={load} disabled={loading} style={{ background: "#10263d", color: "#dbeafe", border: "1px solid #24415e", borderRadius: 9, padding: "9px 12px", cursor: "pointer" }}>
            <RefreshCw size={15} style={{ verticalAlign: "middle", marginRight: 6 }} /> Refresh
          </button>
        </div>
      </header>

      {error && <div className="panel" style={{ padding: 13, marginBottom: 14, color: "#ff9b9b" }}><AlertTriangle size={15} style={{ verticalAlign: "middle", marginRight: 7 }} />{error}</div>}

      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 14 }}>
        <Stat icon={Plane} label="Tracked aircraft" value={flights.length || "—"} detail="OpenSky state vectors" />
        <Stat icon={Activity} label="Airborne" value={airborne || "—"} detail={`${climbing} climbing`} />
        <Stat icon={Gauge} label="High altitude" value={highAltitude || "—"} detail="Above 9,000 m" />
        <Stat icon={ShieldCheck} label="Data freshness" value={lastUpdated} detail={loading ? "Updating…" : "Last successful sync"} />
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 340px", gap: 14, minHeight: 590 }}>
        <div className="panel" style={{ overflow: "hidden", minHeight: 590 }}>
          <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(148,163,184,.12)" }}>
            <div>
              <div className="label">AIRSPACE</div>
              <strong>Live traffic map</strong>
            </div>
            <span className="muted" style={{ fontSize: 12 }}>North America view</span>
          </div>
          <div style={{ height: 530 }}><FlightMap flights={flights} /></div>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="panel" style={{ padding: 16 }}>
            <div className="label">AIRPORT WEATHER</div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input value={icao} onChange={(e) => setIcao(e.target.value.toUpperCase())} maxLength={4}
                style={{ flex: 1, background: "#081625", border: "1px solid #26425d", borderRadius: 8, padding: "9px 10px", color: "#fff", textTransform: "uppercase" }} />
              <button onClick={load} style={{ background: "#123554", border: 0, color: "#dff4ff", borderRadius: 8, padding: "0 12px", cursor: "pointer" }}>Load</button>
            </div>
            <div style={{ marginTop: 18, fontSize: 25, fontWeight: 800 }}>{icao}</div>
            <div className="muted" style={{ fontSize: 12, marginTop: 3 }}>NOAA Aviation Weather Center</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
              <div><div className="label">Flight cat</div><strong>{flightCategory}</strong></div>
              <div><div className="label">Wind</div><strong>{wind}</strong></div>
              <div><div className="label">Visibility</div><strong>{visibility ?? "—"}</strong></div>
              <div><div className="label">Temp</div><strong>{temp}</strong></div>
            </div>
          </div>

          <div className="panel" style={{ padding: 16, flex: 1 }}>
            <div className="label">OPERATIONAL QUEUE</div>
            <div style={{ marginTop: 12 }}>
              {flights.slice(0, 8).map((f) => (
                <div key={f.icao24} style={{ padding: "10px 0", borderBottom: "1px solid rgba(148,163,184,.09)", display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <strong style={{ fontSize: 13 }}>{f.callsign}</strong>
                    <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{f.country} · {f.icao24}</div>
                  </div>
                  <span className={f.onGround ? "badge badge-yellow" : "badge badge-green"}>{f.onGround ? "GROUND" : "AIRBORNE"}</span>
                </div>
              ))}
              {!flights.length && <div className="muted" style={{ padding: "30px 0", textAlign: "center" }}>Waiting for traffic data…</div>}
            </div>
          </div>

          <div className="panel" style={{ padding: 15, display: "flex", gap: 10, alignItems: "center" }}>
            <Cloud size={19} color="#5ec7ff" /><div><div className="label">DATA SOURCES</div><div style={{ fontSize: 12, marginTop: 3 }}>OpenSky · NOAA/AWC · FR24 adapter</div></div>
          </div>
        </aside>
      </section>

      <footer className="muted" style={{ fontSize: 11, padding: "18px 3px" }}>
        Portfolio project. Flight positions are surveillance data, not operational guidance. Respect each provider's terms, rate limits, and licensing.
      </footer>
    </main>
  );
}