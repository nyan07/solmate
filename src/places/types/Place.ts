import type { PlaceStatuses } from "./PlaceStatuses";
import type { PlaceSummary } from "./PlaceSummary";
import type { PlaceTypes } from "./PlaceTypes";

export type Place = PlaceSummary & {
    id: number,
    name: string,
    type: PlaceTypes,
    tags: string[],
    description: string,
    status: PlaceStatuses,
    rating: number,
}