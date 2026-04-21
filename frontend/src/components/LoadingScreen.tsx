"use client";

import React from "react";

const loadingMessages = [
  "🤖 AI is crafting your perfect trip...",
  "🗺️ Discovering amazing places near you...",
  "📍 Mapping the best route...",
  "✨ Adding the finishing touches...",
];

export default function LoadingScreen() {
  const [messageIndex, setMessageIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center">
      <div className="text-center space-y-8 px-6">
        {/* Animated wave logo */}
        <div className="flex items-center justify-center gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-3 rounded-full bg-gradient-to-t from-wavy-500 to-ocean-400"
              style={{
                animation: `wave 1.5s ease-in-out ${i * 0.15}s infinite`,
                height: `${24 + Math.sin(i * 0.8) * 16}px`,
              }}
            />
          ))}
        </div>

        {/* Spinner */}
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-full border-2 border-slate-700" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-wavy-400 border-r-ocean-400 animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-coral-400 border-l-violet-400 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">🌊</span>
          </div>
        </div>

        {/* Loading message */}
        <div className="space-y-2">
          <p className="text-lg font-semibold text-white transition-all duration-500">
            {loadingMessages[messageIndex]}
          </p>
          <p className="text-sm text-slate-500">This usually takes 10-15 seconds</p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                i <= messageIndex ? "bg-wavy-400 scale-100" : "bg-slate-700 scale-75"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
