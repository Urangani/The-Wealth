import { useEffect, useMemo, useState } from "react";
import { PageHeader, MetricCard, DataTable, StatePanel, EmptyState, SectionCard } from "../components/ui";
import { fetchApi } from "../services/api";
import { Position } from "../types";

export default function Journal() {
  const [trades, setTrades] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const loadData = () => {
    setLoading(true);
    setError(null);
    fetchApi<Position[]>("journal/trades")
      .then((res) => {
        setTrades(res || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    return trades.filter((t) => {
      const matchPair = t.symbol?.toLowerCase().includes(search.toLowerCase());

      if (filter === "PROFIT") return matchPair && t.profit > 0;
      if (filter === "LOSS") return matchPair && t.profit < 0;

      return matchPair;
    });
  }, [trades, search, filter]);

  const summary = useMemo(() => {
    const total = trades.reduce((acc, t) => acc + (t.profit || 0), 0);
    const wins = trades.filter((t) => t.profit > 0).length;
    const loss = trades.filter((t) => t.profit < 0).length;

    return {
      total,
      winRate: trades.length ? (wins / trades.length) * 100 : 0,
      wins,
      loss,
    };
  }, [trades]);

  const columns = [
    { key: "symbol", header: "Pair", cell: (r: any) => r.symbol },
    { key: "type", header: "Type", cell: (r: any) => r.type },
    { key: "volume", header: "Volume", cell: (r: any) => r.volume },
    { key: "open_price", header: "Open", cell: (r: any) => r.open_price },
    { key: "close_price", header: "Close", cell: (r: any) => r.close_price ?? "-" },
    { 
      key: "profit", 
      header: "P/L", 
      cell: (r: any) => (
        <span className={r.profit > 0 ? "text-emerald-400 font-medium" : r.profit < 0 ? "text-rose-400 font-medium" : ""}>
          {r.profit ?? 0}
        </span>
      )
    },
    { key: "status", header: "Status", cell: (r: any) => r.status || "Closed" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Trade Journal" 
        description="Review past trades and analyze your performance."
      />

      <StatePanel isLoading={loading} error={error} onRetry={loadData}>
        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard title="Total P/L" value={summary.total.toFixed(2)} trend={{ value: Math.abs(summary.total).toFixed(2), isPositive: summary.total >= 0 }} />
          <MetricCard title="Win Rate" value={`${summary.winRate.toFixed(1)}%`} />
          <MetricCard title="Trades" value={trades.length} />
        </div>

        {/* FILTERS & TABLE */}
        <SectionCard className="mt-6" bodyClassName="p-0">
          <div className="flex gap-3 p-4 border-b border-white/5">
            <input
              placeholder="Search pair..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-gray-900/50 border border-white/10 px-3 py-2 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray-900/50 border border-white/10 px-3 py-2 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All</option>
              <option value="PROFIT">Profitable</option>
              <option value="LOSS">Loss</option>
            </select>
          </div>

          <DataTable 
            data={filtered} 
            columns={columns} 
            keyExtractor={(r: any, i) => r.ticket || i}
            emptyState={<EmptyState title="No trades found" description="No trades match the current filters." />}
          />
        </SectionCard>
      </StatePanel>
    </div>
  );
}