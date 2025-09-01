import type { LatLng } from "../../types/LatLng";
import type { PlaceTypes } from "./PlaceTypes";

export type PlaceSummary = {
    id: string,
    displayName: string,
    primaryType: PlaceTypes,
    editorialSummary: string,
    //regularOpeningHours: any,
    location: LatLng
}