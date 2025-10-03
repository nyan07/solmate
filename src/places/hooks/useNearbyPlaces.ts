import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { LatLng } from "../../types/LatLng";
import type { PlaceSummary } from "../types/PlaceSummary";

export const fetchNearbyPlaces = async (
    location: LatLng,
    radius = 500
): Promise<PlaceSummary[]> => {
    try {
        const res = await fetch("/api/places/nearby", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ latitude: location.lat, longitude: location.lng, radius }),
        });

        const data = await res.json();
        if (!data.places) return [];

        return data.places as PlaceSummary[];
    } catch (err) {
        console.error("fetchNearbyPlaces error:", err);
        return [];
    }
};



export const useNearbyPlaces = (location: LatLng | null, {enabled }:{ enabled: boolean } = { enabled: true } ): UseQueryResult<PlaceSummary[]> => {
    return useQuery({
        queryKey: ["nearbyPlaces", location],
        queryFn: () =>
            location
                ? fetchNearbyPlaces(location)
                : Promise.resolve([]),
        enabled: !!location && enabled,
    });
};
