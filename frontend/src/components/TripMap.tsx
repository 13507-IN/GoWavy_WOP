"use client";

import React, { useEffect, useRef, useCallback } from "react";
import type { TripPlan } from "@/services/api";

interface TripMapProps {
  trip: TripPlan;
  activeStop: number;
  onStopClick: (index: number) => void;
  googleMapsApiKey: string;
}

// Decode Google encoded polyline
function decodePolyline(encoded: string): Array<{ lat: number; lng: number }> {
  const points: Array<{ lat: number; lng: number }> = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return points;
}

export default function TripMap({ trip, activeStop, onStopClick, googleMapsApiKey }: TripMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  const initMap = useCallback(async () => {
    if (!mapRef.current || !window.google) return;

    const validStops = trip.stops.filter((s) => s.place?.lat && s.place?.lng);
    if (validStops.length === 0) return;

    // Create map
    const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
    await google.maps.importLibrary("marker");

    const map = new Map(mapRef.current, {
      center: { lat: validStops[0].place.lat!, lng: validStops[0].place.lng! },
      zoom: 13,
      mapId: "gowavy-dark-map",
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: "greedy",
      styles: [
        { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#8892b0" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#2d3748" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f172a" }] },
        { featureType: "poi", elementType: "geometry", stylers: [{ color: "#1e293b" }] },
        { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#1a2e1a" }] },
      ],
    });

    mapInstanceRef.current = map;

    // Clear old markers
    markersRef.current.forEach((m) => (m.map = null));
    markersRef.current = [];

    // Add markers
    validStops.forEach((stop, index) => {
      const markerContent = document.createElement("div");
      markerContent.className = "gowavy-marker";
      markerContent.innerHTML = `
        <div style="
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, #338eff, #06b6d4);
          display: flex; align-items: center; justify-content: center;
          color: white; font-weight: 800; font-size: 14px;
          box-shadow: 0 4px 15px rgba(51, 142, 255, 0.4);
          border: 2px solid rgba(255,255,255,0.3);
          cursor: pointer;
          transition: transform 0.2s;
        ">${index + 1}</div>
      `;

      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: { lat: stop.place.lat!, lng: stop.place.lng! },
        map,
        content: markerContent,
        title: stop.place.name || stop.name,
      });

      marker.addListener("click", () => onStopClick(index));
      markersRef.current.push(marker);
    });

    // Draw route polyline
    if (trip.route?.polyline) {
      const path = decodePolyline(trip.route.polyline);
      if (polylineRef.current) polylineRef.current.setMap(null);

      polylineRef.current = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: "#338eff",
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map,
      });
    }

    // Fit bounds to all markers
    const bounds = new google.maps.LatLngBounds();
    validStops.forEach((stop) => {
      bounds.extend({ lat: stop.place.lat!, lng: stop.place.lng! });
    });
    map.fitBounds(bounds, 60);
  }, [trip, onStopClick]);

  // Load Google Maps script
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.google?.maps) {
      initMap();
      return;
    }

    const existingScript = document.getElementById("google-maps-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => initMap());
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places,marker&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => initMap();
    document.head.appendChild(script);
  }, [googleMapsApiKey, initMap]);

  // Pan to active stop
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const stop = trip.stops[activeStop];
    if (stop?.place?.lat && stop?.place?.lng) {
      mapInstanceRef.current.panTo({ lat: stop.place.lat, lng: stop.place.lng });

      // Highlight active marker
      markersRef.current.forEach((marker, i) => {
        const el = marker.content as HTMLElement;
        if (el) {
          const inner = el.firstElementChild as HTMLElement;
          if (inner) {
            inner.style.transform = i === activeStop ? "scale(1.3)" : "scale(1)";
            inner.style.boxShadow =
              i === activeStop
                ? "0 4px 25px rgba(51, 142, 255, 0.6)"
                : "0 4px 15px rgba(51, 142, 255, 0.4)";
          }
        }
      });
    }
  }, [activeStop, trip.stops]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-2xl" />
      {/* Map overlay with trip title */}
      <div className="absolute top-4 left-4 right-4 pointer-events-none">
        <div className="glass rounded-xl px-4 py-2 inline-flex items-center gap-2 pointer-events-auto">
          <span className="text-lg">🌊</span>
          <span className="text-sm font-semibold text-white">{trip.title}</span>
        </div>
      </div>
    </div>
  );
}
