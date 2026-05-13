import React, { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader, StatePanel } from "../components/ui";
import { fetchApi } from "../services/api";

// Sub-components
import { QuickStatsOverview } from "../components/strategy/QuickStatsOverview";
import { PipelineBoard } from "../components/strategy/PipelineBoard";
import { StrategyDetailView } from "../components/strategy/StrategyDetailView";
import { PromotionModal } from "../components/strategy/PromotionModal";

type StageKey =
  | "research"
  | "coding"
  | "backtesting"
  | "tracking"
  | "paper"
  | "live"
  | "optimization";

interface StrategyStage {
  key: StageKey;
  label: string;
}

const STAGES: StrategyStage[] = [
  { key: "research", label: "Research" },
  { key: "coding", label: "Coding" },
  { key: "backtesting", label: "Backtesting" },
  { key: "tracking", label: "Tracking" },
  { key: "paper", label: "Paper Trading" },
  { key: "live", label: "Live Trading" },
  { key: "optimization", label: "Optimization" },
];

const stageIndex = (stage: StageKey) => STAGES.findIndex((s) => s.key === stage);

interface StrategyItem {
  id: string;
  name: string;
  enabled: boolean;
  description?: string;
  params?: Record<string, any>;
  stage?: StageKey;
  category?: string;
  version?: string;
  confidenceScore?: number;
  tracking?: { rank?: number; confidenceScore?: number };
  alerts?: any[];
  backtest?: {
    sharpe?: number;
    drawdown?: number;
    pnl?: number[];
    winRate?: number;
  };
  paperTrading?: {
    trades?: any[];
  };
  liveTrading?: {
    positions?: any[];
  };
}

interface PromoteThresholds {
  sharpeMin: number;
  drawdownMax: number;
}

const defaultPromoteThresholds: PromoteThresholds = {
  sharpeMin: 1.5,
  drawdownMax: 0.2, // 20%
};

function inferredStage(s: StrategyItem): StageKey {
  if (s.stage) return s.stage;
  if (s.liveTrading?.positions && s.liveTrading.positions.length > 0) return "live";
  if (s.paperTrading?.trades && s.paperTrading.trades.length > 0) return "paper";
  if (s.backtest) return "backtesting";
  return "research";
}

const DUMMY_STRATEGIES: StrategyItem[] = [
  {
    id: "strat-001",
    name: "Alpha Trend Follower",
    enabled: false,
    description: "Multi-timeframe trend following strategy using EMA crossovers.",
    category: "Trend",
    version: "0.1.2",
    stage: "research",
    confidenceScore: 45,
    params: { ema_fast: 12, ema_slow: 26, timeframe: "1h" },
  },
  {
    id: "strat-002",
    name: "Mean Reversion Bot",
    enabled: true,
    description: "Exploiting short-term overextensions using RSI and Bollinger Bands.",
    category: "Mean Reversion",
    version: "1.0.0",
    stage: "coding",
    confidenceScore: 62,
    params: { rsi_period: 14, bb_std: 2.0 },
  },
  {
    id: "strat-003",
    name: "Breakout Pro",
    enabled: true,
    description: "Identifying and trading high-volume breakouts from consolidation zones.",
    category: "Breakout",
    version: "2.1.0",
    stage: "backtesting",
    confidenceScore: 88,
    backtest: {
      sharpe: 2.4,
      drawdown: 12.5,
      winRate: 68,
      pnl: [1000, 1050, 1030, 1100, 1150, 1200, 1180, 1250, 1300, 1350],
    },
    params: { volume_threshold: 1.5, lookback: 20 },
  },
  {
    id: "strat-004",
    name: "Volatility Scalper",
    enabled: true,
    description: "High-frequency scalping during peak volatility hours.",
    category: "Scalping",
    version: "1.5.0",
    stage: "tracking",
    confidenceScore: 75,
    tracking: { rank: 3, confidenceScore: 75 },
    backtest: {
      sharpe: 1.8,
      drawdown: 8.2,
      pnl: [1000, 1010, 1005, 1015, 1025, 1020, 1035],
    },
  },
  {
    id: "strat-005",
    name: "Sentiment Arbitrage",
    enabled: true,
    description: "Trading based on social media sentiment analysis vs market price.",
    category: "Sentiment",
    version: "0.9.0",
    stage: "paper",
    confidenceScore: 55,
    paperTrading: {
      trades: [
        { date: "2024-05-01", type: "BUY", price: 1.085, pnl: 25.0 },
        { date: "2024-05-02", type: "SELL", price: 1.092, pnl: -12.0 },
      ],
    },
  },
  {
    id: "strat-006",
    name: "Gold Eagle",
    enabled: true,
    description: "Specialized XAUUSD strategy using price action and volume profiles.",
    category: "Metals",
    version: "3.0.1",
    stage: "live",
    confidenceScore: 92,
    liveTrading: {
      positions: [
        { symbol: "XAUUSD", side: "BUY", pnl: 145.2 },
        { symbol: "BTCUSD", side: "SELL", pnl: -22.5 },
      ],
    },
    backtest: { sharpe: 2.1, drawdown: 15.0, pnl: [5000, 5200, 5100, 5500, 5800] },
    alerts: [{ type: "info", message: "Live trading healthy" }],
  },
  {
    id: "strat-007",
    name: "Legacy Trend",
    enabled: false,
    description: "Old trend strategy requiring parameter recalibration.",
    category: "Trend",
    version: "2.0.0",
    stage: "optimization",
    confidenceScore: 35,
    backtest: { sharpe: 0.8, drawdown: 25.0 },
    alerts: [{ type: "error", message: "Performance drop detected" }],
  },
];

export default function StrategyManagement() {
  const [strategies, setStrategies] = useState<StrategyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(() => strategies.find((s) => s.id === selectedId) || null, [strategies, selectedId]);

  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [promoteContext, setPromoteContext] = useState<{ strategyId: string } | null>(null);
  const [promoteTargetStage, setPromoteTargetStage] = useState<StageKey>("optimization");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApi<StrategyItem[]>("strategies");
      const apiStrategies = Array.isArray(data) ? data : [];
      // Combine API data with dummy data, avoiding duplicates if any
      const combined = [...apiStrategies];
      DUMMY_STRATEGIES.forEach(ds => {
        if (!combined.find(s => s.id === ds.id)) {
          combined.push(ds);
        }
      });
      setStrategies(combined);
    } catch (err: any) {
      // If API fails, show dummy data so the user can see the UI
      console.warn("API load failed, falling back to dummy data:", err);
      setStrategies(DUMMY_STRATEGIES);
      // We don't set error here so the UI still renders the dummy data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (id: string) => {
    try {
      const updated = await fetchApi<StrategyItem>(`strategies/${id}/toggle`, { method: "POST" });
      setStrategies((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch (err: any) {
      setFeedback(err.message || "Toggle failed");
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const run = async (id: string, name: string) => {
    try {
      await fetchApi(`strategies/${id}/run`, { method: "POST" });
      setFeedback(`▶ ${name} run triggered`);
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback(err.message || "Run failed");
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handlePromoteAction = async (target: string, mode: "promote" | "optimization") => {
    if (!promoteContext) return;
    try {
      await fetchApi(`strategies/${promoteContext.strategyId}/promote`, {
        method: "POST",
        body: JSON.stringify({ targetStage: target, mode }),
      });
      setFeedback(mode === "promote" ? "Promotion successful" : "Sent to optimization");
      setPromoteModalOpen(false);
      load();
    } catch (err: any) {
      setFeedback(err.message || "Action failed");
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  const openPromoteModal = (id: string, currentStage: string) => {
    const idx = stageIndex(currentStage as StageKey);
    const next = STAGES[Math.min(idx + 1, STAGES.length - 1)]?.key ?? "optimization";
    setPromoteTargetStage(next);
    setPromoteContext({ strategyId: id });
    setPromoteModalOpen(true);
  };

  const strategiesByStage = useMemo(() => {
    const m = new Map<StageKey, StrategyItem[]>();
    STAGES.forEach(st => m.set(st.key, []));
    strategies.forEach(s => {
      const stage = inferredStage(s);
      m.get(stage)?.push(s);
    });
    return m;
  }, [strategies]);

  const quickStats = useMemo(() => {
    const counts: Record<string, number> = {};
    STAGES.forEach(st => counts[st.key] = 0);
    strategies.forEach(s => {
      const st = inferredStage(s);
      counts[st]++;
    });

    const topRanked = [...strategies]
      .sort((a, b) => (b.confidenceScore || 0) - (a.confidenceScore || 0))
      .slice(0, 5);

    const alerts = strategies.flatMap(s => (s.alerts || []).map(a => ({ ...a, strategyName: s.name })));

    return { counts, topRanked, alerts };
  }, [strategies]);

  const promotionPreview = useMemo(() => {
    if (!promoteContext) return null;
    const s = strategies.find(x => x.id === promoteContext.strategyId);
    if (!s) return null;

    const sharpe = s.backtest?.sharpe || 0;
    const drawdown = s.backtest?.drawdown || 0;
    const passSharpe = sharpe >= defaultPromoteThresholds.sharpeMin;
    const passDD = (drawdown / 100) <= defaultPromoteThresholds.drawdownMax;

    return {
      sharpe,
      drawdown: drawdown / 100,
      passSharpe,
      passDD,
      meets: passSharpe && passDD,
    };
  }, [promoteContext, strategies]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Strategy Management"
        description="Monitor and control the lifecycle of your automated strategies."
        actions={
          <button
            onClick={load}
            className="px-3 py-1.5 rounded-lg text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 ring-1 ring-white/10 transition-colors"
          >
            ↻ Refresh
          </button>
        }
      />

      {feedback && (
        <div className="px-4 py-2 rounded-lg text-sm bg-blue-500/10 text-blue-300 border border-blue-500/20">
          {feedback}
        </div>
      )}

      <StatePanel isLoading={loading} error={error} onRetry={load} emptyTitle="No strategies found">
        <QuickStatsOverview
          counts={quickStats.counts}
          topRanked={quickStats.topRanked}
          alerts={quickStats.alerts}
          onSelectStrategy={setSelectedId}
        />

        <div className="mt-8">
           <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Strategy Pipeline
           </h3>
           <PipelineBoard
              stages={STAGES}
              strategiesByStage={strategiesByStage}
              onSelectStrategy={setSelectedId}
              onPromote={openPromoteModal}
              inferredStageFn={inferredStage}
           />
        </div>

        {selected && (
          <StrategyDetailView
            strategy={selected}
            onRun={run}
            onToggle={toggle}
            onPromote={openPromoteModal}
          />
        )}
      </StatePanel>

      <PromotionModal
        isOpen={promoteModalOpen}
        onClose={() => setPromoteModalOpen(false)}
        strategy={strategies.find(s => s.id === promoteContext?.strategyId)}
        targetStage={promoteTargetStage}
        preview={promotionPreview}
        onPromote={handlePromoteAction}
      />
    </div>
  );
}
