const express = require("express");
const router = express.Router();
const { generateItinerary } = require("../services/gemini");
const { enrichStopsWithPlaces, reverseGeocode, forwardGeocode } = require("../services/places");
const { getRoute } = require("../services/routes");

/**
 * POST /api/trip/generate
 * Generate a personalized trip itinerary
 *
 * Body: { lat, lng, friends, budget, mood, duration, currency? }
 */
router.post("/generate", async (req, res) => {
  try {
    const { lat, lng, friends, budget, mood, duration, currency } = req.body;

    // Validate required fields
    if (!lat || !lng) {
      return res.status(400).json({ error: "Location (lat, lng) is required" });
    }
    if (!mood) {
      return res.status(400).json({ error: "Mood is required" });
    }
    if (!budget) {
      return res.status(400).json({ error: "Budget is required" });
    }
    if (!duration) {
      return res.status(400).json({ error: "Duration is required (short or full)" });
    }

    console.log(`\n🌊 Generating trip for ${lat}, ${lng}`);
    console.log(`   Friends: ${friends}, Budget: ${budget}, Mood: ${mood}, Duration: ${duration}`);

    // Step 1: Reverse geocode to get city name
    console.log("📍 Step 1: Reverse geocoding...");
    const { city, country } = await reverseGeocode(lat, lng);
    console.log(`   Location: ${city}, ${country}`);

    // Step 2: Generate itinerary with Gemini AI
    console.log("🤖 Step 2: Generating itinerary with Gemini...");
    const itinerary = await generateItinerary({
      lat,
      lng,
      city,
      country,
      friends: friends || 0,
      budget,
      mood,
      duration,
      currency: currency || "INR",
    });
    console.log(`   Generated: "${itinerary.title}" with ${itinerary.stops?.length || 0} stops`);

    // Step 3: Enrich stops with Google Places data
    console.log("🏪 Step 3: Validating places...");
    const enrichedStops = await enrichStopsWithPlaces(itinerary.stops || [], {
      lat,
      lng,
    });
    const validatedCount = enrichedStops.filter((s) => s.validated).length;
    console.log(`   Validated ${validatedCount}/${enrichedStops.length} places`);

    // Step 4: Get route between stops
    console.log("🗺️  Step 4: Computing routes...");
    const route = await getRoute(enrichedStops);
    console.log(`   Route: ${route.totalDistanceText || "N/A"}, ${route.totalDurationText || "N/A"}`);

    // Build final response
    const tripPlan = {
      title: itinerary.title,
      summary: itinerary.summary,
      location: { city, country, lat, lng },
      totalCostPerPerson: itinerary.total_estimated_cost_per_person,
      totalDurationHours: itinerary.total_duration_hours,
      stops: enrichedStops,
      route,
      proTips: itinerary.pro_tips || [],
      generatedAt: new Date().toISOString(),
    };

    console.log("✅ Trip plan ready!\n");
    res.json(tripPlan);
  } catch (error) {
    console.error("❌ Trip generation failed:", error);
    res.status(500).json({
      error: "Failed to generate trip",
      message: error.message,
    });
  }
});

/**
 * POST /api/trip/geocode
 * Reverse geocode coordinates to city name
 *
 * Body: { lat, lng }
 */
router.post("/geocode", async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (!lat || !lng) {
      return res.status(400).json({ error: "lat and lng are required" });
    }
    const location = await reverseGeocode(lat, lng);
    res.json(location);
  } catch (error) {
    res.status(500).json({ error: "Geocoding failed", message: error.message });
  }
});

/**
 * POST /api/trip/forward-geocode
 * Forward geocode a city/location string to lat, lng
 *
 * Body: { address }
 */
router.post("/forward-geocode", async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({ error: "address is required" });
    }
    const location = await forwardGeocode(address);
    if (!location) {
      return res.status(404).json({ error: "Location not found" });
    }
    res.json(location);
  } catch (error) {
    res.status(500).json({ error: "Geocoding failed", message: error.message });
  }
});

module.exports = router;
