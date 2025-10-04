import type { LatLng } from "../types/LatLng";

export type BoundingBox = {
    south: number;
    west: number;
    north: number;
    east: number;
};

export function getBoundingBox(center: LatLng, radiusMeters: number): BoundingBox {
    const earthRadius = 6378137; // metros
    const lat = center.latitude;
    const lng = center.longitude;

    const deltaLat = (radiusMeters / earthRadius) * (180 / Math.PI);
    const deltaLng = (radiusMeters / (earthRadius * Math.cos((lat * Math.PI) / 180))) * (180 / Math.PI);

    return {
        south: lat - deltaLat,
        north: lat + deltaLat,
        west: lng - deltaLng,
        east: lng + deltaLng,
    };
}