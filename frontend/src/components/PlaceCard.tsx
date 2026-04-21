"use client";

import React from "react";
import type { TripStop } from "@/services/api";

interface PlaceCardProps {
  stop: TripStop;
  index: number;
  isActive: boolean;
  onClick: () => void;
}

const typeIcons: Record<string, string> = {
  cafe: "☕",
  restaurant: "🍽️",
  park: "🌳",
  museum: "🏛️",
  mall: "🏬",
  beach: "🏖️",
  viewpoint: "🌄",
  adventure: "🧗",
  temple: "🛕",
  bar: "🍸",
  club: "🎵",
  market: "🛒",
  theater: "🎭",
  gallery: "🖼️",
};

export default function PlaceCard({ stop, index, isActive, onClick }: PlaceCardProps) {
  const icon = typeIcons[stop.type] || "📍";

  return (
    <div
      onClick={onClick}
      className={`
        relative p-4 rounded-2xl cursor-pointer transition-all duration-300 ease-out
        ${
          isActive
            ? "glass-card border-wavy-500/30 shadow-lg shadow-wavy-500/10 scale-[1.02]"
            : "glass-light hover:bg-slate-700/30 hover:scale-[1.01]"
        }
      `}
    >
      {/* Order badge */}
      <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-gradient-to-br from-wavy-500 to-ocean-500 flex items-center justify-center text-xs font-bold text-white shadow-lg z-10">
        {index + 1}
      </div>

      <div className="flex gap-3">
        {/* Photo or icon */}
        <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-slate-700/50 flex items-center justify-center">
          {stop.place?.photoUrl ? (
            <img
              src={stop.place.photoUrl}
              alt={stop.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl">{icon}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-bold text-white text-sm truncate">
              {stop.place?.name || stop.name}
            </h4>
            {stop.place?.rating && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-yellow-400 text-xs">⭐</span>
                <span className="text-xs font-semibold text-yellow-400">{stop.place.rating}</span>
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{stop.activity}</p>

          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className="text-slate-500">
              🕐 {stop.time_slot}
            </span>
            <span className="text-emerald-400 font-semibold">
              ₹{stop.estimated_cost_per_person}
            </span>
          </div>

          {/* Status badges */}
          <div className="flex items-center gap-2 mt-2">
            {stop.place?.isOpen !== null && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                stop.place.isOpen
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-red-500/20 text-red-400"
              }`}>
                {stop.place.isOpen ? "Open Now" : "Closed"}
              </span>
            )}
            {stop.validated && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-wavy-500/20 text-wavy-400">
                ✓ Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Vibe text */}
      {isActive && stop.vibe && (
        <p className="text-xs text-slate-400 mt-3 italic border-t border-slate-700/50 pt-3">
          &ldquo;{stop.vibe}&rdquo;
        </p>
      )}

      {/* Action buttons when active */}
      {isActive && stop.place?.googleMapsUrl && (
        <div className="mt-3 flex gap-2">
          <a
            href={stop.place.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-xs font-semibold py-2 rounded-xl bg-wavy-600/80 hover:bg-wavy-500 text-white transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Open in Maps →
          </a>
        </div>
      )}
    </div>
  );
}
