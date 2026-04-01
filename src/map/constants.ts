/** Maximum camera altitude (meters) at which place pins and controls are shown. */
export const DEFAULT_CAMERA_DISTANCE = 700;

/** Cesium entity ID constants — centralised to avoid scattered magic strings. */
export const ENTITY_IDS = {
    userLocation: "user-location",
    locationSphere: "location-sphere",
    locationLine: "location-line",
    placeBillboard: (id: string) => `place-billboard-${id}`,
    placeLine: (id: string) => `place-line-${id}`,
} as const;
