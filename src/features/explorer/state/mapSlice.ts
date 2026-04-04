import type { StateCreator } from "zustand";
import type { LatLng } from "@/types/LatLng";
import type { Bounds } from "@/types/Bounds";

export interface MapSlice {
    center: LatLng | null;
    bounds: Bounds | null;
    cameraDistance: number | null;
    setCenter: (center: LatLng) => void;
    setBounds: (bounds: Bounds) => void;
    setCameraDistance: (distance: number) => void;
}

export const createMapSlice: StateCreator<MapSlice> = (set) => ({
    center: null,
    bounds: null,
    cameraDistance: null,
    setCenter: (center) => set({ center }),
    setBounds: (bounds) => set({ bounds }),
    setCameraDistance: (cameraDistance) => set({ cameraDistance }),
});
