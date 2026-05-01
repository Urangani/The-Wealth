import { useEffect, useMemo, useState } from "react";

export default function Journal() {
  const [trades, setTrades] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  // ─────────────────────────────
  // LOAD FROM BACKEND
  // ─────────────────────────────
  useEffect(() => {
    fetch("http://localhost:8000/journal/trades")
      .then(res => res.json())
      .then(data => setTrades(data.data || []));
  }, []);

  // ─────────────────────────────
  // FILTERED DATA
  // ─────────────────────────────
  const filtered = useMemo(() => {
    return trades.filter(t => {
      const matchPair = t.symbol?.toLowerCase().includes(search.toLowerCase());

      if (filter === "PROFIT") return matchPair && t.profit > 0;
      if (filter === "LOSS") return matchPair && t.profit < 0;

      return matchPair;
    });
  }, [trades, search, filter]);

  // ─────────────────────────────
  // SUMMARY METRICS
  // ─────────────────────────────
  const summary = useMemo(() => {
    const total = trades.reduce((acc, t) => acc + (t.profit || 0), 0);
    const wins = trades.filter(t => t.profit > 0).length;
    const loss = trades.filter(t => t.profit < 0).length;

    return {
      total,
      winRate: trades.length ? (wins / trades.length) * 100 : 0,
      wins,
      loss,
    };
  }, [trades]);

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <h1 className="text-2xl font-semibold">Trade Journal</h1>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-3 gap-4">
        <Card title="Total P/L" value={summary.total} />
        <Card title="Win Rate" value={`${summary.winRate.toFixed(1)}%`} />
        <Card title="Trades" value={trades.length} />
      </div>

      {/* FILTERS */}
      <div className="flex gap-3">
        <input
          placeholder="Search pair..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-900 border border-gray-800 px-3 py-2 rounded-lg text-sm"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-gray-900 border border-gray-800 px-3 py-2 rounded-lg text-sm"
        >
          <option value="ALL">All</option>
          <option value="PROFIT">Profitable</option>
          <option value="LOSS">Loss</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-gray-400 bg-gray-950">
            <tr>
              <th className="p-3 text-left">Pair</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Volume</th>
              <th className="p-3 text-left">Open</th>
              <th className="p-3 text-left">Close</th>
              <th className="p-3 text-left">P/L</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((t, i) => (
              <tr key={i} className="border-t border-gray-800 hover:bg-gray-800/40">
                <td className="p-3">{t.symbol}</td>
                <td className="p-3">{t.type}</td>
                <td className="p-3">{t.volume}</td>
                <td className="p-3">{t.open_price}</td>
                <td className="p-3">{t.close_price ?? "-"}</td>
                <td className={t.profit > 0 ? "p-3 text-green-400" : "p-3 text-red-400"}>
                  {t.profit ?? 0}
                </td>
                <td className="p-3">{t.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────
// CARD COMPONENT
// ─────────────────────────────
function Card({ title, value }: any) {
  return (
    <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}