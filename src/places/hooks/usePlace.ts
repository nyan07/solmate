import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import type { Place } from "../types/Place";

export const fetchPlace = async (
    id: string | undefined
): Promise<Place> => {
    const res = await fetch(`/api/places/${id}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });

    const data = await res.json();
    return data as Place;
};

type UsePlaceOptions = {
    enabled: boolean,
    cacheFirst?: boolean,
}

export const usePlace = (id: string | undefined, { enabled, cacheFirst }: UsePlaceOptions = { enabled: true, cacheFirst: false }): UseQueryResult<Place | null> => {
    const cacheOptions = cacheFirst ?
        {
            staleTime: Infinity,
            cacheTime: Infinity,
            refetchOnMount: false,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchInterval: 0,
        } : {};

    return useQuery({
        ...cacheOptions,
        queryKey: ["place", id],
        queryFn: () =>
            location
                ? fetchPlace(id)
                : Promise.resolve(null),
        enabled: !!id && enabled,
    });
};
