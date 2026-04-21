"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { TripPlan } from "@/services/api";
import TripMap from "@/components/TripMap";
import ItineraryTimeline from "@/components/ItineraryTimeline";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

export default function TripPage() {
  const router = useRouter();
  const [trip, setTrip] = useState<TripPlan | null>(null);
  const [activeStop, setActiveStop] = useState(0);
  const [showTimeline, setShowTimeline] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("gowavy-trip");
    if (stored) {
      try {
        setTrip(JSON.parse(stored));
      } catch {
        router.push("/");
      }
    } else {
      router.push("/");
    }
  }, [router]);

  const handleRegenerate = () => {
    sessionStorage.removeItem("gowavy-trip");
    router.push("/");
  };

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-wavy-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between p-3 glass border-b border-slate-700/50">
        <button
          onClick={handleRegenerate}
          className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="flex items-center gap-2">
          <span className="text-lg">🌊</span>
          <span className="font-display font-bold text-white text-sm">GoWavy</span>
        </div>
        <button
          onClick={() => setShowTimeline(!showTimeline)}
          className="text-sm text-wavy-400 font-semibold cursor-pointer"
        >
          {showTimeline ? "Map" : "List"}
        </button>
      </div>

      {/* Desktop sidebar - Timeline */}
      <div
        className={`
          ${showTimeline ? "flex" : "hidden"} lg:flex flex-col
          w-full lg:w-[420px] xl:w-[460px] flex-shrink-0
          h-[calc(100vh-52px)] lg:h-screen
          glass border-r border-slate-700/50
          lg:order-1 order-2
        `}
      >
        {/* Desktop back button */}
        <div className="hidden lg:flex items-center gap-3 p-4 border-b border-slate-700/50">
          <button
            onClick={handleRegenerate}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            New Trip
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5">
            <span className="text-sm">🌊</span>
            <span className="font-display font-bold text-white text-xs">GoWavy</span>
          </div>
        </div>

        <ItineraryTimeline
          trip={trip}
          activeStop={activeStop}
          onStopClick={setActiveStop}
          onRegenerate={handleRegenerate}
        />
      </div>

      {/* Map */}
      <div
        className={`
          ${!showTimeline ? "flex" : "hidden"} lg:flex
          flex-1 order-1 lg:order-2
          h-[calc(100vh-52px)] lg:h-screen
        `}
      >
        {GOOGLE_MAPS_API_KEY ? (
          <TripMap
            trip={trip}
            activeStop={activeStop}
            onStopClick={setActiveStop}
            googleMapsApiKey={GOOGLE_MAPS_API_KEY}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center glass">
            <div className="text-center space-y-4 p-8">
              <span className="text-5xl">🗺️</span>
              <h3 className="text-xl font-bold text-white">Map Preview</h3>
              <p className="text-sm text-slate-400 max-w-sm">
                Add <code className="text-wavy-400 bg-slate-800 px-2 py-0.5 rounded text-xs">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your <code className="text-wavy-400 bg-slate-800 px-2 py-0.5 rounded text-xs">.env.local</code> to see the interactive map.
              </p>

              {/* Show places list as fallback */}
              <div className="mt-6 space-y-2 text-left max-w-sm">
                {trip.stops.map((stop, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl cursor-pointer transition-all ${
                      activeStop === i
                        ? "glass-card border-wavy-500/30"
                        : "glass-light hover:bg-slate-700/30"
                    }`}
                    onClick={() => setActiveStop(i)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-br from-wavy-500 to-ocean-500 flex items-center justify-center text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-white">{stop.name}</span>
                    </div>
                    {stop.place?.googleMapsUrl && (
                      <a
                        href={stop.place.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-wavy-400 hover:underline ml-8 block mt-1"
                      >
                        Open in Google Maps →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
