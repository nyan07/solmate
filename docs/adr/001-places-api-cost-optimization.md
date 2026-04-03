# ADR-001: Google Places API Cost Optimization

**Date:** 2026-04-03  
**Status:** Accepted

---

## Context

Arkie fetches nearby places (bars, cafes, restaurants) from Google Places API as the user navigates the 3D map. Every camera movement recalculates the viewport bounds and produces a new React Query key (`["nearbyPlaces", bounds, lang]`). Because bounds coordinates are floating-point precise, even a small pan creates a cache miss and triggers a new API call.

The Places API charges per request. Most place data (name, type, address, photo, opening hours schedule, outdoor seating) is effectively static — it does not change between user sessions or even between days. The fields that do change (`businessStatus`, open/closed derived from hours) change infrequently and are either computed client-side (open/closed status is derived from `openingHours` + current time) or rarely updated server-side (`businessStatus`).

Current cache settings:

- `staleTime: 5 minutes` — data refetched after 5 minutes even if bounds are the same
- `gcTime: 30 minutes` — entries evicted after 30 minutes of disuse
- No bounds quantization — floating-point coordinates mean cache hits almost never occur on pan/zoom

---

## Decision

Apply four layered optimizations, in priority order:

### 1. Debounce bounds updates (400 ms) ✅

Delay propagating new bounds to React Query until the camera has been idle for 400 ms. This prevents burst queries during a single pan or zoom gesture.

The debounce lives inside `useNearbyPlaces` rather than in `useMapCenter`. This keeps `bounds` in `MapContext` semantically correct (always the live viewport) and co-locates the debounce with the API cost it protects. During the debounce window, `keepPreviousData` retains the last successful result so existing pins stay visible; when the debounced bounds settle and new data arrives, `usePins` incrementally adds new pins and removes ones no longer in the response.

**Files affected:** `useNearbyPlaces.ts`

### 2. Snap bounds coordinates to a ~100 m grid ✅

Before building the React Query key, round each bound coordinate to 3 decimal places (`0.001°` ≈ 111 m at the equator). Small movements within the same cell reuse the existing cache entry.

The snap is applied after the debounce, inside `useNearbyPlaces`, as a pure inline helper (`snapBounds`). No shared utility was created — single use case doesn't warrant the abstraction.

The two optimizations compose in order: `bounds → debounce 400 ms → debouncedBounds → snap → snappedBounds → query key + API call`.

**Files affected:** `useNearbyPlaces.ts`

### 3. Set staleTime to Infinity ✅

Place data does not meaningfully change within a session. Setting `staleTime: Infinity` prevents background refetches for data that is already in cache.

The accepted risk: `businessStatus` (e.g. CLOSED_PERMANENTLY) could become stale. This is acceptable because:

- Such changes are rare (a place rarely closes during the user's session).
- The open/closed indicator shown to users is computed client-side from `openingHours` + current time, not from a live API field.
- Users can force-refresh by reloading the app.

**Files affected:** `cacheFirstOptions.ts`

### 4. Remove `Cache-Control: no-store` from the individual place endpoint

The `/api/places/[placeId]` edge function currently returns `Cache-Control: no-store`, disabling any CDN or browser caching. Removing this allows Vercel's edge network to cache individual place responses and reduces cold-start API calls.

**Files affected:** `api/places/[placeId]/index.js`

---

## Rejected Alternatives

### Tile-based fixed grid queries

Map the center to a tile ID (z/x/y) and query by tile instead of viewport bounds. Provides perfect cross-session deduplication and enables server-side caching per tile. Rejected because it requires stitching multi-tile results and adds significant complexity for a single-user app.

### Backend caching (Vercel KV / Redis)

Cache Google API responses at the edge keyed by snapped bounds. Eliminates Google charges even on cold cache. Rejected for now because it adds infrastructure cost and complexity; can be revisited if the app scales to multiple users.

### Persist React Query cache to localStorage

Survive page refreshes without re-fetching. Rejected because it requires a versioned cache invalidation strategy to prevent serving indefinitely stale data, and the benefit is marginal for the current usage pattern.

### Reduce MAX_CAMERA_DISTANCE

Lowering the altitude gate from 2000 m → 1000 m shrinks the viewport covered per query but does not reduce how often queries fire. The UX cost (pins disappearing sooner) outweighs the marginal savings.

---

## Consequences

- **Cost:** API calls reduced significantly for users who pan within a ~100 m radius of a previously queried area, and eliminated entirely during pan gestures (debounce).
- **Data freshness:** Place data may be up to one session old. `businessStatus` could be stale within a session. Acceptable given how rarely this field changes.
- **UX:** Pins appear ~400 ms after the camera stops moving (debounce delay). No other visible change.
- **Complexity:** Minimal — no new dependencies, no infrastructure changes. Four small, isolated edits.
