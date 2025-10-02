import { useState, useEffect } from "react";
import type { LatLng } from "../types/LatLng";

export const useGeolocation = ({ active = true }: { active?: boolean } = {}) => {
  const [geolocation, setGeoLocation] = useState<LatLng | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    if (!active) return;

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    const success = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      setGeoLocation({ lat: latitude, lng: longitude });
      setLoading(false);
    };

    const fail = (err: GeolocationPositionError) => {
      setError(err.message);
      setLoading(false);
    };

    navigator.geolocation.getCurrentPosition(success, fail);
  }, [active]);

  return { geolocation, error, loading };
};