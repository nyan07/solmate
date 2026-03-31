import type { PlaceSummary } from "./PlaceSummary";

export type AccessibilityOptions = {
    wheelchairAccessibleParking?: boolean;
    wheelchairAccessibleEntrance?: boolean;
    wheelchairAccessibleRestroom?: boolean;
    wheelchairAccessibleSeating?: boolean;
};

export type BusinessStatus = "OPERATIONAL" | "CLOSED_TEMPORARILY" | "CLOSED_PERMANENTLY";

export type PriceLevel =
    | "PRICE_LEVEL_FREE"
    | "PRICE_LEVEL_INEXPENSIVE"
    | "PRICE_LEVEL_MODERATE"
    | "PRICE_LEVEL_EXPENSIVE"
    | "PRICE_LEVEL_VERY_EXPENSIVE";

export type Place = PlaceSummary & {
    rating?: number;
    formattedAddress?: string;
    businessStatus?: BusinessStatus;
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
