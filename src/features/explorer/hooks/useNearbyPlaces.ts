import { keepPreviousData, useQuery, type UseQueryResult } from "@tanstack/react-query";
import posthog from "posthog-js";
import { useEffect, useState } from "react";
import type { Bounds } from "@/types/Bounds";
import type { PlaceSummary } from "@/features/places/types";
import { CACHE_FIRST_OPTIONS } from "@/features/places/hooks/cacheFirstOptions";
import { fetchNearbyPlaces, fetchNearbyPlacesOSM } from "@/features/places/api";
import { trackEvent } from "@/utils/analytics";

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

function boundsAreaKm2(b: Bounds): number {
    const latKm = (b.north - b.south) * 111;
    const midLat = (b.north + b.south) / 2;
    const lngKm = (b.east - b.west) * 111 * Math.cos((midLat * Math.PI) / 180);
    return Math.abs(latKm * lngKm);
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

    // PostHog experiment: "places-source" variants are "google" (control) and "osm" (test)
    const placesSource = posthog.getFeatureFlag("places-source") ?? "google";
    const isOSM = placesSource === "osm";
    const fetchFn = isOSM ? fetchNearbyPlacesOSM : fetchNearbyPlaces;

    return useQuery({
        ...(cacheFirst ? CACHE_FIRST_OPTIONS : {}),
        queryKey: ["nearbyPlaces", snappedBounds, lang, placesSource],
        queryFn: async () => {
            if (!snappedBounds) return [];
            const results = await fetchFn(snappedBounds, lang);

            const typeDistribution = results.reduce(
                (acc, p) => {
                    acc[p.primaryType] = (acc[p.primaryType] ?? 0) + 1;
                    return acc;
                },
                {} as Record<string, number>
            );

            trackEvent("places_loaded", {
                source: isOSM ? "osm" : "google",
                count: results.length,
                type_distribution: typeDistribution,
                bounds_area_km2: boundsAreaKm2(snappedBounds),
            });

            return results;
        },
        enabled: !!snappedBounds && enabled,
        placeholderData: keepPreviousData,
    });
};
