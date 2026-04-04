# Arkie

A React + TypeScript app with a Cesium 3D map and nearby places discovery, backed by Vercel Edge Functions.

## Prerequisites

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/)
- [Vercel CLI](https://vercel.com/docs/cli) — required to run the API locally

## Setup

```bash
pnpm install
```

Create a `.env` file at the root with the required keys:

```env
GOOGLE_PLACES_KEY=your_google_places_api_key
```

## Development

The frontend and API must be run together using the Vercel CLI, which serves both the Vite dev server and the Edge Functions under `/api`.

```bash
npx vercel dev
```

This starts:

- The frontend (Vite) at `http://localhost:3000`
- The API Edge Functions at `http://localhost:3000/api/*`

> The `vercel dev` command reads `vercel.json` for routing and injects environment variables from `.env` or your linked Vercel project.

## API

The `api/` folder contains Vercel Edge Functions:

| Route                          | Method | Description                                                                       |
| ------------------------------ | ------ | --------------------------------------------------------------------------------- |
| `/api/places/nearby`           | POST   | Find nearby restaurants, cafes, and bars given `{ latitude, longitude, radius? }` |
| `/api/places/[placeId]`        | GET    | Get details for a specific place                                                  |
| `/api/places/[placeId]/photos` | GET    | Get photos for a specific place                                                   |

## Project Structure

```
src/
├── pages/                        # Thin routing layer — one file per route, no business logic
│   ├── ExplorerPage.tsx          # Mounts ExplorerView + nested overlay routes
│   └── WaitlistPage.tsx
│
├── features/                     # Self-contained product domains
│   ├── explorer/                 # 3D map, nearby discovery, search, filters, weather
│   │   ├── components/           # ExplorerView, PlaceListOverlay, PlaceDetailOverlay, …
│   │   ├── hooks/                # useBuildings, usePins, useSunDirection, useSunTimes, useNearbyPlaces, …
│   │   ├── state/                # Zustand store — mapStore.ts + one slice per concern
│   │   ├── testing/              # MSW handlers + mock factories (test-only)
│   │   ├── types.ts              # Building
│   │   └── constants.ts
│   ├── places/                   # Place detail, check-in, rating, sharing, verified status
│   │   ├── components/           # PlaceItem, PlaceMeta, PlaceStatus, DaylightBar, …
│   │   ├── hooks/                # usePlace, useSunnyHours, cacheFirstOptions
│   │   ├── testing/
│   │   ├── types.ts              # Place, PlaceSummary, PlaceTypes, PlaceStatuses, …
│   │   └── api.ts
│   ├── waitlist/                 # Pre-launch landing page
│   │   └── components/
│   ├── auth/                     # Login, register, sessions (future)
│   ├── profile/                  # Favourites, notifications, settings (future)
│   ├── business/                 # Business portal, verified place management (future)
│   └── legal/                    # T&C, privacy policy (future)
│
├── components/                   # Generic, reusable UI — no business logic
│   └── <Component>/index.tsx
│
├── hooks/                        # Shared hooks used across features
│   └── useGeolocation.ts
│
├── utils/
│   ├── geo/                      # Shared geo primitives (calculateDistance, getBoundingBox, …)
│   ├── openingHours.ts
│   ├── getText.ts
│   └── addPins.ts
│
├── types/
│   └── LatLng.ts                 # Shared coordinate type
│
└── testUtils/
    └── setup.ts
```

### Route structure

```
/                         → WaitlistPage
/explore                  → ExplorerPage (map always mounted)
/explore/places           → ExplorerPage + PlaceListOverlay
/explore/places/:id       → ExplorerPage + PlaceDetailOverlay
```

Overlay routes (`/explore/*`) use React Router nested routes with `<Outlet />` so the Cesium map never unmounts during navigation.

## Build

```bash
pnpm build
```

## Deploy

```bash
npx vercel deploy
```
