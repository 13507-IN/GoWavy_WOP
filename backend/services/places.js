const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Search for a place using Google Places API (New) Text Search
 * Returns place details with coordinates, photos, ratings
 */
async function searchPlace(query, locationBias) {
  const url = "https://places.googleapis.com/v1/places:searchText";

  const body = {
    textQuery: query,
    maxResultCount: 1,
    locationBias: {
      circle: {
        center: {
          latitude: locationBias.lat,
          longitude: locationBias.lng,
        },
        radius: 30000.0, // 30km radius
      },
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.priceLevel,places.photos,places.currentOpeningHours,places.websiteUri,places.googleMapsUri,places.types",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Places API error:", response.status, errText);
      return null;
    }

    const data = await response.json();

    if (!data.places || data.places.length === 0) {
      return null;
    }

    const place = data.places[0];

    // Get first photo URL if available
    let photoUrl = null;
    if (place.photos && place.photos.length > 0) {
      const photoName = place.photos[0].name;
      photoUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&key=${GOOGLE_MAPS_API_KEY}`;
    }

    return {
      placeId: place.id,
      name: place.displayName?.text || query,
      address: place.formattedAddress || "",
      lat: place.location?.latitude,
      lng: place.location?.longitude,
      rating: place.rating || null,
      ratingCount: place.userRatingCount || 0,
      priceLevel: place.priceLevel || null,
      photoUrl,
      isOpen: place.currentOpeningHours?.openNow ?? null,
      googleMapsUrl: place.googleMapsUri || null,
      websiteUrl: place.websiteUri || null,
      types: place.types || [],
    };
  } catch (error) {
    console.error("Error searching place:", query, error.message);
    return null;
  }
}

/**
 * Validate and enrich all stops from the AI itinerary with real Google Places data
 */
async function enrichStopsWithPlaces(stops, userLocation) {
  const enrichedStops = [];

  for (const stop of stops) {
    const searchQuery = stop.search_query || `${stop.name} ${stop.address || ""}`;
    const placeData = await searchPlace(searchQuery, userLocation);

    if (placeData) {
      enrichedStops.push({
        ...stop,
        place: placeData,
        validated: true,
      });
    } else {
      // Keep the AI suggestion even if we can't find it on Google
      enrichedStops.push({
        ...stop,
        place: {
          name: stop.name,
          address: stop.address || "",
          lat: null,
          lng: null,
          rating: null,
          photoUrl: null,
          isOpen: null,
          googleMapsUrl: null,
        },
        validated: false,
      });
    }
  }

  return enrichedStops;
}

/**
 * Reverse geocode coordinates to get city and country name
 */
async function reverseGeocode(lat, lng) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}&result_type=locality|administrative_area_level_1`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      const components = data.results[0].address_components;
      let city = "";
      let country = "";

      for (const comp of components) {
        if (comp.types.includes("locality")) {
          city = comp.long_name;
        }
        if (comp.types.includes("country")) {
          country = comp.long_name;
        }
      }

      return { city: city || "Unknown City", country: country || "Unknown Country" };
    }

    return { city: "Unknown City", country: "Unknown Country" };
  } catch (error) {
    console.error("Geocoding error:", error.message);
    return { city: "Unknown City", country: "Unknown Country" };
  }
}

module.exports = { searchPlace, enrichStopsWithPlaces, reverseGeocode };
