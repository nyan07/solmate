import type { StateCreator } from "zustand";

export interface LayoutSlice {
    topBarHeight: number;
    setTopBarHeight: (height: number) => void;
}

export const createLayoutSlice: StateCreator<LayoutSlice> = (set) => ({
    topBarHeight: 0,
    setTopBarHeight: (topBarHeight) => set({ topBarHeight }),
});
