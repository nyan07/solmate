import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { Place } from "@/features/places/types";
import { CACHE_FIRST_OPTIONS } from "./cacheFirstOptions";
import { fetchPlace } from "@/features/places/api";

type UsePlaceOptions = {
    enabled: boolean;
    cacheFirst?: boolean;
    lang?: string;
};

export const usePlace = (
    id: string | undefined,
    { enabled, cacheFirst, lang = "en" }: UsePlaceOptions = { enabled: true, cacheFirst: false }
): UseQueryResult<Place> => {
    return useQuery({
        ...(cacheFirst ? CACHE_FIRST_OPTIONS : {}),
        queryKey: ["place", id, lang],
        queryFn: () => fetchPlace(id!, lang),
        enabled: !!id && enabled,
    });
};
