# ✈️ Flight Operations Monitoring Dashboard

An airline-style **TechOps / Flight Operations Control dashboard** built around live aviation data.

This project is designed as a portfolio progression from a FinTech TechOps console into aviation operations: real-time monitoring, external APIs, operational status, weather context, data freshness, and incident-oriented UI.

## What it demonstrates

- Live ADS-B aircraft state monitoring
- Operational dashboard design
- Server-side API proxying (credentials never exposed to the browser)
- Aviation weather integration
- Auto-refresh and data freshness
- Interactive airspace map
- Provider abstraction for adding more data sources
- Error states and degraded-data handling
- TypeScript + Next.js + React

## Data sources

### OpenSky Network
Primary live aircraft-position source. The app uses the REST API and supports optional OAuth2 client credentials.

OpenSky states that its API can be used for personal/non-profit applications within its limits; commercial use requires consent. Review the current terms before deploying commercially.

### NOAA / AviationWeather.gov
Used for airport METAR data. The Aviation Weather Center's current Data API provides METAR, TAF, SIGMET and other aviation-weather products.

### FlightRadar24
Included as an optional adapter. **Current FR24 API access requires a paid subscription**; it is not a free public API tier. FR24 provides a sandbox for development/testing.

The app intentionally does not depend on FR24, so the project remains runnable with free/public data.

## Architecture

```text
                    ┌─────────────────────┐
                    │     Next.js UI      │
                    │  Ops control room   │
                    └──────────┬──────────┘
                               │
                    Server-side API routes
                               │
             ┌─────────────────┼─────────────────┐
             ▼                 ▼                 ▼
       OpenSky API       AviationWeather.gov   FR24 API
       ADS-B states            METAR           optional
             │                 │                 │
             └─────────────────┼─────────────────┘
                               ▼
                       Normalized UI model
```

## Quick start

```bash
git clone <your-repo-url>
cd flight-ops-monitor
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

No API key is required to start. Add OpenSky OAuth credentials if you have them.

## Environment variables

```env
OPENSKY_CLIENT_ID=
OPENSKY_CLIENT_SECRET=

FR24_API_TOKEN=
FR24_API_BASE=https://fr24api.flightradar24.com/api

DEFAULT_ICAO=KJFK
```

Never commit `.env.local`.


## Suggested next architecture

When the MVP is stable, split the ingestion layer:

```text
providers/
  opensky.ts
  aviationWeather.ts
  fr24.ts

domain/
  flight.ts
  alert.ts
  airport.ts

services/
  flightNormalizer.ts
  alertEngine.ts
  providerHealth.ts
```

Then persist normalized events:

```text
PostgreSQL
  ├── flights
  ├── flight_positions
  ├── airports
  ├── weather_observations
  ├── alerts
  └── incidents
```

## Important

This is a portfolio/engineering project, not an operational aviation system. Do not use it for flight dispatch, navigation, separation, safety-critical decisions, or other operational purposes.

Review the current terms and rate limits of every upstream provider before public/commercial deployment.
