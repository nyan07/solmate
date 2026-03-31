import { createContext, useContext, useState, type ReactNode } from "react";
import type { LatLng } from "../types/LatLng";

type MapContextType = {
    center: LatLng | null;
    setCenter: (center: LatLng) => void;
    cameraDistance: number | null;
    setCameraDistance: (distance: number) => void;
    topBarHeight: number;
    setTopBarHeight: (height: number) => void;
    listOpen: boolean;
    setListOpen: (open: boolean) => void;
    listScrollTop: number;
    setListScrollTop: (scrollTop: number) => void;
};

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider = ({ children }: { children: ReactNode }) => {
    const [center, setCenter] = useState<LatLng | null>(null);
    const [cameraDistance, setCameraDistance] = useState<number | null>(null);
    const [topBarHeight, setTopBarHeight] = useState(0);
    const [listOpen, setListOpen] = useState(false);
    const [listScrollTop, setListScrollTop] = useState(0);

    return (
        <MapContext.Provider
            value={{
                center,
                setCenter,
                cameraDistance,
                setCameraDistance,
                topBarHeight,
                setTopBarHeight,
                listOpen,
                setListOpen,
                listScrollTop,
                setListScrollTop,
            }}
        >
            {children}
        </MapContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useMapContext = () => {
    const context = useContext(MapContext);
    if (!context) throw new Error("useMapCenter must be used within a MapContext");
    return context;
};
