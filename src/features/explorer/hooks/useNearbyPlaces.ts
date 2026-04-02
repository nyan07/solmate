import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { Bounds } from "@/types/Bounds";
import type { PlaceSummary } from "@/features/places/types";
import { CACHE_FIRST_OPTIONS } from "@/features/places/hooks/cacheFirstOptions";
import { fetchNearbyPlaces } from "@/features/places/api";

type UseNearbyPlacesOptions = {
    enabled: boolean;
    cacheFirst?: boolean;
};

export const useNearbyPlaces = (
    bounds: Bounds | null,
    { enabled, cacheFirst }: UseNearbyPlacesOptions = { enabled: true, cacheFirst: false }
): UseQueryResult<PlaceSummary[]> => {
    return useQuery({
        ...(cacheFirst ? CACHE_FIRST_OPTIONS : {}),
        queryKey: ["nearbyPlaces", bounds],
        queryFn: () => (bounds ? fetchNearbyPlaces(bounds) : Promise.resolve([])),
        enabled: !!bounds && enabled,
    });
};
