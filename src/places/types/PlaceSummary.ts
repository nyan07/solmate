import type { LatLng } from "../../types/LatLng";
import type { PlaceTypes } from "./PlaceTypes";
import type { BusinessStatus } from "./Place";
import type { RawOpeningHours } from "../../utils/openingHours";

export type PlaceSummary = {
    id: string;
    displayName: string;
    primaryType: PlaceTypes;
    primaryTypeDisplayName?: string;
    editorialSummary: string;
    location: LatLng;
    hasOutdoorSeating: boolean;
    photoUrl: string;
    businessStatus?: BusinessStatus;
    openingHours: RawOpeningHours | null;
};
