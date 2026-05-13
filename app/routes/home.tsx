import { useEffect, useState, useCallback } from "react";
import { subscribe, subscribeStatus } from "../services/ws";
import { fetchApi } from "../services/api";
import { PageHeader, MetricCard, SectionCard, DataTable, StatePanel, EmptyState } from "../components/ui";
import type { Column } from "../components/ui";
import { SparklineChart } from "../components/charts";
import type { AccountSummary, Position } from "../types";
import { Play, Power, PowerOff, Activity } from "lucide-react";

interface StrategyItem {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
}

export default function Home() {
  const [account, setAccount] = useState<AccountSummary | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [price, setPrice] = useState<any>(null);
  const [strategies, setStrategies] = useState<StrategyItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // WS Status
  const [wsStatus, setWsStatus] = useState<"connecting" | "open" | "closed" | "error">("connecting");
  const [mt5Connected, setMt5Connected] = useState<boolean | null>(null);
  const [runningStrategy, setRunningStrategy] = useState<string | null>(null);

  // Client-side equity history for sparkline
  const [equityHistory, setEquityHistory] = useState<{ time: string; equity: number }[]>([]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [accData, posData, stratData] = await Promise.all([
        fetchApi<AccountSummary>("account/summary"),
        fetchApi<Position[]>("trades/open"),
        fetchApi<StrategyItem[]>("strategies")
      ]);
      setAccount(accData);
      setPositions(posData || []);
      setStrategies(stratData || []);
      
      if (accData) {
        setEquityHistory([{ time: new Date().toLocaleTimeString(), equity: accData.equity }]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    const unsubscribeStatus = subscribeStatus((status) => {
      setWsStatus(status);
    });

    const unsubscribeData = subscribe((msg) => {
      switch (msg.type) {
        case "price":
          setPrice(msg.data);
          break;
        case "account":
          setAccount(msg.data);
          setEquityHistory(prev => {
            const next = [...prev, { time: new Date().toLocaleTimeString(), equity: msg.data.equity }];
            return next.slice(-30); // Keep last 30 ticks
          });
          break;
        case "positions":
          setPositions(msg.data);
          break;
        case "status":
          setMt5Connected(msg.data?.mt5_connected ?? null);
          break;
      }
    });

    return () => {
      unsubscribeStatus();
      unsubscribeData();
    };
  }, []);

  const toggleStrategy = async (id: string) => {
    try {
      const updated = await fetchApi<StrategyItem>(`strategies/${id}/toggle`, { method: "POST" });
      setStrategies((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } catch (err: any) {
      console.error("Toggle failed", err);
    }
  };

  const runStrategy = async (id: string) => {
    setRunningStrategy(id);
    try {
      await fetchApi(`strategies/${id}/run`, { method: "POST" });
    } catch (err: any) {
      console.error("Run failed", err);
    } finally {
      setRunningStrategy(null);
    }
  };

  const closeTrade = async (ticket: number) => {
    try {
      await fetchApi("trade/close", {
        method: "POST",
        body: JSON.stringify({ ticket }),
      });
      loadData();
    } catch (err: any) {
      console.error("Close failed", err);
    }
  };

  const columns: Column<Position>[] = [
    { key: "symbol", header: "Symbol", sortable: true, cell: (p) => p.symbol },
    { 
      key: "type", 
      header: "Type", 
      sortable: true,
      cell: (p) => (
        <span className={p.type === "BUY" ? "text-emerald-400 font-medium" : "text-rose-400 font-medium"}>
          {p.type}
        </span>
      ) 
    },
    { key: "volume", header: "Volume", sortable: true, cell: (p) => p.volume },
    { 
      key: "profit", 
      header: "P/L", 
      sortable: true,
      cell: (p) => (
        <span className={p.profit >= 0 ? "text-emerald-400 font-medium" : "text-rose-400 font-medium"}>
          {p.profit}
        </span>
      ) 
    },
    { 
      key: "actions", 
      header: "", 
      align: "right",
      sortable: false,
      cell: (p) => (
        <button
          onClick={() => closeTrade(p.ticket)}
          className="rounded bg-rose-500/20 px-3 py-1.5 text-xs font-medium text-rose-300 transition hover:bg-rose-500/30"
        >
          Close
        </button>
      ) 
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Command Center" 
        description="Monitor system health, account performance, and active strategies."
      />

      <StatePanel isLoading={loading && !account} error={error} onRetry={loadData}>
        {/* Account KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard title="Balance" value={account?.balance ?? 0} />
          <MetricCard 
            title="Equity" 
            value={account?.equity ?? 0} 
            icon={<SparklineChart data={equityHistory} dataKey="equity" height={36} color="#3b82f6" />}
          />
          <MetricCard 
            title="Profit" 
            value={account?.profit ?? 0} 
            trend={{ value: Math.abs(account?.profit ?? 0).toFixed(2), isPositive: (account?.profit ?? 0) >= 0 }} 
          />
          <MetricCard title="Margin Level" value={`${account?.margin_level ?? 0}%`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Live Price & Status */}
          <SectionCard 
            title="Market Connectivity"
            className="lg:col-span-1"
            action={
              <div className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                wsStatus === "open" && mt5Connected !== false
                  ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
                  : "bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/30"
              }`}>
                {wsStatus === "open" && mt5Connected !== false ? "STABLE" : "DISCONNECTED"}
              </div>
            }
          >
            {price ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black text-white">{price.symbol}</span>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Live Tick</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] text-gray-500 uppercase font-bold">Bid</span>
                    <p className="font-mono text-lg text-emerald-400 font-bold">{price.bid}</p>
                  </div>
                  <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] text-gray-500 uppercase font-bold">Ask</span>
                    <p className="font-mono text-lg text-rose-400 font-bold">{price.ask}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 flex flex-col items-center justify-center text-gray-500 gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-700 border-t-blue-500"></div>
                <span className="text-xs font-medium">Synchronizing with MT5...</span>
              </div>
            )}
          </SectionCard>

          {/* Active Strategies Panel */}
          <SectionCard 
            title="Active Strategies" 
            className="lg:col-span-2"
            bodyClassName="p-0"
          >
            <div className="divide-y divide-white/5 max-h-[280px] overflow-auto">
              {strategies.length === 0 ? (
                <div className="p-10 text-center">
                  <p className="text-xs text-gray-500">No strategies configured.</p>
                </div>
              ) : (
                strategies.map((s) => (
                  <div key={s.id} className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{s.name}</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.enabled ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-gray-600"}`}></span>
                      </div>
                      <p className="text-[10px] text-gray-500 truncate mt-0.5">{s.description || "No description"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => runStrategy(s.id)}
                        disabled={!s.enabled || runningStrategy === s.id}
                        className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 disabled:opacity-20 transition-all"
                      >
                        <Play className={`w-4 h-4 ${runningStrategy === s.id ? "animate-pulse" : ""}`} />
                      </button>
                      <button 
                        onClick={() => toggleStrategy(s.id)}
                        className={`p-2 rounded-lg transition-all ${s.enabled ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" : "bg-white/5 text-gray-500 hover:bg-white/10"}`}
                      >
                        {s.enabled ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionCard>
        </div>

        {/* Positions */}
        <SectionCard title="Active Market Exposure" className="mt-6" bodyClassName="p-0">
          <DataTable 
            data={positions} 
            columns={columns} 
            keyExtractor={(p) => p.ticket} 
            emptyState={<EmptyState title="No active exposure" description="The trading engine is currently idle." />}
          />
        </SectionCard>
      </StatePanel>
    </div>
  );
}