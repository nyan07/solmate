/** React Query options for treating cached data as always fresh (read-heavy resources). */
export const CACHE_FIRST_OPTIONS = {
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: 0,
} as const;
