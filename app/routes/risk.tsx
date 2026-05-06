import { useEffect, useState } from "react";
import { config } from "../config";

export default function Risk() {
  const [limits, setLimits] = useState<any>(null);

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/risk/limits`)
      .then((r) => r.json())
      .then((j) => setLimits(j.data))
      .catch(() => setLimits(null));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Risk Dashboard</h1>

      <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
        <p className="text-gray-400 text-sm">Allowed Symbols</p>
        <p className="text-sm text-gray-200">
          {limits?.allowed_symbols?.join(", ") ?? "—"}
        </p>
      </div>

      <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
        <p className="text-gray-400 text-sm">Max Daily Loss</p>
        <p className="text-xl font-bold text-red-400">
          {limits?.max_daily_loss ?? "—"}
        </p>
      </div>

      <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
        <p className="text-gray-400 text-sm">Max Open Trades</p>
        <p className="text-xl font-bold text-yellow-400">
          {limits?.max_open_trades ?? "—"}
        </p>
      </div>
    </div>
  );
}