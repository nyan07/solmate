import { keepPreviousData, useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Bounds } from "@/types/Bounds";
import type { PlaceSummary } from "@/features/places/types";
import { CACHE_FIRST_OPTIONS } from "@/features/places/hooks/cacheFirstOptions";
import { fetchNearbyPlaces } from "@/features/places/api";

const BOUNDS_DEBOUNCE_MS = 400;

type UseNearbyPlacesOptions = {
    enabled: boolean;
    cacheFirst?: boolean;
    lang?: string;
};

export const useNearbyPlaces = (
    bounds: Bounds | null,
    { enabled, cacheFirst, lang = "en" }: UseNearbyPlacesOptions = {
        enabled: true,
        cacheFirst: false,
    }
): UseQueryResult<PlaceSummary[]> => {
    const [debouncedBounds, setDebouncedBounds] = useState(bounds);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedBounds(bounds), BOUNDS_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [bounds]);

    return useQuery({
        ...(cacheFirst ? CACHE_FIRST_OPTIONS : {}),
        queryKey: ["nearbyPlaces", debouncedBounds, lang],
        queryFn: () =>
            debouncedBounds ? fetchNearbyPlaces(debouncedBounds, lang) : Promise.resolve([]),
        enabled: !!debouncedBounds && enabled,
        placeholderData: keepPreviousData,
    });
};
