import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { Place } from "../types/Place";
import { CACHE_FIRST_OPTIONS } from "./cacheFirstOptions";

export const fetchPlace = async (id: string | undefined): Promise<Place> => {
    const res = await fetch(`/api/places/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    return data as Place;
};

type UsePlaceOptions = {
    enabled: boolean;
    cacheFirst?: boolean;
};

export const usePlace = (
    id: string | undefined,
    { enabled, cacheFirst }: UsePlaceOptions = { enabled: true, cacheFirst: false }
): UseQueryResult<Place | null> => {
    return useQuery({
        ...(cacheFirst ? CACHE_FIRST_OPTIONS : {}),
        queryKey: ["place", id],
        queryFn: () => fetchPlace(id),
        enabled: !!id && enabled,
    });
};
