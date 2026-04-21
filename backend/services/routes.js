const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Get route between multiple stops using Google Routes API
 * Returns polyline, duration, and distance for each leg
 */
async function getRoute(stops) {
  // Need at least 2 validated stops with coordinates
  const validStops = stops.filter((s) => s.place?.lat && s.place?.lng);

  if (validStops.length < 2) {
    return { legs: [], polyline: null, totalDuration: 0, totalDistance: 0 };
  }

  const origin = {
    location: {
      latLng: {
        latitude: validStops[0].place.lat,
        longitude: validStops[0].place.lng,
      },
    },
  };

  const destination = {
    location: {
      latLng: {
        latitude: validStops[validStops.length - 1].place.lat,
        longitude: validStops[validStops.length - 1].place.lng,
      },
    },
  };

  const intermediates = validStops.slice(1, -1).map((stop) => ({
    location: {
      latLng: {
        latitude: stop.place.lat,
        longitude: stop.place.lng,
      },
    },
  }));

  const body = {
    origin,
    destination,
    intermediates: intermediates.length > 0 ? intermediates : undefined,
    travelMode: "DRIVE",
    routingPreference: "TRAFFIC_AWARE",
    computeAlternativeRoutes: false,
    languageCode: "en-US",
    units: "METRIC",
  };

  try {
    const response = await fetch(
      "https://routes.googleapis.com/directions/v2:computeRoutes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
          "X-Goog-FieldMask":
            "routes.legs.duration,routes.legs.distanceMeters,routes.legs.polyline.encodedPolyline,routes.polyline.encodedPolyline,routes.duration,routes.distanceMeters",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Routes API error:", response.status, errText);
      return { legs: [], polyline: null, totalDuration: 0, totalDistance: 0 };
    }

    const data = await response.json();

    if (!data.routes || data.routes.length === 0) {
      return { legs: [], polyline: null, totalDuration: 0, totalDistance: 0 };
    }

    const route = data.routes[0];

    const legs = (route.legs || []).map((leg, index) => ({
      from: validStops[index]?.name || `Stop ${index + 1}`,
      to: validStops[index + 1]?.name || `Stop ${index + 2}`,
      duration: leg.duration ? parseInt(leg.duration.replace("s", "")) : 0,
      durationText: leg.duration
        ? formatDuration(parseInt(leg.duration.replace("s", "")))
        : "N/A",
      distanceMeters: leg.distanceMeters || 0,
      distanceText: leg.distanceMeters
        ? formatDistance(leg.distanceMeters)
        : "N/A",
      polyline: leg.polyline?.encodedPolyline || null,
    }));

    return {
      legs,
      polyline: route.polyline?.encodedPolyline || null,
      totalDuration: route.duration
        ? parseInt(route.duration.replace("s", ""))
        : 0,
      totalDurationText: route.duration
        ? formatDuration(parseInt(route.duration.replace("s", "")))
        : "N/A",
      totalDistance: route.distanceMeters || 0,
      totalDistanceText: route.distanceMeters
        ? formatDistance(route.distanceMeters)
        : "N/A",
    };
  } catch (error) {
    console.error("Routes API error:", error.message);
    return { legs: [], polyline: null, totalDuration: 0, totalDistance: 0 };
  }
}

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds} sec`;
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return remainMins > 0 ? `${hrs} hr ${remainMins} min` : `${hrs} hr`;
}

function formatDistance(meters) {
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

module.exports = { getRoute };
