import type { Bounds } from "@/types/Bounds";
import type { Place, PlaceSummary } from "./types";

export const fetchPlace = async (id: string): Promise<Place> => {
    const res = await fetch(`/api/places/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
        console.error("fetchPlace failed", { id, status: res.status });
        throw new Error(`fetchPlace ${res.status}`);
    }
    return res.json() as Promise<Place>;
};

export const fetchNearbyPlaces = async (bounds: Bounds): Promise<PlaceSummary[]> => {
    const res = await fetch("/api/places/nearby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bounds),
    });
    if (!res.ok) {
        console.error("fetchNearbyPlaces failed", { status: res.status });
        throw new Error(`fetchNearbyPlaces ${res.status}`);
    }
    return (res.json() as Promise<PlaceSummary[]>) ?? [];
};
