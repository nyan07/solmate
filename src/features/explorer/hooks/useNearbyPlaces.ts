import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { LatLng } from "../../../types/LatLng";
import type { PlaceSummary } from "../../places/types";
import { CACHE_FIRST_OPTIONS } from "../../places/hooks/cacheFirstOptions";
import { fetchNearbyPlaces } from "../../places/api";

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
