"use client";

import React from "react";

const moods = [
  { id: "adventurous", emoji: "🏔️", label: "Adventurous", color: "from-orange-500 to-amber-500", glow: "shadow-orange-500/30" },
  { id: "chill", emoji: "😌", label: "Chill & Relax", color: "from-cyan-500 to-blue-500", glow: "shadow-cyan-500/30" },
  { id: "foodie", emoji: "🍕", label: "Foodie", color: "from-red-500 to-pink-500", glow: "shadow-red-500/30" },
  { id: "romantic", emoji: "💕", label: "Romantic", color: "from-pink-500 to-rose-500", glow: "shadow-pink-500/30" },
  { id: "party", emoji: "🎉", label: "Party", color: "from-violet-500 to-purple-500", glow: "shadow-violet-500/30" },
  { id: "cultural", emoji: "🎨", label: "Cultural", color: "from-emerald-500 to-teal-500", glow: "shadow-emerald-500/30" },
  { id: "nature", emoji: "🌿", label: "Nature", color: "from-green-500 to-lime-500", glow: "shadow-green-500/30" },
  { id: "shopping", emoji: "🛍️", label: "Shopping", color: "from-fuchsia-500 to-pink-500", glow: "shadow-fuchsia-500/30" },
];

interface MoodSelectorProps {
  selected: string;
  onSelect: (mood: string) => void;
}

export default function MoodSelector({ selected, onSelect }: MoodSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider">
        What&apos;s your mood?
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {moods.map((mood) => {
          const isSelected = selected === mood.id;
          return (
            <button
              key={mood.id}
              onClick={() => onSelect(mood.id)}
              className={`
                relative group flex flex-col items-center gap-2 p-4 rounded-2xl
                transition-all duration-300 ease-out cursor-pointer
                ${
                  isSelected
                    ? `bg-gradient-to-br ${mood.color} text-white shadow-xl ${mood.glow} scale-[1.03]`
                    : "glass-light hover:bg-slate-700/50 text-slate-300 hover:text-white hover:scale-[1.02]"
                }
              `}
            >
              <span className="text-3xl transition-transform duration-300 group-hover:scale-110">
                {mood.emoji}
              </span>
              <span className={`text-xs font-semibold tracking-wide ${isSelected ? "text-white" : ""}`}>
                {mood.label}
              </span>
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-3 h-3 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
