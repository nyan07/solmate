import { keepPreviousData, useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Bounds } from "@/types/Bounds";
import type { PlaceSummary } from "@/features/places/types";
import { CACHE_FIRST_OPTIONS } from "@/features/places/hooks/cacheFirstOptions";
import { fetchNearbyPlaces } from "@/features/places/api";

const BOUNDS_DEBOUNCE_MS = 400;
const SNAP = 1000; // 0.001° ≈ 111 m at the equator

function snapBounds(b: Bounds) {
    return {
        north: Math.round(b.north * SNAP) / SNAP,
        south: Math.round(b.south * SNAP) / SNAP,
        east: Math.round(b.east * SNAP) / SNAP,
        west: Math.round(b.west * SNAP) / SNAP,
    };
}

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

    const snappedBounds = debouncedBounds ? snapBounds(debouncedBounds) : null;

    return useQuery({
        ...(cacheFirst ? CACHE_FIRST_OPTIONS : {}),
        queryKey: ["nearbyPlaces", snappedBounds, lang],
        queryFn: () =>
            snappedBounds ? fetchNearbyPlaces(snappedBounds, lang) : Promise.resolve([]),
        enabled: !!snappedBounds && enabled,
        placeholderData: keepPreviousData,
    });
};
