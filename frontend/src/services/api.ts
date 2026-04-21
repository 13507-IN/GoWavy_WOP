const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface TripStop {
  order: number;
  name: string;
  type: string;
  address: string;
  activity: string;
  duration_minutes: number;
  estimated_cost_per_person: number;
  time_slot: string;
  vibe: string;
  search_query: string;
  validated: boolean;
  place: {
    placeId?: string;
    name: string;
    address: string;
    lat: number | null;
    lng: number | null;
    rating: number | null;
    ratingCount?: number;
    priceLevel?: string | null;
    photoUrl: string | null;
    isOpen: boolean | null;
    googleMapsUrl: string | null;
    websiteUrl?: string | null;
    types?: string[];
  };
}

export interface RouteLeg {
  from: string;
  to: string;
  duration: number;
  durationText: string;
  distanceMeters: number;
  distanceText: string;
  polyline: string | null;
}

export interface TripRoute {
  legs: RouteLeg[];
  polyline: string | null;
  totalDuration: number;
  totalDurationText: string;
  totalDistance: number;
  totalDistanceText: string;
}

export interface TripPlan {
  title: string;
  summary: string;
  location: {
    city: string;
    country: string;
    lat: number;
    lng: number;
  };
  totalCostPerPerson: number;
  totalDurationHours: number;
  stops: TripStop[];
  route: TripRoute;
  proTips: string[];
  generatedAt: string;
}

export interface TripRequest {
  lat: number;
  lng: number;
  friends: number;
  budget: number;
  mood: string;
  duration: "short" | "full";
  currency?: string;
}

export async function generateTrip(data: TripRequest): Promise<TripPlan> {
  const response = await fetch(`${API_BASE}/api/trip/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(err.message || `Server error: ${response.status}`);
  }

  return response.json();
}

export async function checkHealth(): Promise<{ status: string; keys: { gemini: boolean; googleMaps: boolean } }> {
  const response = await fetch(`${API_BASE}/api/health`);
  return response.json();
}
