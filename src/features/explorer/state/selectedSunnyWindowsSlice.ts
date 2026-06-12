import type { StateCreator } from "zustand";
import type { SunnyWindow } from "@/features/places/types";

export interface SelectedSunnyWindowsSlice {
    selectedSunnyWindows: SunnyWindow[] | null;
    setSelectedSunnyWindows: (windows: SunnyWindow[] | null) => void;
}

export const createSelectedSunnyWindowsSlice: StateCreator<SelectedSunnyWindowsSlice> = (
    set
) => ({
    selectedSunnyWindows: null,
    setSelectedSunnyWindows: (windows) => set({ selectedSunnyWindows: windows }),
});
