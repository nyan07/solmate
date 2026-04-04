import type { StateCreator } from "zustand";

export interface SunlitSlice {
    sunlitIds: Set<string>;
    setSunlitIds: (ids: Set<string>) => void;
}

export const createSunlitSlice: StateCreator<SunlitSlice> = (set) => ({
    sunlitIds: new Set(),
    setSunlitIds: (sunlitIds) => set({ sunlitIds }),
});
