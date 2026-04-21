"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useGeolocation } from "@/hooks/useGeolocation";
import LocationDisplay from "@/components/LocationDisplay";
import MoodSelector from "@/components/MoodSelector";
import BudgetSelector from "@/components/BudgetSelector";
import FriendsCounter from "@/components/FriendsCounter";
import DurationToggle from "@/components/DurationToggle";
import LoadingScreen from "@/components/LoadingScreen";
import { generateTrip, type TripPlan } from "@/services/api";

export default function HomePage() {
  const router = useRouter();
  const location = useGeolocation();

  const [mood, setMood] = useState("");
  const [budgetId, setBudgetId] = useState("");
  const [budgetValue, setBudgetValue] = useState(0);
  const [friends, setFriends] = useState(1);
  const [duration, setDuration] = useState<"short" | "full">("short");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFormValid = mood && budgetId && location.lat && location.lng;

  const handleGenerate = async () => {
    if (!location.lat || !location.lng) return;

    setLoading(true);
    setError(null);

    try {
      const trip: TripPlan = await generateTrip({
        lat: location.lat,
        lng: location.lng,
        friends,
        budget: budgetValue,
        mood,
        duration,
        currency: "INR",
      });

      // Store trip in sessionStorage and navigate
      sessionStorage.setItem("gowavy-trip", JSON.stringify(trip));
      router.push("/trip");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero section */}
      <div className="relative overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-wavy-600/10 blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-ocean-500/10 blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full bg-violet-500/8 blur-[80px] animate-pulse-glow" style={{ animationDelay: "3s" }} />

        <div className="relative max-w-lg mx-auto px-5 pt-12 pb-8">
          {/* Logo & title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-full bg-gradient-to-t from-wavy-500 to-ocean-400"
                    style={{
                      height: `${12 + Math.sin(i * 1.2) * 8}px`,
                      animation: `wave 2s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
              <h1 className="font-display text-4xl font-black text-gradient tracking-tight">
                GoWavy
              </h1>
            </div>
            <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed">
              Tell us your vibe, your crew, and your budget — our AI will craft the perfect trip for you
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Location */}
            <LocationDisplay
              city={location.city}
              country={location.country}
              loading={location.loading}
              error={location.error}
              onRetry={location.retry}
            />

            {/* Mood */}
            <MoodSelector selected={mood} onSelect={setMood} />

            {/* Friends */}
            <FriendsCounter count={friends} onChange={setFriends} />

            {/* Budget */}
            <BudgetSelector
              selected={budgetId}
              onSelect={(id, value) => {
                setBudgetId(id);
                setBudgetValue(value);
              }}
            />

            {/* Duration */}
            <DurationToggle selected={duration} onSelect={setDuration} />

            {/* Error message */}
            {error && (
              <div className="glass-light rounded-xl p-3 border border-red-500/20">
                <p className="text-sm text-red-400">❌ {error}</p>
              </div>
            )}

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={!isFormValid}
              className={`
                w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300
                ${
                  isFormValid
                    ? "bg-gradient-to-r from-wavy-500 via-ocean-500 to-mint-500 text-white shadow-xl shadow-wavy-500/25 hover:shadow-2xl hover:shadow-wavy-500/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }
              `}
            >
              {isFormValid ? "🌊 Generate My Trip" : "Fill all fields to continue"}
            </button>

            {/* Powered by */}
            <p className="text-center text-xs text-slate-600">
              Powered by Gemini AI & Google Maps
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
