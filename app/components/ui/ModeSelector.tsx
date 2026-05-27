import React from "react";
import { Zap, BarChart3, FileText } from "lucide-react";
import type { TradingMode } from "../../types";

const MODES: { value: TradingMode; label: string; icon: React.ElementType }[] = [
  { value: "live", label: "Live Trading", icon: Zap },
  { value: "analysis", label: "Analysis", icon: BarChart3 },
  { value: "reports", label: "Reports", icon: FileText },
];

export interface ModeSelectorProps {
  value: TradingMode;
  onChange: (mode: TradingMode) => void;
}

export function ModeSelector({ value, onChange }: ModeSelectorProps) {
  return (
    <div className="flex gap-1 bg-white/5 rounded-lg p-1">
      {MODES.map((mode) => {
        const Icon = mode.icon;
        const active = value === mode.value;
        return (
          <button
            key={mode.value}
            onClick={() => onChange(mode.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              active
                ? "bg-blue-600/30 text-blue-300 ring-1 ring-blue-500/40"
                : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
            }`}
          >
            <Icon className={`w-4 h-4 ${active ? "text-blue-300" : "text-gray-500"}`} />
            <span>{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}
