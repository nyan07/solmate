import { useMemo } from "react";
import SunCalc from "suncalc";
import type { LatLng } from "../../types/LatLng";

const Mode = {
  UP: "up",
  DOWN: "down"
} as const;

function roundToHalfHour(date: Date, mode: typeof Mode[keyof typeof Mode]) {
  const hours = date.getHours();
  const minutes = date.getMinutes();

  let value = hours + minutes / 60;

  if (mode === Mode.UP) {
    value = Math.ceil(value * 2) / 2;
  } else {
    value = Math.floor(value * 2) / 2;
  }

  return value;
}

export function useSunTimes(date: Date, position?: LatLng | null) {
  const DEFAULT_SUNRISE = 6;
  const DEFAULT_SUNSET = 18;

  const sunTimes = useMemo(() => {
    if (!position) return null;
    return SunCalc.getTimes(date, position.lat, position.lng);
  }, [date, position]);

  const sunriseValue = sunTimes
    ? roundToHalfHour(sunTimes.sunrise, Mode.UP)
    : DEFAULT_SUNRISE;

  const sunsetValue = sunTimes
    ? roundToHalfHour(sunTimes.sunset, Mode.DOWN)
    : DEFAULT_SUNSET;

  return { sunrise: sunriseValue, sunset: sunsetValue };
}
