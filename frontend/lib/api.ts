export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  provider: string;
  avatar?: string | null;
  createdAt: string;
}

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

interface ApiRequestOptions extends RequestInit {
  skipJsonHeader?: boolean;
}

async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { skipJsonHeader = false, headers, ...rest } = options;

  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      ...(skipJsonHeader ? {} : { "Content-Type": "application/json" }),
      ...(headers || {}),
    },
    ...rest,
  });

  const payload = await response
    .json()
    .catch(() => ({ message: `Request failed with status ${response.status}` }));

  if (!response.ok) {
    throw new Error(payload.message || payload.error || "Request failed");
  }

  return payload;
}

export function getGoogleAuthUrl() {
  return `${API_BASE}/api/auth/google`;
}

export function registerUser(input: { name: string; email: string; password: string }) {
  return apiRequest<{ user: AuthUser; token: string }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function loginUser(input: { email: string; password: string }) {
  return apiRequest<{ user: AuthUser; token: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getCurrentUser() {
  return apiRequest<{ user: AuthUser }>("/api/auth/me");
}

export function logoutUser() {
  return apiRequest<{ success: boolean }>("/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function generateTrip(data: {
  lat: number;
  lng: number;
  friends: number;
  budget: number;
  mood: string;
  duration: "short" | "full";
}) {
  return apiRequest<TripPlan>("/api/trip/generate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function reverseGeocode(lat: number, lng: number) {
  return apiRequest<{ city: string; country: string }>("/api/trip/geocode", {
    method: "POST",
    body: JSON.stringify({ lat, lng }),
  });
}

export function forwardGeocode(address: string) {
  return apiRequest<{ lat: number; lng: number; city: string; country: string }>(
    "/api/trip/forward-geocode",
    {
      method: "POST",
      body: JSON.stringify({ address }),
    }
  );
}
