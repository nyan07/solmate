import type { Bounds } from "@/types/Bounds";
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
