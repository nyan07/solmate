import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { LatLng } from "../../types/LatLng";
import type { PlaceSummary } from "../types/PlaceSummary";
import { CACHE_FIRST_OPTIONS } from "./cacheFirstOptions";
import { fetchNearbyPlaces } from "../api";

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
