import type { Bounds } from "@/types/Bounds";
import type { LatLng } from "@/types/LatLng";
import type { Place, PlaceSummary } from "./types";

export const fetchPlace = async (id: string, lang = "en"): Promise<Place> => {
    const res = await fetch(`/api/places/${id}?lang=${lang}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
        console.error("fetchPlace failed", { id, status: res.status });
        throw new Error(`fetchPlace ${res.status}`);
    }
    return res.json() as Promise<Place>;
};

export const fetchNearbyPlaces = async (bounds: Bounds, lang = "en"): Promise<PlaceSummary[]> => {
    const res = await fetch("/api/places/nearby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...bounds, lang }),
    });
    if (!res.ok) {
        console.error("fetchNearbyPlaces failed", { status: res.status });
        throw new Error(`fetchNearbyPlaces ${res.status}`);
    }
    return (res.json() as Promise<PlaceSummary[]>) ?? [];
};

export const fetchNearbyPlacesOSM = async (
    bounds: Bounds,
    lang = "en"
): Promise<PlaceSummary[]> => {
    const res = await fetch("/api/places/nearby-osm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...bounds, lang }),
    });
    if (!res.ok) {
        console.error("fetchNearbyPlacesOSM failed", { status: res.status });
        throw new Error(`fetchNearbyPlacesOSM ${res.status}`);
    }
    return (res.json() as Promise<PlaceSummary[]>) ?? [];
};

export const resolveGooglePlaceId = async (
    name: string,
    location: LatLng
): Promise<string | null> => {
    const res = await fetch("/api/places/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, latitude: location.latitude, longitude: location.longitude }),
    });
    if (res.status === 404) return null;
    if (!res.ok) {
        console.error("resolveGooglePlaceId failed", { status: res.status });
        return null;
    }
    const data = (await res.json()) as { placeId: string };
    return data.placeId ?? null;
};
