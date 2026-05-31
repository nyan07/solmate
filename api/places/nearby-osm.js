export const config = {
    runtime: "edge",
};

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

const POSTHOG_HOST = "https://eu.i.posthog.com";

function captureServerEvent(token, event, properties) {
    if (!token) return;
    // fire-and-forget — no await needed
    fetch(`${POSTHOG_HOST}/capture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            api_key: token,
            event,
            properties: { distinct_id: "server", ...properties },
        }),
    }).catch(() => {});
}

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
    const phToken = process.env.VITE_PUBLIC_POSTHOG_TOKEN;

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
            captureServerEvent(phToken, "places_osm_error", { type: "rate_limit" });
            return new Response(JSON.stringify({ error: "Overpass rate limit" }), {
                status: 429,
                headers: { "Content-Type": "application/json" },
            });
        }

        if (!response.ok) {
            captureServerEvent(phToken, "places_osm_error", {
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
            .map(parseOsmNode);

        return new Response(JSON.stringify(places), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("Error calling Overpass API:", err);
        return new Response(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
