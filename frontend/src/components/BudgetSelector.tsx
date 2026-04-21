"use client";

import React from "react";

const budgetOptions = [
  { id: "low", label: "Budget", range: "₹200 - ₹500", emoji: "💵", description: "Street food & parks" },
  { id: "medium", label: "Mid-Range", range: "₹500 - ₹1500", emoji: "💰", description: "Cafes & activities" },
  { id: "high", label: "Premium", range: "₹1500 - ₹3000", emoji: "💎", description: "Fine dining & experiences" },
  { id: "luxury", label: "Luxury", range: "₹3000+", emoji: "👑", description: "No limits, best of best" },
];

const budgetValues: Record<string, number> = {
  low: 400,
  medium: 1000,
  high: 2500,
  luxury: 5000,
};

interface BudgetSelectorProps {
  selected: string;
  onSelect: (budget: string, value: number) => void;
}

export default function BudgetSelector({ selected, onSelect }: BudgetSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-slate-300 uppercase tracking-wider">
        Per person budget
      </label>
      <div className="grid grid-cols-2 gap-3">
        {budgetOptions.map((option) => {
          const isSelected = selected === option.id;
          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id, budgetValues[option.id])}
              className={`
                relative flex flex-col items-start gap-1 p-4 rounded-2xl text-left
                transition-all duration-300 ease-out cursor-pointer
                ${
                  isSelected
                    ? "bg-gradient-to-br from-wavy-600/80 to-ocean-600/80 text-white shadow-xl glow-blue scale-[1.02] border border-wavy-400/30"
                    : "glass-light hover:bg-slate-700/50 text-slate-300 hover:text-white hover:scale-[1.01]"
                }
              `}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{option.emoji}</span>
                <span className="font-bold text-sm">{option.label}</span>
              </div>
              <span className={`text-xs ${isSelected ? "text-wavy-200" : "text-slate-400"}`}>
                {option.range}
              </span>
              <span className={`text-[11px] ${isSelected ? "text-wavy-300" : "text-slate-500"}`}>
                {option.description}
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
