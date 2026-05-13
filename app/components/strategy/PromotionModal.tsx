import React from "react";

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategy: any;
  targetStage: string;
  preview: any;
  onPromote: (target: string, mode: "promote" | "optimization") => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({
  isOpen,
  onClose,
  strategy,
  targetStage,
  preview,
  onPromote,
}) => {
  if (!isOpen || !strategy) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-2">Promote Strategy</h3>
        <p className="text-sm text-gray-500 mb-6">
          You are promoting <span className="text-white font-semibold">{strategy.name}</span> to the <span className="text-blue-400 font-semibold">{targetStage}</span> stage.
        </p>

        {preview && (
          <div className="space-y-4 mb-8">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <p className="text-[10px] text-gray-500 uppercase mb-3">Requirement Check</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Sharpe Ratio (≥1.5)</span>
                  <span className={`text-xs font-bold ${preview.passSharpe ? "text-emerald-400" : "text-rose-400"}`}>
                    {preview.sharpe || "0.0"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Max Drawdown (≤20%)</span>
                  <span className={`text-xs font-bold ${preview.passDD ? "text-emerald-400" : "text-rose-400"}`}>
                    {preview.drawdown ? `${(preview.drawdown * 100).toFixed(0)}%` : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {!preview.meets && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <p className="text-xs text-rose-300">
                  ⚠️ This strategy does not meet the minimum requirements for promotion.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="py-2.5 rounded-xl bg-white/5 text-gray-300 text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onPromote(targetStage, preview?.meets ? "promote" : "optimization")}
            className={`py-2.5 rounded-xl text-sm font-bold transition-colors ${
              preview?.meets 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "bg-amber-600/20 text-amber-400 border border-amber-600/30 hover:bg-amber-600/30"
            }`}
          >
            {preview?.meets ? "Promote" : "Send to Optimization"}
          </button>
        </div>
      </div>
    </div>
  );
};
