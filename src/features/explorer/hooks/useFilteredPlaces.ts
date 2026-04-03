import type { Bounds } from "@/types/Bounds";
import { useNearbyPlaces } from "./useNearbyPlaces";
import { useFilters } from "@/features/explorer/components/MapContext";
import type { PlaceSummary } from "@/features/places/types";

type Options = { enabled: boolean; cacheFirst?: boolean; lang?: string };

function applyFilters(places: PlaceSummary[], openOnly: boolean, outdoorSeatingOnly: boolean) {
    return places.filter((place) => {
        if (openOnly) {
            // openNow comes directly from Google's currentOpeningHours
            // undefined means no hours data — don't exclude
            if (place.openingHours?.openNow === false) return false;
        }
        if (outdoorSeatingOnly && !place.hasOutdoorSeating) return false;
        return true;
    });
}

export const useFilteredPlaces = (bounds: Bounds | null, options: Options) => {
    const { filters } = useFilters();
    const result = useNearbyPlaces(bounds, { ...options, lang: options.lang });

    return {
        ...result,
        data: result.data
            ? applyFilters(result.data, filters.openOnly, filters.outdoorSeatingOnly)
            : result.data,
    };
};
