# PostHog post-wizard report

The wizard has completed a deep integration of PostHog server-side event tracking into Arkie's Vercel Edge Function API routes. A shared `api/_posthog.js` helper was created using `posthog-node` (configured with `flushAt: 1` and `flushInterval: 0` for immediate event dispatch in serverless environments). Events and exception capture were added to all four API endpoints. The existing manual `captureServerEvent` implementation in `nearby-osm.js` was replaced with the shared helper and extended with a success event. All PostHog keys reference environment variables — no values are hardcoded.

| Event                     | Description                                                                                                | File                            |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `places_nearby_searched`  | Google Places nearby search succeeded. Properties: `result_count`, `center_lat`, `center_lng`, `radius_m`. | `api/places/nearby.js`          |
| `places_nearby_error`     | Google Places nearby search failed. Properties: `type`.                                                    | `api/places/nearby.js`          |
| `place_detail_viewed`     | Place detail successfully fetched. Properties: `place_id`, `lang`.                                         | `api/places/[placeId]/index.js` |
| `place_detail_error`      | Place detail fetch failed. Properties: `place_id`, `status`.                                               | `api/places/[placeId]/index.js` |
| `place_resolved`          | OSM place name resolved to a Google Place ID. Properties: `place_id`.                                      | `api/places/resolve.js`         |
| `place_resolve_not_found` | OSM-to-Google resolution returned no result.                                                               | `api/places/resolve.js`         |
| `place_resolve_error`     | OSM-to-Google resolution encountered an upstream or internal error. Properties: `type`, `status`.          | `api/places/resolve.js`         |
| `places_osm_searched`     | OSM Overpass search succeeded. Properties: `result_count`.                                                 | `api/places/nearby-osm.js`      |
| `places_osm_error`        | OSM Overpass search failed. Properties: `type`, `status` (pre-existing, migrated to shared helper).        | `api/places/nearby-osm.js`      |

Exception capture (`captureException`) is also wired into every `catch` block across all four endpoints.

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/714796)
- [Place searches over time](/insights/byrvGhnt)
- [Place detail views over time](/insights/uCzck7jr)
- [User engagement actions](/insights/givdRgRy)
- [API errors over time](/insights/YLTIzr72)
- [Map interactions](/insights/JpVAiQCI)

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
