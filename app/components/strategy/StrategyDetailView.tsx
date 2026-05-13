import React, { useState } from "react";
import { SectionCard, DataTable } from "../ui";
import { SparklineChart } from "../charts/SparklineChart";

interface StrategyDetailViewProps {
  strategy: any;
  onRun: (id: string, name: string) => void;
  onToggle: (id: string) => void;
  onPromote: (id: string, currentStage: string) => void;
}

type TabKey = "overview" | "backtest" | "tracking" | "paper" | "live" | "optimization";

export const StrategyDetailView: React.FC<StrategyDetailViewProps> = ({
  strategy,
  onRun,
  onToggle,
  onPromote,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "backtest", label: "Backtest" },
    { key: "tracking", label: "Tracking" },
    { key: "paper", label: "Paper Trading" },
    { key: "live", label: "Live Trading" },
    { key: "optimization", label: "Optimization" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SectionCard bodyClassName="p-4 lg:col-span-2">
              <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-4">Parameters</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {strategy.params && Object.entries(strategy.params).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between rounded bg-white/5 px-3 py-2">
                    <span className="text-[10px] text-gray-500 uppercase">{k}</span>
                    <span className="text-[10px] font-mono text-gray-300">{String(v)}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
            <SectionCard bodyClassName="p-4">
              <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-4">Meta</h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between"><span className="text-gray-500">Category</span><span className="text-gray-300">{strategy.category || "N/A"}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Version</span><span className="text-gray-300">{strategy.version || "1.0.0"}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Status</span><span className={strategy.enabled ? "text-emerald-400" : "text-rose-400"}>{strategy.enabled ? "Active" : "Paused"}</span></div>
              </div>
            </SectionCard>
          </div>
        );
      case "backtest":
        return (
          <div className="space-y-4">
            <SectionCard bodyClassName="p-4">
              <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-4">Equity Curve</h4>
              <div className="h-48">
                <SparklineChart 
                  data={strategy.backtest?.pnl?.map((v: any, i: number) => ({ value: v, date: i })) || []} 
                  dataKey="value" 
                  height={192} 
                />
              </div>
            </SectionCard>
            <div className="grid grid-cols-3 gap-4">
              <SectionCard bodyClassName="p-4 text-center">
                <p className="text-[10px] text-gray-500 uppercase">Sharpe</p>
                <p className="text-xl font-bold text-white">{strategy.backtest?.sharpe || "0.0"}</p>
              </SectionCard>
              <SectionCard bodyClassName="p-4 text-center">
                <p className="text-[10px] text-gray-500 uppercase">Drawdown</p>
                <p className="text-xl font-bold text-rose-400">{strategy.backtest?.drawdown ? `${strategy.backtest.drawdown}%` : "0%"}</p>
              </SectionCard>
              <SectionCard bodyClassName="p-4 text-center">
                <p className="text-[10px] text-gray-500 uppercase">Win Rate</p>
                <p className="text-xl font-bold text-emerald-400">{strategy.backtest?.winRate ? `${strategy.backtest.winRate}%` : "0%"}</p>
              </SectionCard>
            </div>
          </div>
        );
      case "tracking":
        return (
          <SectionCard bodyClassName="p-4">
             <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-4">Ranking & Confidence</h4>
             <div className="flex items-center gap-8">
                <div className="text-center">
                   <p className="text-[10px] text-gray-500 uppercase">Current Rank</p>
                   <p className="text-3xl font-bold text-white">#{strategy.tracking?.rank || "-"}</p>
                </div>
                <div className="flex-1">
                   <p className="text-[10px] text-gray-500 uppercase mb-2">Confidence Score</p>
                   <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all" 
                        style={{ width: `${strategy.confidenceScore || 0}%` }}
                      />
                   </div>
                   <p className="text-[10px] text-right text-gray-500 mt-1">{strategy.confidenceScore || 0}%</p>
                </div>
             </div>
          </SectionCard>
        );
      case "paper":
        return (
          <div className="space-y-4">
            <SectionCard bodyClassName="p-0">
               <DataTable 
                 columns={[
                   { header: "Date", accessor: "date" },
                   { header: "Type", accessor: "type" },
                   { header: "Price", accessor: "price" },
                   { header: "PnL", accessor: "pnl" },
                 ]}
                 data={strategy.paperTrading?.trades || []}
               />
            </SectionCard>
          </div>
        );
      case "live":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SectionCard bodyClassName="p-4">
               <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-4">Risk Exposure</h4>
               {/* Placeholder for risk gauge */}
               <div className="h-32 flex items-center justify-center border border-dashed border-white/10 rounded-lg text-gray-600 text-xs">
                  Risk Dashboard Content
               </div>
            </SectionCard>
            <SectionCard bodyClassName="p-4">
               <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-4">Live Positions</h4>
               <div className="space-y-2">
                  {strategy.liveTrading?.positions?.length > 0 ? (
                    strategy.liveTrading.positions.map((p: any, i: number) => (
                      <div key={i} className="flex justify-between text-xs p-2 bg-white/5 rounded">
                        <span>{p.symbol}</span>
                        <span className={p.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}>${p.pnl}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-500 text-center py-4">No active positions</div>
                  )}
               </div>
            </SectionCard>
          </div>
        );
      case "optimization":
        return (
          <SectionCard bodyClassName="p-4">
             <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-4">Parameter Tuning</h4>
             <div className="space-y-4">
                <div className="flex flex-col gap-2">
                   <label className="text-[10px] text-gray-500 uppercase">MA Period</label>
                   <input type="range" className="w-full accent-blue-500" min="5" max="200" />
                </div>
                <div className="flex flex-col gap-2">
                   <label className="text-[10px] text-gray-500 uppercase">Risk Factor</label>
                   <input type="range" className="w-full accent-blue-500" min="0" max="100" />
                </div>
                <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors">
                   Run Optimization
                </button>
             </div>
          </SectionCard>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white">{strategy.name}</h2>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 text-[10px] font-bold ring-1 ring-blue-500/20">
              {strategy.stage || "RESEARCH"}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{strategy.description || "No description provided."}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onRun(strategy.id, strategy.name)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Run Now
          </button>
          <button
            onClick={() => onToggle(strategy.id)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              strategy.enabled 
                ? "bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20 hover:bg-rose-500/20" 
                : "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 hover:bg-emerald-500/20"
            }`}
          >
            {strategy.enabled ? "Disable" : "Enable"}
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/5 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.key ? "text-white border-blue-500" : "text-gray-500 border-transparent hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {renderTabContent()}
    </div>
  );
};
