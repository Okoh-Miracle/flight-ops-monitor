"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type Flight = {
  icao24: string;
  callsign: string;
  country: string;
  lat: number;
  lon: number;
  altitude: number | null;
  velocity: number | null;
  heading: number | null;
  verticalRate: number | null;
  onGround: boolean | null;
};

export default function Map({ flights }: { flights: Flight[] }) {
  return (
    <MapContainer center={[39.2, -96]} zoom={4} style={{ height: "100%", width: "100%", background: "#091524" }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {flights.map((f) => (
        <CircleMarker
          key={f.icao24}
          center={[f.lat, f.lon]}
          radius={5}
          pathOptions={{ color: f.onGround ? "#64748b" : "#38bdf8", fillOpacity: .85 }}
        >
          <Popup>
            <strong>{f.callsign}</strong><br />
            {f.country}<br />
            Alt: {f.altitude ? `${Math.round(f.altitude)} m` : "—"}<br />
            Speed: {f.velocity ? `${Math.round(f.velocity * 1.944)} kt` : "—"}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}