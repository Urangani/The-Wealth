import { useEffect, useState } from "react";
import { config } from "../config";

export default function Review() {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/review/summary`)
      .then((r) => r.json())
      .then((j) => setSummary(j.data))
      .catch(() => setSummary(null));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Weekly Review</h1>

      <div className="grid grid-cols-3 gap-4">
        <Stat label="Trades" value={`${summary?.trades ?? "—"}`} />
        <Stat label="Win Rate" value={`${(summary?.win_rate ?? 0).toFixed?.(1) ?? "—"}%`} />
        <Stat label="Net P/L" value={`${summary?.net_pnl ?? "—"}`} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}