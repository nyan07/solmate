# ADR-001 — Cache-First Query Strategy

**Date:** 2025 (implemented)
**Status:** Active

## Context

Every map pan/zoom could trigger a Google Places API call, which is expensive. The app fetches nearby places on every viewport change.

## Decision

Four layers prevent unnecessary API calls:

1. **Debounce** — `useNearbyPlaces` waits 400ms after the last bounds change
2. **Grid snap** — bounds rounded to 0.001° (~100m) before becoming the React Query key
3. **`staleTime: Infinity`** — cached results never considered stale; no background refetches
4. **No `Cache-Control: no-store`** on place detail Edge Function — Vercel can cache responses

`CACHE_FIRST_OPTIONS` exported from `src/features/places/hooks/` and applied to all place queries.

## Commits

- `3da6281` — debounce nearby places query
- `a82e8d5` — snap bounds to ~100m grid
- `4a88e1d` — set staleTime to Infinity
- `8236094` — remove Cache-Control: no-store from place detail endpoint

## Consequences

Do not break these four layers without updating this ADR and `docs/adr/ADR-001`.
