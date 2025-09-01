import type { LatLng } from "../types/LatLng";

export function calculateDistance(
    from: LatLng,
    to: LatLng
  ): string {
    if (!google.maps.geometry?.spherical) {
      throw new Error("Google Maps geometry library not loaded.");
    }
  
    const distanceInMeters = google.maps.geometry.spherical.computeDistanceBetween(
      new google.maps.LatLng(from.lat, from.lng),
      new google.maps.LatLng(to.lat, to.lng)
    );
  
    return distanceInMeters < 1000
      ? `${Math.round(distanceInMeters)} m`
      : `${(distanceInMeters / 1000).toFixed(1)} km`;
  }