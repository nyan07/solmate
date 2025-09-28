import type { LatLng } from "../../types/LatLng";
import type { PlaceTypes } from "./PlaceTypes";

export type PlaceSummary = {
    id: string,
    displayName: string,
    primaryType: PlaceTypes,
    editorialSummary: string,
    //regularOpeningHours: any,
    location: LatLng,
    hasOutdoorSeating: boolean,
    imageUrl: string,
    regularOpeningHours: {
        periods: OpeningHoursPeriod[],
        weekdayDescriptions: string[]
    }
}

export type OpeningHoursPeriod = {
    close: OpeningHoursPoint
    open: OpeningHoursPoint
}

export type OpeningHoursPoint = {
    day: number,
    hour: number,
    minute: number
}