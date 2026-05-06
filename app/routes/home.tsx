import { useEffect, useState } from "react";
import { subscribe, subscribeStatus } from "../services/ws";
import { fetchApi } from "../services/api";
import { PageHeader, MetricCard, SectionCard, DataTable, StatePanel, EmptyState, NumberStepper, SymbolSelector } from "../components/ui";
import type { Column } from "../components/ui";
import { SparklineChart } from "../components/charts";
import type { AccountSummary, Position } from "../types";

export default function Home() {
  const [account, setAccount] = useState<AccountSummary | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [price, setPrice] = useState<any>(null);

  const [symbol, setSymbol] = useState("EURUSD");
  const [lot, setLot] = useState(0.1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // WS Status and Trade State
  const [wsStatus, setWsStatus] = useState<"connecting" | "open" | "closed" | "error">("connecting");
  const [mt5Connected, setMt5Connected] = useState<boolean | null>(null);
  const [isTrading, setIsTrading] = useState(false);
  const [tradeMessage, setTradeMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Client-side equity history for sparkline
  const [equityHistory, setEquityHistory] = useState<{ time: string; equity: number }[]>([]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [accData, posData] = await Promise.all([
        fetchApi<AccountSummary>("account/summary"),
        fetchApi<Position[]>("trades/open")
      ]);
      setAccount(accData);
      setPositions(posData || []);
      
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

  const openTrade = async (type: "BUY" | "SELL") => {
    if (lot <= 0) {
      setTradeMessage({ type: "error", text: "Lot size must be greater than 0" });
      return;
    }
    if (!symbol) {
      setTradeMessage({ type: "error", text: "Symbol is required" });
      return;
    }

    setIsTrading(true);
    setTradeMessage(null);
    try {
      await fetchApi("trade/open", {
        method: "POST",
        body: JSON.stringify({ symbol, lot, order_type: type }),
      });
      setTradeMessage({ type: "success", text: `Successfully opened ${type} for ${symbol}` });
      setTimeout(() => setTradeMessage(null), 3000);
      loadData();
    } catch (err: any) {
      setTradeMessage({ type: "error", text: err.message || "Trade failed" });
    } finally {
      setIsTrading(false);
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
        title="Dashboard" 
        description="Real-time market data and open position execution."
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Live Price */}
          <SectionCard 
            title="Live Market"
            action={
              <div className="flex items-center gap-2 text-xs font-medium">
                <span className="text-gray-400 uppercase tracking-wider">Status:</span>
                <span className={`px-2 py-1 rounded-full ${
                  wsStatus === "open" && mt5Connected !== false
                    ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
                    : wsStatus === "open" && mt5Connected === false
                    ? "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30"
                    : wsStatus === "connecting"
                    ? "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30"
                    : "bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/30"
                }`}>
                  {wsStatus === "open" && mt5Connected === false ? "MT5 OFFLINE" : wsStatus.toUpperCase()}
                </span>
              </div>
            }
          >
            {price ? (
              <div className="flex items-center gap-6">
                <p className="text-xl font-bold text-white">{price.symbol}</p>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Bid</span>
                  <span className="font-mono text-emerald-400">{price.bid}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Ask</span>
                  <span className="font-mono text-rose-400">{price.ask}</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-gray-400">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-white"></div>
                Waiting for price data...
              </div>
            )}
          </SectionCard>

          {/* Trade Panel */}
          <SectionCard title="Execute Trade">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-end gap-3">
                <SymbolSelector
                  value={symbol}
                  onChange={setSymbol}
                  disabled={isTrading}
                />

                <NumberStepper
                  label="Lot Size"
                  value={lot}
                  onChange={setLot}
                  step={0.01}
                  min={0.01}
                  max={100}
                  disabled={isTrading}
                />

                <button
                  onClick={() => openTrade("BUY")}
                  disabled={isTrading || !symbol || lot <= 0}
                  className="rounded-lg bg-emerald-500/20 px-5 py-2 font-medium text-emerald-400 transition hover:bg-emerald-500/30 ring-1 ring-inset ring-emerald-500/30 disabled:opacity-50 flex items-center justify-center min-w-[80px]"
                >
                  {isTrading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent"></div> : "BUY"}
                </button>

                <button
                  onClick={() => openTrade("SELL")}
                  disabled={isTrading || !symbol || lot <= 0}
                  className="rounded-lg bg-rose-500/20 px-5 py-2 font-medium text-rose-400 transition hover:bg-rose-500/30 ring-1 ring-inset ring-rose-500/30 disabled:opacity-50 flex items-center justify-center min-w-[80px]"
                >
                  {isTrading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-rose-400 border-t-transparent"></div> : "SELL"}
                </button>
              </div>
              
              {/* Feedback messages */}
              {tradeMessage && (
                <div className={`px-3 py-2 rounded-lg text-sm font-medium ${tradeMessage.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
                  {tradeMessage.text}
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Positions */}
        <SectionCard title="Open Positions" className="mt-6" bodyClassName="p-0">
          <DataTable 
            data={positions} 
            columns={columns} 
            keyExtractor={(p) => p.ticket} 
            emptyState={<EmptyState title="No open positions" description="Execute a trade to see it here." />}
          />
        </SectionCard>
      </StatePanel>
    </div>
  );
}