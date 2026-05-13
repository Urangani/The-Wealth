import React from "react";
import { SectionCard } from "../ui";

interface QuickStatsProps {
  counts: Record<string, number>;
  topRanked: any[];
  alerts: any[];
  onSelectStrategy: (id: string) => void;
}

export const QuickStatsOverview: React.FC<QuickStatsProps> = ({
  counts,
  topRanked,
  alerts,
  onSelectStrategy,
}) => {
  const quickAlertText = alerts.length > 0 
    ? alerts.slice(0, 2).map(a => `${a.strategyName}: ${a.message}`).join(" • ")
    : "No active alerts detected.";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <SectionCard bodyClassName="p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Pipeline totals</p>
            <h3 className="text-sm font-semibold text-white mt-1">Strategies in each stage</h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-white/5 ring-1 ring-white/10 text-gray-300">
            MVP
          </span>
        </div>

        <div className="mt-4 space-y-2">
          {Object.entries(counts).map(([stage, count]) => (
            <div key={stage} className="flex items-center justify-between gap-3">
              <span className="text-xs text-gray-500 capitalize">{stage}</span>
              <span className="text-xs font-semibold text-white">{count}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard bodyClassName="p-4">
        <p className="text-xs text-gray-400 uppercase tracking-wider">Top ranked</p>
        <h3 className="text-sm font-semibold text-white mt-1">Confidence leaders</h3>

        <div className="mt-4 space-y-2">
          {topRanked.length === 0 ? (
            <div className="text-xs text-gray-500">No confidence data yet.</div>
          ) : (
            topRanked.map((s) => {
              const conf = s.confidenceScore ?? s.tracking?.confidenceScore ?? 0;
              return (
                <button
                  key={s.id}
                  onClick={() => onSelectStrategy(s.id)}
                  className="w-full text-left rounded-lg p-2 bg-white/[0.03] hover:bg-white/[0.06] ring-1 ring-white/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate">{s.name}</div>
                      <div className="text-[10px] text-gray-600 font-mono truncate">{s.id}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-300">{conf.toFixed(0)}</div>
                      <div className="text-[10px] text-gray-500">Score</div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </SectionCard>

      <SectionCard bodyClassName="p-4">
        <p className="text-xs text-gray-400 uppercase tracking-wider">Alerts</p>
        <h3 className="text-sm font-semibold text-white mt-1">System Anomalies</h3>

        <div className="mt-4 text-xs text-gray-500 leading-relaxed">
          <div className={alerts.length > 0 ? "text-gray-300" : ""}>{quickAlertText}</div>
        </div>

        <div className="mt-4 text-[10px] text-gray-600">
          Real-time monitoring for failed backtests or paper trading losses.
        </div>
      </SectionCard>
    </div>
  );
};
