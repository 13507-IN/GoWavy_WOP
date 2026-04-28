const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate a personalized trip itinerary using Gemini AI
 */
async function generateItinerary({ lat, lng, city, country, friends, budget, mood, duration, currency }) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const groupSize = (friends || 0) + 1;
  const durationType = duration === "short" ? "2-3 hours (quick hangout/quality time)" : "8-10 hours (full day trip)";
  const stopCount = duration === "short" ? "3-4" : "6-8";

  const prompt = `You are GoWavy, an expert local trip planner who creates amazing personalized experiences. Generate a detailed trip plan based on these inputs.

INPUTS:
- Current Location: ${city}, ${country} (latitude: ${lat}, longitude: ${lng})
- Group Size: ${groupSize} people
- Budget Per Person: ${budget} ${currency || "INR"}
- Mood/Vibe: ${mood}
- Duration: ${durationType}

RULES:
1. Suggest ${stopCount} real, specific places near the user's location (within 25km radius for short trips, 50km for full day).
2. Each place MUST be a real, well-known establishment or location — NOT made up.
3. Match the mood perfectly — if "romantic", suggest cozy cafes and scenic spots; if "adventurous", suggest treks and activities; if "foodie", suggest best local eateries.
4. Keep total cost within budget. Be realistic with pricing for ${city}, ${country}.
5. Arrange stops in a logical geographic order to minimize travel time.
6. Include a mix of activity types — don't just suggest all restaurants.
7. For short trips, keep stops close together. For full day, you can spread them out more.

OUTPUT FORMAT (respond with ONLY this JSON, no markdown, no code fences):
{
  "title": "A catchy, fun trip name that matches the mood",
  "summary": "One exciting sentence about this trip",
  "total_estimated_cost_per_person": 0,
  "total_duration_hours": 0,
  "stops": [
    {
      "order": 1,
      "name": "Exact Place Name",
      "type": "cafe|restaurant|park|museum|mall|beach|viewpoint|adventure|temple|bar|club|market|theater|gallery",
      "address": "Full address or area name",
      "activity": "What to do here (be specific and exciting)",
      "duration_minutes": 45,
      "estimated_cost_per_person": 500,
      "time_slot": "10:00 AM - 10:45 AM",
      "vibe": "Why this place matches the mood (one sentence)",
      "search_query": "The exact Google Maps search query to find this place"
    }
  ],
  "pro_tips": ["Practical tip 1", "Practical tip 2", "Practical tip 3"]
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text().trim();

    // Remove markdown code fences if present
    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const itinerary = JSON.parse(text);
    return itinerary;
  } catch (error) {
    console.error("Gemini generation error:", error);
    throw new Error("Failed to generate itinerary: " + error.message);
  }
}

module.exports = { generateItinerary };
