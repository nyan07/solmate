import { useMemo } from "react";
import SunCalc from "suncalc";
import type { LatLng } from "../../types/LatLng";

export function useSunTimes(date: Date, position?: LatLng | null) {
  return useMemo(() => {
    if (!position) return null;
    return SunCalc.getTimes(date, position.lat, position.lng);
  }, [date, position]);
}