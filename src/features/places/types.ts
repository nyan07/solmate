import type { LatLng } from "@/types/LatLng";
import type { RawOpeningHours, PlaceStatuses } from "@/utils/openingHours";

export type { PlaceStatuses };

// ─── Place Types ──────────────────────────────────────────────────────────────

export type PlaceTypes = "bar" | "cafe" | "restaurant";

// ─── Place Summary ────────────────────────────────────────────────────────────

export type PlaceSummary = {
    id: string;
    displayName: string;
    primaryType: PlaceTypes;
    primaryTypeDisplayName?: string;
    editorialSummary: string;
    location: LatLng;
    hasOutdoorSeating: boolean;
    photoUrl: string;
    openingHours?: RawOpeningHours;
};

// ─── Place ────────────────────────────────────────────────────────────────────

export type AccessibilityOptions = {
    wheelchairAccessibleParking?: boolean;
    wheelchairAccessibleEntrance?: boolean;
    wheelchairAccessibleRestroom?: boolean;
    wheelchairAccessibleSeating?: boolean;
};

export type PriceLevel =
    | "PRICE_LEVEL_FREE"
    | "PRICE_LEVEL_INEXPENSIVE"
    | "PRICE_LEVEL_MODERATE"
    | "PRICE_LEVEL_EXPENSIVE"
    | "PRICE_LEVEL_VERY_EXPENSIVE";

export type Place = PlaceSummary & {
    rating?: number;
    formattedAddress?: string;
    regularOpeningHours?: {
        weekdayDescriptions?: string[];
    };
    accessibilityOptions?: AccessibilityOptions;
    goodForGroups?: boolean;
    goodForChildren?: boolean;
    priceLevel?: PriceLevel;
    allowsDogs?: boolean;
    reservable?: boolean;
    websiteUri?: string;
};
