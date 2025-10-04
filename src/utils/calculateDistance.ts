import type { LatLng } from "../types/LatLng";

export function calculateDistance(from: LatLng, to: LatLng): string {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const R = 6371000; // Earth's radius in meters
  const dLat = toRadians(to.latitude - from.latitude);
  const dLng = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distanceInMeters = R * c;

  return distanceInMeters < 1000
    ? `${Math.round(distanceInMeters)} m`
    : `${(distanceInMeters / 1000).toFixed(1)} km`;
}
