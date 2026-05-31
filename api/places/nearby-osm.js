import { captureServerEvent, captureServerException } from "../_posthog.js";

export const config = {
    runtime: "edge",
};

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

const amenityToType = {
    restaurant: "restaurant",
    cafe: "cafe",
    bar: "bar",
};

function parseOsmOpeningHours(ohStr) {
    if (!ohStr) return null;
    return { openNow: null, weekdayDescriptions: [ohStr] };
}

function parseOsmNode(node) {
    const tags = node.tags ?? {};
    const amenity = tags.amenity ?? "";
    const primaryType = amenityToType[amenity] ?? "restaurant";

    return {
        id: `osm:${node.id}`,
        displayName: tags.name ?? amenity,
        primaryType,
        primaryTypeDisplayName: tags.name ? amenity : undefined,
        editorialSummary: "",
        location: { latitude: node.lat, longitude: node.lon },
        hasOutdoorSeating: tags.outdoor_seating === "yes",
        photoUrl: "",
        openingHours: parseOsmOpeningHours(tags.opening_hours),
    };
}

export default async function POST(request) {
    try {
        const body = await request.json();
        const { north, south, east, west } = body;

        if (north == null || south == null || east == null || west == null) {
            return new Response(
                JSON.stringify({ error: "Missing bounds (north/south/east/west)" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        // Overpass QL bounding box: (south,west,north,east)
        const query = `[out:json][timeout:10];(node["amenity"~"^(restaurant|cafe|bar)$"](${south},${west},${north},${east}););out body;`;

        const response = await fetch(OVERPASS_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `data=${encodeURIComponent(query)}`,
        });

        if (response.status === 429) {
            await captureServerEvent("places_osm_error", { type: "rate_limit" });
            return new Response(JSON.stringify({ error: "Overpass rate limit" }), {
                status: 429,
                headers: { "Content-Type": "application/json" },
            });
        }

        console.log("Nearby: OSM", response.body);

        if (!response.ok) {
            await captureServerEvent("places_osm_error", {
                type: "upstream_error",
                status: response.status,
            });
            return new Response(JSON.stringify({ error: "Overpass error" }), {
                status: 502,
                headers: { "Content-Type": "application/json" },
            });
        }

        const data = await response.json();
        const places = (data.elements ?? [])
            .filter((el) => el.type === "node" && el.tags?.name)
            .slice(0, 50)
            .map(parseOsmNode);

        await captureServerEvent("places_osm_searched", { result_count: places.length });

        return new Response(JSON.stringify(places), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("Error calling Overpass API:", err);
        await captureServerException(err, { endpoint: "places_osm" });
        return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
