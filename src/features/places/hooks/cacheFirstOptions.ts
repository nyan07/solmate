/** React Query options for read-heavy resources that change infrequently. */
export const CACHE_FIRST_OPTIONS = {
    staleTime: Infinity, // place data is effectively static within a session
    gcTime: 30 * 60 * 1000, // keep in cache for 30 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
} as const;
