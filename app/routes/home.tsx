import { useEffect, useState } from "react";
import { subscribe } from "../services/ws";
import { fetchApi } from "../services/api";
import { PageHeader, MetricCard, SectionCard, DataTable, StatePanel, EmptyState } from "../components/ui";
import { AccountSummary, Position } from "../types";

export default function Home() {
  const [account, setAccount] = useState<AccountSummary | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [price, setPrice] = useState<any>(null);

  const [symbol, setSymbol] = useState("EURUSD");
  const [lot, setLot] = useState(0.1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 📡 Fetch initial data
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ⚡ WebSocket for live price
  useEffect(() => {
    const unsubscribe = subscribe((msg) => {
      switch (msg.type) {
        case "price":
          setPrice(msg.data);
          break;
        case "account":
          setAccount(msg.data);
          break;
        case "positions":
          setPositions(msg.data);
          break;
      }
    });

    return unsubscribe;
  }, []);

  // 🟢 Open Trade
  const openTrade = async (type: "BUY" | "SELL") => {
    try {
      await fetchApi("trade/open", {
        method: "POST",
        body: JSON.stringify({ symbol, lot, order_type: type }),
      });
      loadData(); // refresh positions
    } catch (err: any) {
      console.error("Trade failed", err);
    }
  };

  // 🔴 Close Trade
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

  const columns = [
    { key: "symbol", header: "Symbol", cell: (p: Position) => p.symbol },
    { 
      key: "type", 
      header: "Type", 
      cell: (p: Position) => (
        <span className={p.type === "BUY" ? "text-emerald-400 font-medium" : "text-rose-400 font-medium"}>
          {p.type}
        </span>
      ) 
    },
    { key: "volume", header: "Volume", cell: (p: Position) => p.volume },
    { 
      key: "profit", 
      header: "P/L", 
      cell: (p: Position) => (
        <span className={p.profit >= 0 ? "text-emerald-400 font-medium" : "text-rose-400 font-medium"}>
          {p.profit}
        </span>
      ) 
    },
    { 
      key: "actions", 
      header: "", 
      align: "right" as const,
      cell: (p: Position) => (
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard title="Balance" value={account?.balance ?? 0} />
          <MetricCard title="Equity" value={account?.equity ?? 0} />
          <MetricCard 
            title="Profit" 
            value={account?.profit ?? 0} 
            trend={{ value: Math.abs(account?.profit ?? 0).toFixed(2), isPositive: (account?.profit ?? 0) >= 0 }} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Live Price */}
          <SectionCard title="Live Market">
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
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 uppercase tracking-wider">Symbol</label>
                <input
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="bg-gray-900/50 border border-white/10 px-3 py-2 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-32"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 uppercase tracking-wider">Lot Size</label>
                <input
                  type="number"
                  step="0.01"
                  value={lot}
                  onChange={(e) => setLot(parseFloat(e.target.value))}
                  className="bg-gray-900/50 border border-white/10 px-3 py-2 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 w-24"
                />
              </div>

              <button
                onClick={() => openTrade("BUY")}
                className="rounded-lg bg-emerald-500/20 px-5 py-2 font-medium text-emerald-400 transition hover:bg-emerald-500/30 ring-1 ring-inset ring-emerald-500/30"
              >
                BUY
              </button>

              <button
                onClick={() => openTrade("SELL")}
                className="rounded-lg bg-rose-500/20 px-5 py-2 font-medium text-rose-400 transition hover:bg-rose-500/30 ring-1 ring-inset ring-rose-500/30"
              >
                SELL
              </button>
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