# Arkie — Claude Code Guide

## What this project is

Arkie is a 3D map explorer for nearby restaurants, cafes, and bars. It combines a Cesium globe (OSM buildings + terrain, real-time sun lighting) with Google Places data. Users browse on a 3D map, filter by open status / outdoor seating, and tap places for details.

## Tech stack

| Layer           | Choice                                                     |
| --------------- | ---------------------------------------------------------- |
| Frontend        | React 19, TypeScript 5 (strict), Vite 7                    |
| 3D map          | Cesium 1.134 with OSM buildings + Cesium Ion terrain       |
| Server state    | TanStack React Query 5 (cache-first — see ADR-001)         |
| Client state    | Zustand 5 (`src/features/explorer/state/`)                 |
| Routing         | React Router v7 with `/:lang/places/:placeId` nesting      |
| Styling         | Tailwind CSS 4 with custom palette in `tailwind.config.js` |
| i18n            | i18next + react-i18next, `en` and `de` locales             |
| Animations      | Framer Motion                                              |
| Backend         | Vercel Edge Functions (JS) — 3 endpoints under `api/`      |
| External API    | Google Places API v1                                       |
| Testing         | Vitest + React Testing Library + MSW 2                     |
| E2E testing     | Playwright 1.59 + WebKit (iPhone 14 profile)               |
| Package manager | pnpm                                                       |

## How to run

```bash
pnpm install
# API calls need Vercel CLI so Edge Functions work locally:
npx vercel dev          # http://localhost:3000  ← use this, not pnpm dev
pnpm test               # Vitest (jsdom, MSW mocking)
pnpm test:e2e           # Playwright e2e — requires npx vercel dev running on :3001
pnpm build              # tsc -b && vite build
```

`pnpm dev` works for UI-only work but the `/api/*` proxy won't reach real Edge Functions.

## Required env vars

```
GOOGLE_PLACES_KEY=
VITE_GOOGLE_MAPS_MAP_ID=
VITE_CESIUM_ION=
VITE_SITE_URL=https://arkie.app
```

## Directory layout

```
src/
  features/
    explorer/   # Cesium map, camera hooks, sun tracking, pins
      state/    # Zustand store — mapStore.ts + one slice file per concern
      hooks/    # Logic hooks (usePins, useMapCenter, useFilteredPlaces, …)
      components/
    places/     # Place list, detail, hours, photos, API client
    profile/    # (future) favourites, settings
    auth/       # (future) login
    business/   # (future) verified places
  pages/        # Thin route components (ExplorerPage, WaitlistPage, …)
  components/   # Generic UI (Button, Switch, Tag, DatePicker, …)
  hooks/        # Shared hooks (useGeolocation, useClickOutside)
  utils/        # Geo math, opening hours, pin helpers
  i18n/         # i18next config + locale files
  mocks/        # MSW server + mock data (shared by tests)
api/
  places/
    nearby.js           # POST /api/places/nearby
    [placeId]/index.js  # GET  /api/places/[placeId]
    [placeId]/photos/[photoId].js
docs/adr/               # Architecture Decision Records
```

## Key architectural patterns

### State split

- **React Query** for all server-fetched data (places, details).
- **Zustand** (`src/features/explorer/state/`) for view state: viewport bounds/center, layout measurements, active filters, sunlit IDs, list scroll position. The store is split into one slice file per concern (`mapSlice`, `layoutSlice`, `filtersSlice`, `sunlitSlice`, `listUISlice`), composed in `mapStore.ts`. Import the slice hooks (`useMapState`, `useLayout`, `useFilters`, `useSunlit`, `useListUI`) from `@/features/explorer/state/mapStore` — never import `useMapStore` directly in components or feature hooks. Reset state between tests with `useMapStore.setState(initialState)` in `beforeEach`.

### Route structure

```
/                        → WaitlistPage
/:lang                   → language root (syncs i18next)
/:lang/places            → ExplorerPage + PlaceListOverlay
/:lang/places/:placeId   → ExplorerPage + PlaceDetailOverlay
```

The Cesium map stays mounted during overlay transitions (no unmount).

### Import style

Always use the `@/` alias (e.g. `@/features/places/types`). No relative parent imports — ESLint enforces this.

## API cost optimisation (ADR-001)

Every pan/zoom could trigger a Google Places API call. Four layers prevent this:

1. **Debounce** — `useNearbyPlaces` waits 400 ms after the last bounds change.
2. **Grid snap** — bounds are rounded to 0.001° (~100 m) before becoming the React Query key.
3. **`staleTime: Infinity`** — cached results are never considered stale; no background refetches.
4. **No `Cache-Control: no-store`** on the place detail Edge Function — Vercel can cache responses.

`CACHE_FIRST_OPTIONS` is exported from `src/features/places/hooks/` and applied to all place queries. Preserving these four layers is important; don't break them without updating ADR-001.

## Pre-commit hooks

Husky runs three checks on every commit (in order):

1. `pnpm lint-staged` — Prettier + ESLint on staged files
2. `pnpm tsc -b --noEmit` — full type-check
3. `pnpm test` — full test suite

Don't use `--no-verify` to skip them. If a hook fails, fix the underlying issue.

## Commit conventions

Use Conventional Commits for all commit messages.

Format:
`type(scope): summary`

Examples:

- `feat(places): add open-now filter chip`
- `fix(explorer): prevent Cesium camera reset on detail open`
- `refactor(api): extract Google Places request builder`
- `test(places): add regression coverage for hours parsing`
- `docs(adr): document cache-first query strategy`

Preferred types:

- `feat`
- `fix`
- `refactor`
- `perf`
- `test`
- `docs`
- `chore`

Preferred scopes:

- `explorer`
- `places`
- `api`
- `i18n`
- `ui`
- `build`
- `tests`
- `docs`

Rules:

- Keep the summary short and imperative
- Do not bundle unrelated changes into one commit

## Code conventions

- **Strict TypeScript** — unused vars/params are errors.
- **Prettier** — semicolons, double quotes, 4-space indent, 100-char line width.
- **No hardcoded UI strings** — all text goes through i18next keys.
- **Feature-scoped tests** — MSW handlers and mocks live inside `features/*/testing/`.
- **Opening hours** — always derive status via `@phoenix344/opening-hours`; don't reimplement the logic.
- **Geo math** — shared utilities live in `src/utils/geo/`; don't duplicate haversine or bounding-box logic.

## Change rules

- Prefer the smallest possible diff that solves the task.
- Do not refactor unrelated code.
- Do not rename files, routes, exports, or public component props unless required.
- Reuse existing hooks, utilities, and components before introducing new abstractions.
- Do not add new runtime dependencies without discussion. New devDependencies (test utilities, type stubs) are lower-risk but still need justification.
- Do not create new directories or reorganise the folder structure without discussing tradeoffs and getting explicit approval first.
- Preserve existing user-visible behavior unless the task explicitly asks for a change.
- Follow the existing folder structure; do not introduce new architectural patterns unless requested.

## Frontend / Edge Function boundaries

- Files under `api/` are server-only.
- Do not import from `api/` into `src/`.
- Do not expose secrets or privileged logic to the client.
- Shared code may be extracted only if it is safe in both browser and Edge runtimes.
- If sharing code, prefer `src/utils/` or a dedicated neutral shared location, not cross-imports between `src/` and `api/`.

## API contract rules

- Before changing an api/ response shape, find its corresponding type in `src/features/places/types.ts` and update both together.
- Prefer additive API changes over breaking changes.
- Keep JSON response shapes stable unless the task explicitly requires a breaking change.
- Preserve existing error response patterns and HTTP status semantics.

## Sensitive areas

Treat these as high-risk:

- `src/features/explorer/` — Cesium camera lifecycle, mount stability, sun lighting
- `src/features/places/hooks/` — query keys, debounce, cache policy
- `src/utils/geo/` — shared coordinate math
- `api/places/*` — Google Places request shape, caching, cost behavior
- i18n route handling under `/:lang/*`
- `src/App.tsx` — language detection, `/beta` redirect, and LangRoute sync
- `src/i18n/` — locale files; any new user-visible string needs keys in both `en` and `de`
- Anything that affects whether the Cesium map stays mounted during overlay transitions
- `src/components/SwipeUp/` — primary mobile interaction surface; iOS Safari scroll/animation behaviour is fragile (see E2E tests)

## Before finishing a task

Before considering a task complete:

1. Confirm only relevant files were changed
2. Ensure imports follow the `@/` alias rule
3. Check that no client/server boundary was violated
4. Preserve ADR-001 cache-first behavior unless the task explicitly changes it
5. Add keys for any new user-visible string to both `src/i18n/en.json` and `src/i18n/de.json`
6. Run all commands listed in "Pre-commit hooks" and `pnpm build`; include the result (or note why you couldn't)
7. Call out any risks, assumptions, or follow-ups

## E2E tests (Playwright + WebKit)

E2E tests live in `e2e/` and run against a full Vercel dev server on `:3001`.

**Why WebKit and not Chromium:** `SwipeUp` is the primary mobile interaction surface. Its iOS Safari bugs (rubber-band overscroll, `window.innerHeight` instability from browser chrome animation) are invisible to jsdom and Chromium. WebKit reproduces these faithfully.

**Running locally:**

```bash
npx vercel dev --listen 3001   # start the server first
pnpm test:e2e                  # then run tests
```

**Key conventions:**

- Use `devices["iPhone 14"]` for all touch/gesture tests.
- Prefer `page.clock.runFor()` over `waitForTimeout` for debounce assertions.
- Capture `trace` and `video` on first retry — both are configured automatically.
- E2E tests do NOT run in the pre-commit hook (too slow); run them manually before PRs that touch `SwipeUp` or gesture handling.

## UI invariants

- The Cesium map must remain mounted during list/detail overlay transitions.
- Avoid changes that recreate the Cesium viewer unnecessarily.
- Be cautious with effects that can reset camera state, reinitialize terrain/buildings, or trigger expensive rerenders.

## Deployment

Deployed on Vercel. Push to `main` triggers production deploy. Edge Functions in `api/` are auto-detected by Vercel's file-system routing.
