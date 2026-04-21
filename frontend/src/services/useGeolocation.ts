"use client";

import { useState, useEffect, useCallback } from "react";

interface GeolocationState {
  lat: number | null;
  lng: number | null;
  city: string | null;
  country: string | null;
  loading: boolean;
  error: string | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    lat: null,
    lng: null,
    city: null,
    country: null,
    loading: true,
    error: null,
  });

  const detectLocation = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Geolocation is not supported by your browser",
      }));
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes cache
          });
        }
      );

      const { latitude: lat, longitude: lng } = position.coords;

      // Reverse geocode to get city name
      try {
        const res = await fetch(`${API_BASE}/api/trip/geocode`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat, lng }),
        });
        const data = await res.json();
        setState({
          lat,
          lng,
          city: data.city || "Your Location",
          country: data.country || "",
          loading: false,
          error: null,
        });
      } catch {
        // If geocoding fails, still use coordinates
        setState({
          lat,
          lng,
          city: "Your Location",
          country: "",
          loading: false,
          error: null,
        });
      }
    } catch (err) {
      const geoError = err as GeolocationPositionError;
      let errorMsg = "Unable to detect your location";
      if (geoError.code === 1) errorMsg = "Location access denied. Please allow location access.";
      if (geoError.code === 2) errorMsg = "Location unavailable. Please try again.";
      if (geoError.code === 3) errorMsg = "Location request timed out. Please try again.";

      setState((prev) => ({
        ...prev,
        loading: false,
        error: errorMsg,
      }));
    }
  }, []);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  return { ...state, retry: detectLocation };
}
