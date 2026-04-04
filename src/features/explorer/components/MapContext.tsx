import { createContext, useContext, useState, type ReactNode } from "react";
import type { LatLng } from "@/types/LatLng";
import type { Bounds } from "@/types/Bounds";

// ─── Map State ────────────────────────────────────────────────────────────────

type MapStateContextType = {
    center: LatLng | null;
    setCenter: (center: LatLng) => void;
    bounds: Bounds | null;
    setBounds: (bounds: Bounds) => void;
    cameraDistance: number | null;
    setCameraDistance: (distance: number) => void;
};

const MapStateContext = createContext<MapStateContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useMapState = () => {
    const ctx = useContext(MapStateContext);
    if (!ctx) throw new Error("useMapState must be used within MapProvider");
    return ctx;
};

// ─── Layout ───────────────────────────────────────────────────────────────────

type LayoutContextType = {
    topBarHeight: number;
    setTopBarHeight: (height: number) => void;
};

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useLayout = () => {
    const ctx = useContext(LayoutContext);
    if (!ctx) throw new Error("useLayout must be used within MapProvider");
    return ctx;
};

// ─── Filters ──────────────────────────────────────────────────────────────────

export type PlaceFilters = {
    openOnly: boolean;
    outdoorSeatingOnly: boolean;
    sunnyOnly: boolean;
};

type FiltersContextType = {
    filters: PlaceFilters;
    setFilters: (filters: PlaceFilters) => void;
};

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useFilters = () => {
    const ctx = useContext(FiltersContext);
    if (!ctx) throw new Error("useFilters must be used within MapProvider");
    return ctx;
};

// ─── Sunlit State ─────────────────────────────────────────────────────────────

type SunlitContextType = {
    sunlitIds: Set<string>;
    setSunlitIds: (ids: Set<string>) => void;
};

const SunlitContext = createContext<SunlitContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useSunlit = () => {
    const ctx = useContext(SunlitContext);
    if (!ctx) throw new Error("useSunlit must be used within MapProvider");
    return ctx;
};

// ─── List UI ──────────────────────────────────────────────────────────────────

type ListUIContextType = {
    listOpen: boolean;
    setListOpen: (open: boolean) => void;
    listScrollTop: number;
    setListScrollTop: (scrollTop: number) => void;
};

const ListUIContext = createContext<ListUIContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useListUI = () => {
    const ctx = useContext(ListUIContext);
    if (!ctx) throw new Error("useListUI must be used within MapProvider");
    return ctx;
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const MapProvider = ({ children }: { children: ReactNode }) => {
    const [center, setCenter] = useState<LatLng | null>(null);
    const [bounds, setBounds] = useState<Bounds | null>(null);
    const [cameraDistance, setCameraDistance] = useState<number | null>(null);
    const [topBarHeight, setTopBarHeight] = useState(0);
    const [listOpen, setListOpen] = useState(false);
    const [listScrollTop, setListScrollTop] = useState(0);
    const [filters, setFilters] = useState<PlaceFilters>({
        openOnly: false,
        outdoorSeatingOnly: false,
        sunnyOnly: false,
    });
    const [sunlitIds, setSunlitIds] = useState<Set<string>>(new Set());

    return (
        <MapStateContext.Provider
            value={{ center, setCenter, bounds, setBounds, cameraDistance, setCameraDistance }}
        >
            <LayoutContext.Provider value={{ topBarHeight, setTopBarHeight }}>
                <FiltersContext.Provider value={{ filters, setFilters }}>
                    <SunlitContext.Provider value={{ sunlitIds, setSunlitIds }}>
                        <ListUIContext.Provider
                            value={{ listOpen, setListOpen, listScrollTop, setListScrollTop }}
                        >
                            {children}
                        </ListUIContext.Provider>
                    </SunlitContext.Provider>
                </FiltersContext.Provider>
            </LayoutContext.Provider>
        </MapStateContext.Provider>
    );
};
