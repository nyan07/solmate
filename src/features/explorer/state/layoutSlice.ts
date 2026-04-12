import type { StateCreator } from "zustand";

export interface LayoutSlice {
    topBarHeight: number;
    setTopBarHeight: (height: number) => void;
    swipeUpExpanded: boolean;
    setSwipeUpExpanded: (expanded: boolean) => void;
}

export const createLayoutSlice: StateCreator<LayoutSlice> = (set) => ({
    topBarHeight: 0,
    setTopBarHeight: (topBarHeight) => set({ topBarHeight }),
    swipeUpExpanded: false,
    setSwipeUpExpanded: (swipeUpExpanded) => set({ swipeUpExpanded }),
});
