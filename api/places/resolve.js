import { captureServerEvent, captureServerException } from "../_posthog.js";

export const config = {
    runtime: "edge",
};

/**
 * POST /api/places/resolve
 * Body: { name: string, latitude: number, longitude: number }
 * Returns: { placeId: string } or 404
 *
 * Used to resolve an OSM place name + coordinates to a Google Place ID so the
 * existing detail endpoint can be used for enrichment.
 */
export default async function POST(request) {
    try {
        const body = await request.json();
        const { name, latitude, longitude } = body;

        if (!name || latitude == null || longitude == null) {
            return error(400, "Missing name, latitude, or longitude");
        }

        const origin = request.headers.get("origin") || "";
        const host = request.headers.get("host") || "";

        // Google Places Text Search (New) — cheapest call that returns a Place ID
        const url = "https://places.googleapis.com/v1/places:searchText";
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": process.env.GOOGLE_PLACES_KEY,
                "X-Goog-FieldMask": "places.id",
                Referer: origin || `https://${host}`,
            },
            body: JSON.stringify({
                textQuery: name,
                locationBias: {
                    circle: {
                        center: { latitude, longitude },
                        radius: 100,
                    },
                },
                maxResultCount: 1,
            }),
        });

        if (!response.ok) {
            const body = await response.text();
            console.error("Places resolve error:", response.status, body);
            await captureServerEvent("place_resolve_error", {
                type: "upstream_error",
                status: response.status,
            });
            return error(502, "Upstream error resolving place");
        }

        const data = await response.json();
        const placeId = data.places?.[0]?.id;

        if (!placeId) {
            await captureServerEvent("place_resolve_not_found");
            return error(404, "Place not found");
        }

        await captureServerEvent("place_resolved", { place_id: placeId });

        return new Response(JSON.stringify({ placeId }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("Error in resolve endpoint:", err);
        await captureServerException(err, { endpoint: "place_resolve" });
        return error(500, "Internal server error");
    }
}

const error = (statusCode, message) => {
    return new Response(JSON.stringify({ error: message }), {
        status: statusCode,
        headers: { "Content-Type": "application/json" },
    });
};
