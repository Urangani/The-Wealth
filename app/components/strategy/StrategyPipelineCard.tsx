import React from "react";

interface StrategyPipelineCardProps {
  strategy: any;
  onSelect: (id: string) => void;
  onPromote: (id: string, currentStage: string) => void;
  inferredStage: string;
}

export const StrategyPipelineCard: React.FC<StrategyPipelineCardProps> = ({
  strategy,
  onSelect,
  onPromote,
  inferredStage,
}) => {
  const conf = strategy.confidenceScore ?? strategy.tracking?.confidenceScore ?? 0;
  
  return (
    <button
      onClick={() => onSelect(strategy.id)}
      className="w-full text-left rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 hover:bg-white/[0.06] transition-colors group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[12px] font-semibold text-white truncate">{strategy.name}</div>
          <div className="text-[10px] font-mono text-gray-600 truncate">{strategy.id}</div>
        </div>
        <div className="text-right">
          <div className={`text-[10px] font-bold ${conf > 70 ? "text-emerald-300" : "text-blue-300"}`}>
            {conf.toFixed(0)}
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ${
            strategy.enabled
              ? "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20"
              : "bg-gray-700/50 text-gray-400 ring-white/10"
          }`}
        >
          {strategy.enabled ? "ACTIVE" : "PAUSED"}
        </span>
        <span className="text-[10px] text-gray-500">{strategy.category || "General"}</span>
      </div>

      <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          className="w-full rounded-lg bg-blue-500/10 ring-1 ring-blue-500/20 text-blue-300 px-2 py-1 text-[10px] font-medium hover:bg-blue-500/20"
          onClick={(e) => {
            e.stopPropagation();
            onPromote(strategy.id, inferredStage);
          }}
        >
          Promote →
        </button>
      </div>
    </button>
  );
};
