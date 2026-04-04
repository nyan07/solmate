import type { StateCreator } from "zustand";

export type PlaceFilters = {
    openOnly: boolean;
    outdoorSeatingOnly: boolean;
    sunnyOnly: boolean;
};

export interface FiltersSlice {
    filters: PlaceFilters;
    setFilters: (filters: PlaceFilters) => void;
}

export const createFiltersSlice: StateCreator<FiltersSlice> = (set) => ({
    filters: {
        openOnly: false,
        outdoorSeatingOnly: false,
        sunnyOnly: false,
    },
    setFilters: (filters) => set({ filters }),
});
