"use client";

import React from "react";
import type { TripPlan } from "@/services/api";
import PlaceCard from "./PlaceCard";

interface ItineraryTimelineProps {
  trip: TripPlan;
  activeStop: number;
  onStopClick: (index: number) => void;
  onRegenerate: () => void;
}

export default function ItineraryTimeline({
  trip,
  activeStop,
  onStopClick,
  onRegenerate,
}: ItineraryTimelineProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-slate-700/50">
        <h2 className="font-display text-xl font-bold text-white leading-tight">
          {trip.title}
        </h2>
        <p className="text-sm text-slate-400 mt-1">{trip.summary}</p>

        {/* Stats bar */}
        <div className="flex items-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-wavy-400">📍</span>
            <span className="text-slate-300">
              {trip.location.city}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-400">💰</span>
            <span className="text-slate-300">
              ₹{trip.totalCostPerPerson}/person
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sunset-400">⏱️</span>
            <span className="text-slate-300">
              {trip.totalDurationHours}hrs
            </span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto timeline-scroll p-4 space-y-3">
        {trip.stops.map((stop, index) => (
          <React.Fragment key={index}>
            <PlaceCard
              stop={stop}
              index={index}
              isActive={activeStop === index}
              onClick={() => onStopClick(index)}
            />

            {/* Travel leg between stops */}
            {index < trip.stops.length - 1 && trip.route?.legs?.[index] && (
              <div className="flex items-center gap-2 pl-6 py-1">
                <div className="w-0.5 h-6 bg-slate-700" />
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>🚗</span>
                  <span>{trip.route.legs[index].durationText}</span>
                  <span>·</span>
                  <span>{trip.route.legs[index].distanceText}</span>
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Bottom actions */}
      <div className="p-4 border-t border-slate-700/50 space-y-3">
        {/* Pro tips */}
        {trip.proTips && trip.proTips.length > 0 && (
          <div className="glass-light rounded-xl p-3">
            <p className="text-xs font-semibold text-wavy-400 mb-1">💡 Pro Tips</p>
            <ul className="text-xs text-slate-400 space-y-1">
              {trip.proTips.slice(0, 2).map((tip, i) => (
                <li key={i}>• {tip}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Route summary */}
        {trip.route?.totalDistanceText && (
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Total travel: {trip.route.totalDistanceText}</span>
            <span>Drive time: {trip.route.totalDurationText}</span>
          </div>
        )}

        <button
          onClick={onRegenerate}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-wavy-600 to-ocean-600 hover:from-wavy-500 hover:to-ocean-500 text-white font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-wavy-500/20 cursor-pointer"
        >
          🔄 Generate New Plan
        </button>
      </div>
    </div>
  );
}
