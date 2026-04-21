"use client";

import React from "react";

interface DurationToggleProps {
  selected: "short" | "full";
  onSelect: (duration: "short" | "full") => void;
}

export default function DurationToggle({ selected, onSelect }: DurationToggleProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider">
        Trip duration
      </label>
      <div className="glass-light rounded-2xl p-1.5 flex gap-1.5">
        <button
          onClick={() => onSelect("short")}
          className={`
            flex-1 flex flex-col items-center gap-1 py-4 px-3 rounded-xl
            transition-all duration-300 cursor-pointer
            ${
              selected === "short"
                ? "bg-gradient-to-br from-sunset-500/90 to-coral-500/90 text-white shadow-lg shadow-orange-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-700/30"
            }
          `}
        >
          <span className="text-2xl">⚡</span>
          <span className="font-bold text-sm">Quick Hangout</span>
          <span className={`text-xs ${selected === "short" ? "text-orange-200" : "text-slate-500"}`}>
            2-3 hours
          </span>
        </button>
        <button
          onClick={() => onSelect("full")}
          className={`
            flex-1 flex flex-col items-center gap-1 py-4 px-3 rounded-xl
            transition-all duration-300 cursor-pointer
            ${
              selected === "full"
                ? "bg-gradient-to-br from-wavy-500/90 to-violet-500/90 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-700/30"
            }
          `}
        >
          <span className="text-2xl">🌅</span>
          <span className="font-bold text-sm">Full Day Trip</span>
          <span className={`text-xs ${selected === "full" ? "text-blue-200" : "text-slate-500"}`}>
            8-10 hours
          </span>
        </button>
      </div>
    </div>
  );
}
