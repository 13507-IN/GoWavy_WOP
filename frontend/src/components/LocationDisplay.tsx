"use client";

import React from "react";

interface LocationDisplayProps {
  city: string | null;
  country: string | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export default function LocationDisplay({
  city,
  country,
  loading,
  error,
  onRetry,
}: LocationDisplayProps) {
  if (loading) {
    return (
      <div className="glass-light rounded-2xl p-4 flex items-center gap-3 animate-pulse">
        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
          <svg className="w-5 h-5 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-slate-300">Detecting your location...</p>
          <p className="text-xs text-slate-500">Please allow location access</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-light rounded-2xl p-4 flex items-center justify-between border border-red-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <span className="text-lg">📍</span>
          </div>
          <div>
            <p className="text-sm font-medium text-red-400">{error}</p>
            <p className="text-xs text-slate-500">We need your location to plan a trip</p>
          </div>
        </div>
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm font-semibold text-white bg-wavy-600 hover:bg-wavy-500 rounded-xl transition-all duration-200 cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="glass-light rounded-2xl p-4 flex items-center gap-3 border border-emerald-500/20">
      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
        <span className="text-lg">📍</span>
      </div>
      <div>
        <p className="text-sm font-medium text-emerald-400">Location detected</p>
        <p className="text-white font-semibold">
          {city}
          {country ? `, ${country}` : ""}
        </p>
      </div>
      <button
        onClick={onRetry}
        className="ml-auto text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
      >
        Refresh
      </button>
    </div>
  );
}
