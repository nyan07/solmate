import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { LatLng } from "../../types/LatLng";
import type { PlaceSummary } from "../types/PlaceSummary";
import { CACHE_FIRST_OPTIONS } from "./cacheFirstOptions";

export const fetchNearbyPlaces = async (
    location: LatLng,
    radius = 500
): Promise<PlaceSummary[]> => {
    try {
        const res = await fetch("/api/places/nearby", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                latitude: location.latitude,
                longitude: location.longitude,
                radius,
            }),
        });

        const data = await res.json();
        if (!data) return [];

        return data as PlaceSummary[];
    } catch (err) {
        console.error("fetchNearbyPlaces error:", err);
        return [];
    }
};

type UseNearbyPlacesOptions = {
    enabled: boolean;
    cacheFirst?: boolean;
};

export const useNearbyPlaces = (
    location: LatLng | null,
    { enabled, cacheFirst }: UseNearbyPlacesOptions = { enabled: true, cacheFirst: false }
): UseQueryResult<PlaceSummary[]> => {
    return useQuery({
        ...(cacheFirst ? CACHE_FIRST_OPTIONS : {}),
        queryKey: ["nearbyPlaces", location],
        queryFn: () => (location ? fetchNearbyPlaces(location) : Promise.resolve([])),
        enabled: !!location && enabled,
    });
};
