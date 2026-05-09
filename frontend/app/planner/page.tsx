"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import RouteMap from "@/components/RouteMap";
import AuthDialog from "@/components/AuthDialog";
import { useAuth } from "@/hooks/useAuth";
import {
  forwardGeocode,
  generateTrip,
  reverseGeocode,
  type TripPlan,
} from "@/lib/api";
import {
  Calendar,
  Compass,
  ExternalLink,
  Lightbulb,
  Loader2,
  Lock,
  MapPin,
  Navigation,
  Rocket,
  Sparkles,
  Star,
  UserMinus,
  UserPlus,
} from "lucide-react";

const vibeOptions = [
  { id: "energy", label: "High Energy", helper: "Lively spots" },
  { id: "chill", label: "Chill Out", helper: "Relaxed picks" },
  { id: "gourmet", label: "Gourmet", helper: "Food-first" },
  { id: "cultural", label: "Cultural", helper: "Art and history" },
];

const dateOptions = [
  { label: "Now", value: "short" as const },
  { label: "Full Day", value: "full" as const },
];

const budgetMarks = ["$", "$$", "$$$", "$$$$"];
const budgetTones = ["Economy", "Comfort", "Premium", "Elite"];

export default function Planner() {
  const searchParams = useSearchParams();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const initialVibe = searchParams.get("vibe") || "energy";
  const initialBudget = Number(searchParams.get("budget") || "250");
  const initialLocation = searchParams.get("location") || "Your Area";
  const initialBudgetLevel =
    initialBudget <= 100 ? 1 : initialBudget <= 300 ? 2 : initialBudget <= 600 ? 3 : 4;
  const showGoogleSuccess = searchParams.get("auth") === "google_success";

  const [selectedVibe, setSelectedVibe] = useState(initialVibe);
  const [selectedDuration, setSelectedDuration] = useState<"short" | "full">("short");
  const [crewCount, setCrewCount] = useState(4);
  const [budgetLevel, setBudgetLevel] = useState(initialBudgetLevel);
  const [radius, setRadius] = useState(15);
  const [location, setLocation] = useState(initialLocation);
  const [latLng, setLatLng] = useState({ lat: 12.9716, lng: 77.5946 });
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [itinerary, setItinerary] = useState<TripPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeStopIndex, setActiveStopIndex] = useState(-1);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const detectLocation = async () => {
    setDetecting(true);
    setError(null);

    if (!("geolocation" in navigator)) {
      setDetecting(false);
      setError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLatLng({ lat: latitude, lng: longitude });

        try {
          const data = await reverseGeocode(latitude, longitude);
          if (data.city) {
            setLocation(`${data.city}${data.country ? `, ${data.country}` : ""}`);
          }
        } catch {
          setLocation("My location");
        } finally {
          setDetecting(false);
        }
      },
      () => {
        setDetecting(false);
        setError("Could not detect location. Please type it manually.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      let finalLat = latLng.lat;
      let finalLng = latLng.lng;

      if (location && location !== "Your Area" && location !== "My location") {
        try {
          const geoData = await forwardGeocode(location);
          finalLat = geoData.lat;
          finalLng = geoData.lng;
          setLatLng({ lat: finalLat, lng: finalLng });
        } catch {
          // Use last known coordinates if forward geocoding fails.
        }
      }

      const data = await generateTrip({
        lat: finalLat,
        lng: finalLng,
        friends: Math.max(1, crewCount),
        budget: budgetLevel * 500,
        mood: selectedVibe,
        duration: selectedDuration,
      });

      setItinerary(data);
      setActiveStopIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong while generating your plan.");
    } finally {
      setLoading(false);
    }
  };

  const budgetMark = budgetMarks[budgetLevel - 1] ?? "$$";
  const budgetTone = budgetTones[budgetLevel - 1] ?? "Comfort";
  const isGenerateDisabled = loading || !location.trim();

  const radiusSummary = useMemo(() => {
    if (radius <= 5) return "Walkable";
    if (radius <= 15) return "Quick Drive";
    return "Explore Further";
  }, [radius]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center mesh-gradient">
        <div className="flex items-center gap-3 rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--surface-1)] px-5 py-4">
          <Loader2 className="h-5 w-5 animate-spin text-[color:var(--wave-teal)]" />
          <span className="text-sm font-semibold">Checking your session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative min-h-screen mesh-gradient text-[color:var(--wave-ink)]">
        <AuthDialog
          open={authModalOpen}
          onOpenChange={setAuthModalOpen}
          onAuthSuccess={refreshUser}
        />

        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
          <Card className="glass-panel w-full rounded-[2rem] border-[color:var(--border-soft)] p-8 text-center">
            <CardContent className="space-y-6 p-0">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[color:var(--wave-teal)]/15">
                <Lock className="h-7 w-7 text-[color:var(--wave-teal)]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Planner is protected</h1>
                <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                  Login with email/password or Google to generate and save your itinerary.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button variant="glow" onClick={() => setAuthModalOpen(true)}>
                  Login to continue
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (itinerary) {
    return (
      <div className="relative min-h-screen mesh-gradient text-[color:var(--wave-ink)]">
        <header className="sticky top-0 z-30 mx-4 mt-4 flex items-center justify-between rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--surface-1)]/90 px-5 py-3 backdrop-blur-xl lg:mx-6">
          <div className="flex items-center gap-3">
            <Compass className="h-6 w-6 text-[color:var(--wave-teal)]" />
            <h1 className="text-lg font-bold">
              Your <span className="text-[color:var(--wave-teal)]">Wave</span> Plan
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="hidden border-[color:var(--wave-teal)]/30 bg-[color:var(--wave-teal)]/10 text-[color:var(--wave-teal)] sm:flex">
              <Navigation className="mr-1 h-3 w-3" />
              {itinerary.route?.totalDistanceText || `${itinerary.stops?.length} stops`}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => setItinerary(null)}>
              New Plan
            </Button>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 pb-12 pt-6 lg:px-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]">
            <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
              <RouteMap
                stops={itinerary.stops || []}
                route={itinerary.route}
                activeStopIndex={activeStopIndex}
                onStopClick={setActiveStopIndex}
                className="h-[50vh] rounded-[2rem] border border-[color:var(--border-soft)] shadow-xl lg:h-[calc(100vh-120px)]"
              />
            </div>

            <div className="space-y-6">
              <Card className="overflow-hidden rounded-[2rem] border-none shadow-xl">
                <CardHeader className="bg-gradient-to-br from-[color:var(--wave-teal)] to-[color:var(--wave-blue)] p-6 text-white">
                  <Badge className="w-fit border-none bg-white/20 text-[10px] text-white">AI Generated</Badge>
                  <CardTitle className="mt-2 text-2xl font-bold">{itinerary.title}</CardTitle>
                  <p className="mt-1 text-sm text-white/80">{itinerary.summary}</p>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-2 p-4 text-sm sm:grid-cols-4">
                  <div className="rounded-xl bg-[color:var(--surface-2)] p-3 text-center">
                    <div className="text-[10px] font-bold uppercase text-[color:var(--text-muted)]">Duration</div>
                    <div className="text-sm font-black">{itinerary.totalDurationHours}h</div>
                  </div>
                  <div className="rounded-xl bg-[color:var(--surface-2)] p-3 text-center">
                    <div className="text-[10px] font-bold uppercase text-[color:var(--text-muted)]">Cost/pp</div>
                    <div className="text-sm font-black">INR {itinerary.totalCostPerPerson}</div>
                  </div>
                  <div className="rounded-xl bg-[color:var(--surface-2)] p-3 text-center">
                    <div className="text-[10px] font-bold uppercase text-[color:var(--text-muted)]">Stops</div>
                    <div className="text-sm font-black">{itinerary.stops?.length || 0}</div>
                  </div>
                  <div className="rounded-xl bg-[color:var(--surface-2)] p-3 text-center">
                    <div className="text-[10px] font-bold uppercase text-[color:var(--text-muted)]">Distance</div>
                    <div className="text-sm font-black">{itinerary.route?.totalDistanceText || "--"}</div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                {itinerary.stops?.map((stop, index) => (
                  <div key={`${stop.name}-${index}`}>
                    <div
                      className={`rounded-2xl border-2 p-4 transition-all duration-300 ${
                        activeStopIndex === index
                          ? "border-[color:var(--wave-teal)] bg-[color:var(--wave-teal)]/5 shadow-lg"
                          : "border-[color:var(--border-soft)] bg-[color:var(--surface-1)] hover:border-[color:var(--wave-teal)]/50"
                      }`}
                      onMouseEnter={() => setActiveStopIndex(index)}
                      onClick={() => setActiveStopIndex(index)}
                    >
                      <div className="flex gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--wave-teal)] text-xs font-black text-white">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase text-[color:var(--wave-teal)]">
                              {stop.time_slot}
                            </span>
                            <Badge className="px-1.5 py-0 text-[9px]">{stop.type}</Badge>
                          </div>
                          <h4 className="truncate text-sm font-bold">{stop.name}</h4>
                          <p className="mt-0.5 line-clamp-2 text-xs text-[color:var(--text-muted)]">
                            {stop.activity}
                          </p>
                          {stop.place?.rating && (
                            <div className="mt-2 flex items-center gap-1 text-xs">
                              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                              <span className="font-bold">{stop.place.rating}</span>
                              {stop.place.googleMapsUrl && (
                                <a
                                  href={stop.place.googleMapsUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="ml-2 flex items-center gap-0.5 text-[color:var(--wave-teal)] hover:underline"
                                >
                                  Maps <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="text-xs font-bold">INR {stop.estimated_cost_per_person}</span>
                          <div className="text-[10px] text-[color:var(--text-muted)]">{stop.duration_minutes} min</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {itinerary.proTips?.length > 0 && (
                <Card className="rounded-2xl border-[color:var(--border-soft)] p-5">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
                    <Lightbulb className="h-4 w-4 text-[color:var(--wave-teal)]" /> Pro tips
                  </h3>
                  <ul className="space-y-2 text-xs">
                    {itinerary.proTips.map((tip, index) => (
                      <li key={`${tip}-${index}`} className="flex items-start gap-2">
                        <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-[color:var(--wave-teal)]" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              <Button variant="glow" className="w-full rounded-2xl py-5" onClick={() => setItinerary(null)}>
                <Rocket className="mr-2 h-5 w-5" /> Generate Another Plan
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden mesh-gradient text-[color:var(--wave-ink)]">
      <AuthDialog
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        onAuthSuccess={refreshUser}
      />

      <div className="relative mx-auto flex min-h-screen max-w-[1440px] flex-col">
        <header className="mx-4 mt-5 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--surface-1)]/90 px-4 py-4 backdrop-blur-xl sm:px-5 lg:mx-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--wave-teal)]/20 text-[color:var(--wave-teal)] shadow-[0_12px_40px_-24px_var(--glow)]">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                GoWavy <span className="text-[color:var(--wave-teal)]">Planner</span>
              </h1>
              <p className="text-xs text-[color:var(--text-muted)]">Signed in as {user.name}</p>
            </div>
          </div>
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </header>

        <main className="grid flex-1 grid-cols-1 gap-10 px-4 pb-24 pt-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
          <section className="space-y-10">
            {showGoogleSuccess && (
              <div className="rounded-2xl border border-[color:var(--wave-teal)]/35 bg-[color:var(--wave-teal)]/10 px-4 py-3 text-sm font-semibold text-[color:var(--wave-teal)]">
                Google login successful. Your planner session is ready.
              </div>
            )}

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="rounded-full border-[color:var(--border-strong)] bg-[color:var(--surface-2)] text-[color:var(--wave-teal)]">
                  Step 1 of 3
                </Badge>
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
                  Build your outing
                </span>
              </div>
              <h2 className="text-4xl font-semibold leading-tight md:text-5xl">
                Design Your
                <span className="bg-gradient-to-r from-[color:var(--wave-teal)] via-[color:var(--wave-blue)] to-[color:var(--wave-red)] bg-clip-text text-transparent">
                  {" "}Vibe
                </span>
              </h2>
              <p className="max-w-2xl text-sm text-[color:var(--text-muted)] sm:text-base">
                Tune each trip setting and generate an itinerary with stops, timing, pricing, and route guidance.
              </p>
            </div>

            <Card className="glass-card rounded-[2rem] border-[color:var(--border-soft)] p-8">
              <label className="mb-6 block text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
                Select atmosphere
              </label>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {vibeOptions.map((vibe) => (
                  <Button
                    key={vibe.id}
                    variant={selectedVibe === vibe.id ? "default" : "outline"}
                    className={`h-auto flex-col items-start gap-2 rounded-2xl border-2 px-4 py-4 ${
                      selectedVibe === vibe.id
                        ? "border-transparent bg-[color:var(--wave-teal)] text-white"
                        : "border-[color:var(--border-soft)] bg-[color:var(--surface-2)]"
                    }`}
                    onClick={() => setSelectedVibe(vibe.id)}
                  >
                    <span className="text-xs font-black uppercase tracking-widest">{vibe.label}</span>
                    <span className="text-[11px] opacity-85">{vibe.helper}</span>
                  </Button>
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <Card className="glass-panel rounded-[2rem] p-8">
                <label className="mb-6 block text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
                  When are we going?
                </label>
                <div className="flex gap-2 rounded-2xl bg-[color:var(--surface-2)] p-1.5">
                  {dateOptions.map((option) => (
                    <Button
                      key={option.label}
                      variant={selectedDuration === option.value ? "default" : "ghost"}
                      className={`flex-1 rounded-xl py-3 text-xs font-bold uppercase ${
                        selectedDuration === option.value ? "bg-[color:var(--wave-teal)] text-white" : ""
                      }`}
                      onClick={() => setSelectedDuration(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-3 text-sm font-medium text-[color:var(--wave-teal)]">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Planning for {selectedDuration === "short" ? "a quick hangout" : "a full day trip"}
                  </span>
                </div>
              </Card>

              <Card className="glass-panel rounded-[2rem] p-8">
                <label className="mb-6 block text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
                  The crew
                </label>
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-14 w-14 rounded-2xl border border-[color:var(--border-soft)]"
                    onClick={() => setCrewCount(Math.max(1, crewCount - 1))}
                  >
                    <UserMinus className="h-5 w-5" />
                  </Button>
                  <div className="text-center">
                    <span className="text-5xl font-extrabold">{crewCount.toString().padStart(2, "0")}</span>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--text-muted)]">
                      People
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-14 w-14 rounded-2xl border border-[color:var(--border-soft)]"
                    onClick={() => setCrewCount(crewCount + 1)}
                  >
                    <UserPlus className="h-5 w-5" />
                  </Button>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <Card className="glass-card rounded-[2rem] border-[color:var(--border-soft)] p-8">
                <div className="mb-6 flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
                    Budget range
                  </label>
                  <div className="rounded-full bg-[color:var(--surface-2)] px-3 py-1">
                    <span className="text-sm font-black text-[color:var(--wave-teal)]">{budgetMark}</span>
                  </div>
                </div>
                <input
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[color:var(--border-soft)] accent-[color:var(--wave-teal)]"
                  type="range"
                  min="1"
                  max="4"
                  value={budgetLevel}
                  onChange={(event) => setBudgetLevel(Number(event.target.value))}
                />
                <div className="mt-4 rounded-2xl bg-[color:var(--surface-2)] px-4 py-3 text-xs font-semibold">
                  {budgetTone} tier selected
                </div>
              </Card>

              <Card className="glass-card rounded-[2rem] border-[color:var(--border-soft)] p-8">
                <div className="mb-4 flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
                    Travel radius
                  </label>
                  <div className="rounded-full bg-[color:var(--surface-2)] px-3 py-1">
                    <span className="text-sm font-black text-[color:var(--wave-teal)]">{radius} mi</span>
                  </div>
                </div>
                <input
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[color:var(--border-soft)] accent-[color:var(--wave-teal)]"
                  type="range"
                  min="1"
                  max="50"
                  value={radius}
                  onChange={(event) => setRadius(Number(event.target.value))}
                />
                <div className="mt-4 rounded-2xl bg-[color:var(--surface-2)] px-4 py-3 text-xs font-semibold">
                  {radiusSummary}
                </div>
              </Card>
            </div>

            <Card className="glass-panel rounded-[2rem] p-6">
              <label className="mb-3 block text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--text-muted)]">
                Destination
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
                <Input
                  className="rounded-xl pl-10 pr-20"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="City or neighborhood"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute right-2 top-1/2 h-8 -translate-y-1/2 rounded-lg"
                  onClick={detectLocation}
                  disabled={detecting}
                >
                  {detecting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Auto"}
                </Button>
              </div>
            </Card>

            <Card className="glass-card rounded-[2rem] border-[color:var(--border-soft)] p-5 lg:hidden">
              <h3 className="mb-3 text-sm font-bold">Trip Brief</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-[color:var(--surface-2)] px-3 py-2">
                  Vibe: {vibeOptions.find((item) => item.id === selectedVibe)?.label}
                </div>
                <div className="rounded-xl bg-[color:var(--surface-2)] px-3 py-2">
                  Duration: {selectedDuration === "short" ? "Quick" : "Full day"}
                </div>
                <div className="rounded-xl bg-[color:var(--surface-2)] px-3 py-2">
                  Crew: {crewCount} people
                </div>
                <div className="rounded-xl bg-[color:var(--surface-2)] px-3 py-2">
                  Budget: {budgetTone}
                </div>
              </div>
            </Card>

            <Button
              className="w-full rounded-[2.5rem] bg-[color:var(--wave-red)] py-8 text-base font-black uppercase tracking-[0.15em] text-white transition-all hover:scale-[1.01] sm:text-lg"
              onClick={handleGenerate}
              disabled={isGenerateDisabled}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Building your plan...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-6 w-6" />
                  Generate Plan
                </>
              )}
            </Button>
            {!location.trim() && (
              <p className="text-center text-xs font-semibold text-[color:var(--text-muted)]">
                Add a destination to generate your itinerary.
              </p>
            )}
            {error && <p className="text-center font-bold text-[color:var(--wave-red)]">{error}</p>}
          </section>

          <aside className="hidden h-fit flex-col gap-8 lg:sticky lg:top-6 lg:flex">
            <Card className="glass-panel rounded-[2.5rem] p-8">
              <div className="mb-6 flex items-center gap-4">
                <Sparkles className="h-8 w-8 text-[color:var(--wave-teal)]" />
                <div>
                  <h3 className="text-xl font-bold">Trip Brief</h3>
                  <p className="text-[10px] font-bold uppercase text-[color:var(--text-muted)]">
                    Live summary
                  </p>
                </div>
              </div>
              <div className="space-y-4 text-sm">
                <div className="rounded-2xl bg-[color:var(--surface-2)] p-4">
                  <p className="font-semibold">Vibe: {vibeOptions.find((item) => item.id === selectedVibe)?.label}</p>
                </div>
                <div className="rounded-2xl bg-[color:var(--surface-2)] p-4">
                  <p className="font-semibold">Duration: {selectedDuration === "short" ? "Quick hangout" : "Full-day exploration"}</p>
                </div>
                <div className="rounded-2xl bg-[color:var(--surface-2)] p-4">
                  <p className="font-semibold">Crew size: {crewCount} people</p>
                </div>
                <div className="rounded-2xl bg-[color:var(--surface-2)] p-4">
                  <p className="font-semibold">Destination: {location || "Not set"}</p>
                </div>
              </div>
            </Card>
          </aside>
        </main>
      </div>
    </div>
  );
}
