import type { LatLng } from "../../types/LatLng";
import type { PlaceTypes } from "./PlaceTypes";

export type PlaceSummary = {
    id: string,
    displayName: string,
    primaryType: PlaceTypes,
    primaryTypeDisplayName?: string,
    editorialSummary: string,
    location: LatLng,
    hasOutdoorSeating: boolean,
    photoUrl: string,
    openingHours: any
}