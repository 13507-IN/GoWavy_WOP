"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import RouteMap from "@/components/RouteMap";
import {
  Compass,
  Calendar,
  UserMinus,
  UserPlus,
  Rocket,
  Sparkles,
  Loader2,
  MapPin,
  Clock,
  DollarSign,
  ChevronRight,
  Lightbulb,
  Navigation,
  Star,
  ExternalLink,
} from "lucide-react";

const vibeOptions = [
  { id: "energy", emoji: "⚡", label: "High Energy" },
  { id: "chill", emoji: "🌊", label: "Chill Out" },
  { id: "gourmet", emoji: "🍽️", label: "Gourmet" },
  { id: "cultural", emoji: "🏛️", label: "Cultural" },
];

const dateOptions = [
  { label: "Now", value: "short" },
  { label: "Full Day", value: "full" },
];

const budgetMarks = ["$", "$$", "$$$", "$$$$"];
const budgetTones = ["Economy", "Comfort", "Premium", "Elite"];

export default function Planner() {
  const [selectedVibe, setSelectedVibe] = useState("energy");
  const [selectedDuration, setSelectedDuration] = useState("short");
  const [crewCount, setCrewCount] = useState(4);
  const [budgetLevel, setBudgetLevel] = useState(2);
  const [radius, setRadius] = useState(15);
  const [location, setLocation] = useState("Your Area");
  const [latLng, setLatLng] = useState({ lat: 12.9716, lng: 77.5946 }); // Default Bangalore
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [itinerary, setItinerary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeStopIndex, setActiveStopIndex] = useState(-1);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initVibe = params.get("vibe");
    if (initVibe) setSelectedVibe(initVibe);

    const initBudget = params.get("budget");
    if (initBudget) {
      const budgetNum = parseInt(initBudget, 10);
      if (budgetNum <= 100) setBudgetLevel(1);
      else if (budgetNum <= 300) setBudgetLevel(2);
      else if (budgetNum <= 600) setBudgetLevel(3);
      else setBudgetLevel(4);
    }

    const initLocation = params.get("location");
    if (initLocation) setLocation(initLocation);
  }, []);

  const detectLocation = () => {
    setDetecting(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLatLng({ lat: latitude, lng: longitude });
          
          try {
            const res = await fetch("http://localhost:5000/api/trip/geocode", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ lat: latitude, lng: longitude }),
            });
            const data = await res.json();
            if (data.city) setLocation(data.city); // Neighborhood, City
          } catch (err) {
            console.error("Geocoding failed", err);
            setLocation("My Location");
          } finally {
            setDetecting(false);
          }
        },
        (err) => {
          console.error("Geolocation error", err);
          setDetecting(false);
          setError("Could not detect location. Please type it manually.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setDetecting(false);
      setError("Geolocation not supported by your browser.");
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      let finalLat = latLng.lat;
      let finalLng = latLng.lng;

      // If user typed a custom location and didn't use Auto detect, we must find its coordinates
      if (location && location !== "Your Area" && location !== "My Location") {
        try {
          const geoRes = await fetch("http://localhost:5000/api/trip/forward-geocode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address: location }),
          });
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            finalLat = geoData.lat;
            finalLng = geoData.lng;
            setLatLng({ lat: finalLat, lng: finalLng });
          }
        } catch (e) {
          console.error("Failed to forward geocode custom location");
        }
      }

      const response = await fetch("http://localhost:5000/api/trip/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: finalLat,
          lng: finalLng,
          friends: crewCount - 1,
          budget: budgetLevel * 500,
          mood: selectedVibe,
          duration: selectedDuration,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate itinerary");
      const data = await response.json();
      setItinerary(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const budgetMark = budgetMarks[budgetLevel - 1] ?? "$$";
  const budgetTone = budgetTones[budgetLevel - 1] ?? "Comfort";
  const radiusSummary = radius <= 5 ? "Walkable" : radius <= 15 ? "Quick Drive" : "Explore Further";

  if (itinerary) {
    return (
      <div className="relative min-h-screen mesh-gradient text-[color:var(--wave-ink)]">
        {/* Header */}
        <header className="sticky top-0 z-30 mx-4 mt-4 flex items-center justify-between rounded-2xl border border-[color:var(--border-soft)] bg-[color:var(--surface-1)]/90 px-5 py-3 backdrop-blur-xl lg:mx-6">
          <div className="flex items-center gap-3">
            <Compass className="h-6 w-6 text-[color:var(--wave-teal)]" />
            <h1 className="text-lg font-bold">Your <span className="text-[color:var(--wave-teal)]">Wave</span> Plan</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="hidden sm:flex bg-[color:var(--wave-teal)]/10 text-[color:var(--wave-teal)] border-[color:var(--wave-teal)]/30">
              <Navigation className="h-3 w-3 mr-1" />
              {itinerary.route?.totalDistanceText || `${itinerary.stops?.length} stops`}
            </Badge>
            <Button variant="outline" size="sm" onClick={() => setItinerary(null)}>New Plan</Button>
          </div>
        </header>

        {/* Map + Content */}
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-12 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
            {/* Map Panel */}
            <div className="lg:sticky lg:top-20 lg:self-start space-y-4">
              <RouteMap
                stops={itinerary.stops || []}
                route={itinerary.route}
                activeStopIndex={activeStopIndex}
                onStopClick={setActiveStopIndex}
                className="h-[50vh] lg:h-[calc(100vh-120px)] rounded-[2rem] border border-[color:var(--border-soft)] shadow-xl"
              />
            </div>

            {/* Itinerary Panel */}
            <div className="space-y-6">
              {/* Title Card */}
              <Card className="overflow-hidden rounded-[2rem] border-none shadow-xl">
                <CardHeader className="bg-gradient-to-br from-[color:var(--wave-teal)] to-[color:var(--wave-blue)] p-6 text-white">
                  <Badge className="w-fit bg-white/20 text-white border-none text-[10px]">AI Generated</Badge>
                  <CardTitle className="text-2xl font-bold mt-2">{itinerary.title}</CardTitle>
                  <p className="text-white/80 text-sm mt-1">{itinerary.summary}</p>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-4 divide-x divide-[color:var(--border-soft)]">
                    {[
                      { icon: Clock, label: "Duration", val: `${itinerary.totalDurationHours}h` },
                      { icon: DollarSign, label: "Cost/pp", val: `₹${itinerary.totalCostPerPerson}` },
                      { icon: MapPin, label: "Stops", val: itinerary.stops?.length },
                      { icon: Navigation, label: "Distance", val: itinerary.route?.totalDistanceText || "—" },
                    ].map((s, i) => (
                      <div key={i} className="p-3 text-center">
                        <s.icon className="h-4 w-4 mx-auto text-[color:var(--wave-teal)] mb-1" />
                        <div className="text-[10px] text-[color:var(--text-muted)] uppercase font-bold">{s.label}</div>
                        <div className="font-bold text-sm">{s.val}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Stops Timeline */}
              <div className="space-y-3">
                {itinerary.stops?.map((stop: any, index: number) => (
                  <div key={index}>
                    <div
                      className={`group relative rounded-2xl border-2 p-4 cursor-pointer transition-all duration-300 ${
                        activeStopIndex === index
                          ? "border-[color:var(--wave-teal)] bg-[color:var(--wave-teal)]/5 shadow-lg scale-[1.01]"
                          : "border-[color:var(--border-soft)] bg-[color:var(--surface-1)] hover:border-[color:var(--wave-teal)]/50 hover:shadow-md"
                      }`}
                      onClick={() => setActiveStopIndex(index)}
                      onMouseEnter={() => setActiveStopIndex(index)}
                    >
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center shrink-0">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black ${
                            activeStopIndex === index ? "bg-[color:var(--wave-teal)] shadow-[0_0_16px_var(--glow)]" : "bg-[color:var(--wave-teal)]/70"
                          }`}>{index + 1}</div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-[color:var(--wave-teal)] uppercase">{stop.time_slot}</span>
                            <Badge className="text-[9px] px-1.5 py-0">{stop.type}</Badge>
                          </div>
                          <h4 className="font-bold text-sm truncate">{stop.name}</h4>
                          <p className="text-xs text-[color:var(--text-muted)] mt-0.5 line-clamp-2">{stop.activity}</p>
                          {stop.place?.rating && (
                            <div className="flex items-center gap-1 mt-2 text-xs">
                              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                              <span className="font-bold">{stop.place.rating}</span>
                              {stop.place?.googleMapsUrl && (
                                <a href={stop.place.googleMapsUrl} target="_blank" rel="noreferrer"
                                  className="ml-2 text-[color:var(--wave-teal)] hover:underline flex items-center gap-0.5">
                                  Maps <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold">₹{stop.estimated_cost_per_person}</span>
                          <div className="text-[10px] text-[color:var(--text-muted)]">{stop.duration_minutes}min</div>
                        </div>
                      </div>
                    </div>
                    {/* Route leg info between stops */}
                    {index < (itinerary.stops?.length || 0) - 1 && itinerary.route?.legs?.[index] && (
                      <div className="flex items-center gap-2 py-1.5 pl-7">
                        <div className="w-px h-4 bg-[color:var(--border-soft)]" />
                        <Navigation className="h-3 w-3 text-[color:var(--wave-teal)]/50 rotate-180" />
                        <span className="text-[10px] text-[color:var(--text-muted)] font-bold">
                          {itinerary.route.legs[index].distanceText} · {itinerary.route.legs[index].durationText}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pro Tips */}
              {itinerary.proTips?.length > 0 && (
                <Card className="rounded-2xl border-[color:var(--border-soft)] p-5">
                  <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-[color:var(--wave-teal)]" /> Pro Tips
                  </h3>
                  <ul className="space-y-2">
                    {itinerary.proTips.map((tip: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <Sparkles className="h-3 w-3 text-[color:var(--wave-teal)] shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}

              <Button variant="glow" className="w-full rounded-2xl py-5" onClick={() => setItinerary(null)}>
                <Rocket className="h-5 w-5 mr-2" /> Generate Another Plan
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden mesh-gradient text-[color:var(--wave-ink)]">
      <div className="relative mx-auto flex min-h-screen max-w-[1440px] flex-col">
        <header className="mx-4 mt-5 flex items-center justify-between rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--surface-1)]/90 px-5 py-4 backdrop-blur-xl lg:mx-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--wave-teal)]/20 text-[color:var(--wave-teal)] shadow-[0_12px_40px_-24px_var(--glow)]">
              <Compass className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">GoWavy <span className="text-[color:var(--wave-teal)]">Planner</span></h1>
          </div>
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </header>

        <main className="flex-1 grid grid-cols-1 gap-10 px-6 pb-24 pt-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
          <section className="space-y-10">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="rounded-full border-[color:var(--border-strong)] bg-[color:var(--surface-2)] text-[color:var(--wave-teal)]">Step 1 of 3</Badge>
                <span className="text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--text-muted)]">Build your perfect outing</span>
              </div>
              <h2 className="text-4xl font-semibold leading-tight md:text-5xl">
                Design Your <span className="bg-gradient-to-r from-[color:var(--wave-teal)] via-[color:var(--wave-blue)] to-[color:var(--wave-red)] bg-clip-text text-transparent">Vibe</span>
              </h2>
            </div>

            {/* Atmosphere Selector */}
            <Card className="glass-card rounded-[2rem] border-[color:var(--border-soft)] p-8 hover-pop">
              <label className="mb-6 block text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--text-muted)]">Select Your Atmosphere</label>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {vibeOptions.map((vibe) => (
                  <Button
                    key={vibe.id}
                    variant={selectedVibe === vibe.id ? "default" : "outline"}
                    className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 px-4 py-5 h-auto transition-all ${
                      selectedVibe === vibe.id ? "border-transparent bg-[color:var(--wave-teal)] text-white shadow-[0_20px_60px_-40px_var(--glow)]" : "border-[color:var(--border-soft)] bg-[color:var(--surface-2)]"
                    }`}
                    onClick={() => setSelectedVibe(vibe.id)}
                  >
                    <span className="text-3xl">{vibe.emoji}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest">{vibe.label}</span>
                  </Button>
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <Card className="glass-panel rounded-[2rem] p-8">
                <label className="mb-6 block text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--text-muted)]">When are we going?</label>
                <div className="flex gap-2 rounded-2xl bg-[color:var(--surface-2)] p-1.5">
                  {dateOptions.map((opt) => (
                    <Button
                      key={opt.label}
                      variant={selectedDuration === opt.value ? "default" : "ghost"}
                      className={`flex-1 rounded-xl py-3 text-xs font-bold uppercase ${
                        selectedDuration === opt.value ? "bg-[color:var(--wave-teal)] text-white shadow-md" : ""
                      }`}
                      onClick={() => setSelectedDuration(opt.value)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-3 text-sm font-medium text-[color:var(--wave-teal)]">
                  <Calendar className="h-4 w-4" />
                  <span>Planning for {selectedDuration === "short" ? "A quick hangout" : "A full day trip"}</span>
                </div>
              </Card>

              <Card className="glass-panel rounded-[2rem] p-8">
                <label className="mb-6 block text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--text-muted)]">The Crew</label>
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl border border-[color:var(--border-soft)]" onClick={() => setCrewCount(Math.max(1, crewCount - 1))}>
                    <UserMinus className="h-5 w-5" />
                  </Button>
                  <div className="text-center">
                    <span className="text-5xl font-extrabold">{crewCount.toString().padStart(2, "0")}</span>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--text-muted)]">People</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl border border-[color:var(--border-soft)]" onClick={() => setCrewCount(crewCount + 1)}>
                    <UserPlus className="h-5 w-5" />
                  </Button>
                </div>
              </Card>
            </div>

            {/* Budget & Radius */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <Card className="glass-card rounded-[2rem] border-[color:var(--border-soft)] p-8">
                <div className="mb-6 flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--text-muted)]">Budget Range</label>
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
                  onChange={(e) => setBudgetLevel(Number(e.target.value))}
                />
                <div className="mt-4 rounded-2xl bg-[color:var(--surface-2)] px-4 py-3 text-xs font-semibold">
                  {budgetTone} tier selected
                </div>
              </Card>

              <Card className="glass-card rounded-[2rem] border-[color:var(--border-soft)] p-8">
                <div className="mb-6 flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-[0.3em] text-[color:var(--text-muted)]">Travel Radius</label>
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
                  onChange={(e) => setRadius(Number(e.target.value))}
                />
                <div className="mt-4 rounded-2xl bg-[color:var(--surface-2)] px-4 py-3 text-xs font-semibold">
                  {radiusSummary}
                </div>
              </Card>
            </div>

            <Button
              className="w-full rounded-[2.5rem] bg-[color:var(--wave-red)] py-8 text-lg font-black uppercase tracking-[0.2em] text-white shadow-xl hover:scale-[1.01] transition-all"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Stitching your vibe...
                </>
              ) : (
                <>
                  <Rocket className="h-6 w-6 mr-2" />
                  Generate Plan
                </>
              )}
            </Button>
            {error && <p className="text-center text-[color:var(--wave-red)] font-bold">{error}</p>}
          </section>

          <aside className="hidden lg:flex h-fit flex-col gap-8 lg:sticky lg:top-6">
            <Card className="glass-panel rounded-[2.5rem] p-8">
              <div className="flex items-center gap-4 mb-6">
                <Sparkles className="h-8 w-8 text-[color:var(--wave-teal)]" />
                <div>
                  <h3 className="text-xl font-bold">Concierge AI</h3>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[color:var(--wave-teal)] animate-pulse"></span>
                    <p className="text-[10px] font-bold uppercase text-[color:var(--text-muted)]">Scanning your vibe</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--surface-2)] p-5 text-sm">
                  <p>Energy vibes? I've locked onto some <span className="font-bold text-[color:var(--wave-teal)]">trending rooftop venues</span>.</p>
                </div>
                <div className="mt-auto rounded-3xl border border-[color:var(--border-soft)] bg-[color:var(--surface-2)] p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <Lightbulb className="h-5 w-5 text-[color:var(--wave-teal)]" />
                    <span className="text-xs font-black uppercase text-[color:var(--wave-teal)]">Expert Insight</span>
                  </div>
                  <p className="text-xs font-medium leading-relaxed opacity-70">
                    Spots with high-energy peaks are trending tonight.
                  </p>
                </div>
              </div>
            </Card>

            {/* Map Preview */}
            <div className="group relative h-56 overflow-hidden rounded-[2.5rem] border border-[color:var(--border-soft)] shadow-xl">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMALFlJJ1jZkHPGX2lfBTnlitlo_cmvgALBCfk1fWDas316f83plo1G2Ljc8aswYbXnzFU5TYLPz8QAWgqesfBsmnHdIe4f5NM0x8S8pq7jneo6gzbleeZ3FmYBFVwPz8vA8PFHvTaW_6dwgsYf8xOkWNhv2iCiYZSxXVbx_fZZi8IaBjtMY3HG-zKUnBEUVksuUrajHLn3Pw596ifxffCtmOEPTF8cqt66vaGSa_vFExX5Ip5Hg1OuCaZSHudYtitsB5eFCFoNiw"
                alt="Live Map Preview"
                fill
                className="object-cover grayscale brightness-75 contrast-125 transition-all duration-500 group-hover:scale-110 group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--wave-navy)]/90 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[color:var(--wave-teal)] animate-ping"></div>
                  <span className="text-xs font-black uppercase tracking-widest text-white">
                    Scanning {location}
                  </span>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 text-[10px] bg-white/10 border-white/20 text-white hover:bg-white/20"
                  onClick={detectLocation}
                  disabled={detecting}
                >
                  {detecting ? "..." : "Auto"}
                </Button>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
