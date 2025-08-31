import type { PlaceStatuses } from "./PlaceStatuses";
import type { PlaceTypes } from "./PlaceTypes";

export type Place = {
    id: number,
    name: string,
    type: PlaceTypes,
    tags: string[],
    distance: string,
    description: string,
    imageUrl: string,
    status: PlaceStatuses
}