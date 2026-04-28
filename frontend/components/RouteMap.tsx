"use client";

import { useEffect, useRef, useState } from "react";

interface Stop {
  name: string;
  order: number;
  time_slot?: string;
  type?: string;
  place?: {
    lat: number | null;
    lng: number | null;
    name?: string;
    address?: string;
    photoUrl?: string;
    rating?: number | null;
    googleMapsUrl?: string | null;
  };
}

interface RouteData {
  legs?: {
    from: string;
    to: string;
    durationText: string;
    distanceText: string;
    polyline?: string | null;
  }[];
  polyline?: string | null;
  totalDurationText?: string;
  totalDistanceText?: string;
}

interface RouteMapProps {
  stops: Stop[];
  route?: RouteData;
  activeStopIndex?: number;
  onStopClick?: (index: number) => void;
  className?: string;
}

// Decode Google's encoded polyline format
function decodePolyline(encoded: string): { lat: number; lng: number }[] {
  const points: { lat: number; lng: number }[] = [];
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

const MARKER_COLORS = [
  "#23b5d3", "#ff5d73", "#6366f1", "#f59e0b", "#10b981",
  "#8b5cf6", "#ec4899", "#14b8a6",
];

export default function RouteMap({
  stops,
  route,
  activeStopIndex = -1,
  onStopClick,
  className = "",
}: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Load the Maps JS API
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

    if (window.google?.maps) {
      setMapLoaded(true);
      return;
    }

    const existing = document.getElementById("google-maps-script");
    if (existing) {
      existing.addEventListener("load", () => setMapLoaded(true));
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => setMapLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Initialize map + draw markers + routes
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const validStops = stops.filter((s) => s.place?.lat && s.place?.lng);
    if (validStops.length === 0) return;

    // Calculate bounds
    const bounds = new google.maps.LatLngBounds();
    validStops.forEach((s) => {
      bounds.extend({ lat: s.place!.lat!, lng: s.place!.lng! });
    });

    // Create map
    const map = new google.maps.Map(mapRef.current, {
      mapId: "DEMO_MAP_ID",
      center: bounds.getCenter(),
      zoom: 13,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9e8f0" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
        { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#e0e0e0" }] },
        { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5f5e0" }] },
      ],
    });

    googleMapRef.current = map;
    map.fitBounds(bounds, { top: 60, bottom: 60, left: 60, right: 60 });

    // Clear old markers
    markersRef.current.forEach((m) => (m.map = null));
    markersRef.current = [];

    // Clear old polylines
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    // Create info window
    if (!infoWindowRef.current) {
      infoWindowRef.current = new google.maps.InfoWindow();
    }

    // Add markers
    validStops.forEach((stop, index) => {
      const color = MARKER_COLORS[index % MARKER_COLORS.length];
      const isActive = index === activeStopIndex;

      const pinEl = document.createElement("div");
      pinEl.innerHTML = `
        <div style="
          display:flex;align-items:center;justify-content:center;
          width:${isActive ? 44 : 36}px;height:${isActive ? 44 : 36}px;
          border-radius:50%;
          background:${color};
          color:white;
          font-weight:900;font-size:${isActive ? 16 : 13}px;
          box-shadow:0 4px 20px ${color}88;
          border:3px solid white;
          transition:all 0.3s ease;
          cursor:pointer;
        ">${index + 1}</div>
      `;

      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: { lat: stop.place!.lat!, lng: stop.place!.lng! },
        map,
        content: pinEl,
        title: stop.name,
      });

      marker.addListener("click", () => {
        onStopClick?.(index);

        const content = `
          <div style="font-family:system-ui;padding:8px 4px;max-width:240px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
              <span style="background:${color};color:white;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900">${index + 1}</span>
              <strong style="font-size:14px">${stop.name}</strong>
            </div>
            ${stop.time_slot ? `<div style="font-size:11px;color:#23b5d3;font-weight:700;margin-bottom:4px">${stop.time_slot}</div>` : ""}
            ${stop.place?.address ? `<div style="font-size:12px;color:#666">${stop.place.address}</div>` : ""}
            ${stop.place?.rating ? `<div style="font-size:12px;margin-top:4px">⭐ ${stop.place.rating}</div>` : ""}
          </div>
        `;
        infoWindowRef.current!.setContent(content);
        infoWindowRef.current!.open(map, marker);
      });

      markersRef.current.push(marker);
    });

    // Draw route polylines
    if (route?.polyline) {
      const decodedPath = decodePolyline(route.polyline);
      const poly = new google.maps.Polyline({
        path: decodedPath,
        geodesic: true,
        strokeColor: "#23b5d3",
        strokeOpacity: 0.9,
        strokeWeight: 5,
        map,
      });
      polylinesRef.current.push(poly);

      // Draw shadow polyline for depth
      const shadowPoly = new google.maps.Polyline({
        path: decodedPath,
        geodesic: true,
        strokeColor: "#0b132b",
        strokeOpacity: 0.15,
        strokeWeight: 9,
        map,
      });
      polylinesRef.current.push(shadowPoly);
    } else if (route?.legs) {
      // Draw per-leg polylines if we have them
      route.legs.forEach((leg, i) => {
        if (leg.polyline) {
          const decodedPath = decodePolyline(leg.polyline);
          const color = MARKER_COLORS[i % MARKER_COLORS.length];
          const poly = new google.maps.Polyline({
            path: decodedPath,
            geodesic: true,
            strokeColor: color,
            strokeOpacity: 0.8,
            strokeWeight: 4,
            map,
          });
          polylinesRef.current.push(poly);
        }
      });
    } else {
      // Fallback: draw straight lines between stops
      for (let i = 0; i < validStops.length - 1; i++) {
        const from = validStops[i];
        const to = validStops[i + 1];
        const poly = new google.maps.Polyline({
          path: [
            { lat: from.place!.lat!, lng: from.place!.lng! },
            { lat: to.place!.lat!, lng: to.place!.lng! },
          ],
          geodesic: true,
          strokeColor: "#23b5d3",
          strokeOpacity: 0.6,
          strokeWeight: 3,
          icons: [
            {
              icon: { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 3 },
              offset: "50%",
            },
          ],
          map,
        });
        polylinesRef.current.push(poly);
      }
    }
  }, [mapLoaded, stops, route, activeStopIndex, onStopClick]);

  // Pan to active stop
  useEffect(() => {
    if (!googleMapRef.current || activeStopIndex < 0) return;
    const stop = stops[activeStopIndex];
    if (stop?.place?.lat && stop?.place?.lng) {
      googleMapRef.current.panTo({ lat: stop.place.lat, lng: stop.place.lng });
    }
  }, [activeStopIndex, stops]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div ref={mapRef} className="w-full h-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[color:var(--surface-2)]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[color:var(--wave-teal)] border-t-transparent" />
            <span className="text-xs font-bold uppercase tracking-widest text-[color:var(--text-muted)]">Loading map</span>
          </div>
        </div>
      )}
      {/* Route summary overlay */}
      {route?.totalDistanceText && (
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md rounded-2xl px-4 py-2 shadow-lg border border-[color:var(--border-soft)]">
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="text-[color:var(--wave-teal)]">{route.totalDistanceText}</span>
            <span className="w-px h-4 bg-[color:var(--border-soft)]" />
            <span className="text-[color:var(--wave-ink)]">{route.totalDurationText}</span>
          </div>
        </div>
      )}
    </div>
  );
}
