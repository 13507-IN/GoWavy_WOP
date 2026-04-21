"use client";

import React from "react";

interface FriendsCounterProps {
  count: number;
  onChange: (count: number) => void;
}

export default function FriendsCounter({ count, onChange }: FriendsCounterProps) {
  const decrease = () => onChange(Math.max(0, count - 1));
  const increase = () => onChange(Math.min(20, count + 1));

  const totalPeople = count + 1;

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider">
        How many friends?
      </label>
      <div className="glass-light rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {Array.from({ length: Math.min(totalPeople, 5) }).map((_, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-wavy-400 to-ocean-500 border-2 border-slate-800 flex items-center justify-center text-xs font-bold text-white"
                style={{ zIndex: 5 - i }}
              >
                {i === 0 ? "👤" : "👥"}
              </div>
            ))}
            {totalPeople > 5 && (
              <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                +{totalPeople - 5}
              </div>
            )}
          </div>
          <div>
            <span className="text-white font-bold text-lg">{count}</span>
            <span className="text-slate-400 text-sm ml-1">
              friend{count !== 1 ? "s" : ""}
            </span>
            <p className="text-slate-500 text-xs">
              {totalPeople} total (including you)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={decrease}
            disabled={count <= 0}
            className="w-10 h-10 rounded-xl bg-slate-700/80 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white text-xl font-bold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            −
          </button>
          <button
            onClick={increase}
            disabled={count >= 20}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-wavy-500 to-ocean-500 hover:from-wavy-400 hover:to-ocean-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white text-xl font-bold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
