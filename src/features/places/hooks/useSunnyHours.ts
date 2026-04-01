import { useMemo } from "react";
import SunCalc from "suncalc";
import type { LatLng } from "@/types/LatLng";

// Sun must be at least this high to clear typical urban buildings
const MIN_ALTITUDE_RAD = (15 * Math.PI) / 180;
const STEP_MINUTES = 15;

function pad(n: number) {
    return String(n).padStart(2, "0");
}

function minutesToTimeString(minutes: number) {
    return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

export function useSunnyHours(date: Date, location: LatLng | null | undefined) {
    return useMemo(() => {
        if (!location) return null;

        let firstSunny: number | null = null;
        let lastSunny: number | null = null;

        for (let m = 0; m < 24 * 60; m += STEP_MINUTES) {
            const d = new Date(date);
            d.setHours(0, m, 0, 0);
            const pos = SunCalc.getPosition(d, location.latitude, location.longitude);
            if (pos.altitude >= MIN_ALTITUDE_RAD) {
                if (firstSunny === null) firstSunny = m;
                lastSunny = m;
            }
        }

        if (firstSunny === null || lastSunny === null) return null;

        return {
            start: minutesToTimeString(firstSunny),
            end: minutesToTimeString(lastSunny),
        };
    }, [date, location?.latitude, location?.longitude]);
}
