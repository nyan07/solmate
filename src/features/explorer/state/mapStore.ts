import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { createMapSlice, type MapSlice } from "./mapSlice";
import { createLayoutSlice, type LayoutSlice } from "./layoutSlice";
import { createFiltersSlice, type FiltersSlice } from "./filtersSlice";
import { createSunlitSlice, type SunlitSlice } from "./sunlitSlice";
import { createListUISlice, type ListUISlice } from "./listUISlice";

export type { PlaceFilters } from "./filtersSlice";

type MapStore = MapSlice & LayoutSlice & FiltersSlice & SunlitSlice & ListUISlice;

export const useMapStore = create<MapStore>()((...a) => ({
    ...createMapSlice(...a),
    ...createLayoutSlice(...a),
    ...createFiltersSlice(...a),
    ...createSunlitSlice(...a),
    ...createListUISlice(...a),
}));

export const useMapState = () =>
    useMapStore(
        useShallow((s) => ({
            center: s.center,
            bounds: s.bounds,
            cameraDistance: s.cameraDistance,
            setCenter: s.setCenter,
            setBounds: s.setBounds,
            setCameraDistance: s.setCameraDistance,
        }))
    );

export const useLayout = () =>
    useMapStore(
        useShallow((s) => ({
            topBarHeight: s.topBarHeight,
            setTopBarHeight: s.setTopBarHeight,
            swipeUpExpanded: s.swipeUpExpanded,
            setSwipeUpExpanded: s.setSwipeUpExpanded,
        }))
    );

export const useFilters = () =>
    useMapStore(
        useShallow((s) => ({
            filters: s.filters,
            setFilters: s.setFilters,
        }))
    );

export const useSunlit = () =>
    useMapStore(
        useShallow((s) => ({
            sunlitIds: s.sunlitIds,
            setSunlitIds: s.setSunlitIds,
        }))
    );

export const useListUI = () =>
    useMapStore(
        useShallow((s) => ({
            listOpen: s.listOpen,
            setListOpen: s.setListOpen,
            listScrollTop: s.listScrollTop,
            setListScrollTop: s.setListScrollTop,
        }))
    );
