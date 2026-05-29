# ADR-002 — State Management Split

**Date:** 2025 (implemented, migrated to Zustand in `c26af50`)
**Status:** Active

## Decision

- **React Query** — all server-fetched data (places, detail)
- **Zustand** — view state only: viewport bounds/center, layout measurements, active filters, sunlit IDs, list scroll position

## Zustand store structure

Store at `src/features/explorer/state/` split into slices:

- `mapSlice` — viewport / camera
- `layoutSlice` — measured DOM dimensions
- `filtersSlice` — active filter values
- `sunlitSlice` — set of place IDs currently in sun
- `listUISlice` — list scroll position

Composed in `mapStore.ts`. Components import slice hooks (`useMapState`, `useLayout`, `useFilters`, `useSunlit`, `useListUI`), never `useMapStore` directly.

## Key commit

- `c26af50` — switch state management to Zustand
