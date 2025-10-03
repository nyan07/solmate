import { createContext, useContext, useState, type ReactNode } from "react";
import type { LatLng } from "../types/LatLng";

type MapContextType = {
  center: LatLng | null;
  setCenter: (center: LatLng) => void;
  cameraDistance: number | null;
  setCameraDistance: (distance: number) => void;
};

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider = ({ children }: { children: ReactNode }) => {
  const [center, setCenter] = useState<LatLng | null>(null);
  const [cameraDistance, setCameraDistance] = useState<number | null>(null);

  return (
    <MapContext.Provider value={{ center, setCenter, cameraDistance, setCameraDistance }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context) throw new Error("useMapCenter must be used within a MapContext");
  return context;
};
