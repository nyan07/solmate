import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { Place } from "../types/Place";
import { CACHE_FIRST_OPTIONS } from "./cacheFirstOptions";
import { fetchPlace } from "../api";

type UsePlaceOptions = {
    enabled: boolean;
    cacheFirst?: boolean;
};

export const usePlace = (
    id: string | undefined,
    { enabled, cacheFirst }: UsePlaceOptions = { enabled: true, cacheFirst: false }
): UseQueryResult<Place> => {
    return useQuery({
        ...(cacheFirst ? CACHE_FIRST_OPTIONS : {}),
        queryKey: ["place", id],
        queryFn: () => fetchPlace(id!),
        enabled: !!id && enabled,
    });
};
