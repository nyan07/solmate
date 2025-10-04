import { useMemo } from "react";
import { Cartesian3, JulianDate } from "cesium";
import SunCalc from "suncalc";
import type { LatLng } from "../../types/LatLng";

export function useSunDirection(date: Date, hour: number, position?: LatLng | null) {
  return useMemo(() => {
    if (!position) return null;

    const current = new Date(date);
    current.setHours(hour, 0, 0, 0);

    const sunPos = SunCalc.getPosition(current, position.latitude, position.longitude);
    const altitude = sunPos.altitude;
    const azimuth = sunPos.azimuth;

    const distance = 1_000_000;
    const x = distance * Math.cos(altitude) * Math.sin(azimuth);
    const y = distance * Math.cos(altitude) * Math.cos(azimuth);
    const z = distance * Math.sin(altitude);

    return {
      direction: new Cartesian3(x, y, z),
      time: JulianDate.fromDate(current),
    };
  }, [date, hour, position]);
}
