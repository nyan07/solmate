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

| Route | Method | Description |
|---|---|---|
| `/api/places/nearby` | POST | Find nearby restaurants, cafes, and bars given `{ latitude, longitude, radius? }` |
| `/api/places/[placeId]` | GET | Get details for a specific place |
| `/api/places/[placeId]/photos` | GET | Get photos for a specific place |

## Build

```bash
pnpm build
```

## Deploy

```bash
npx vercel deploy
```
