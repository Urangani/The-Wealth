import { useEffect, useState } from "react";
import { config } from "../config";

export default function Strategies() {
  const [strategies, setStrategies] = useState<any[]>([]);

  const load = () =>
    fetch(`${config.apiBaseUrl}/strategies`)
      .then((r) => r.json())
      .then((j) => setStrategies(j.data || []));

  useEffect(() => {
    load().catch(() => setStrategies([]));
  }, []);

  const toggle = async (id: string) => {
    await fetch(`${config.apiBaseUrl}/strategies/${id}/toggle`, { method: "POST" });
    await load();
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Strategies</h1>

      <div className="space-y-3">
        {strategies.map((s, i) => (
          <div
            key={i}
            className="flex justify-between items-center bg-gray-900 p-4 rounded-xl border border-gray-800"
          >
            <span>{s.name}</span>
            <button
              className={`px-3 py-1 rounded ${
                s.enabled ? "bg-green-600" : "bg-gray-700"
              }`}
              onClick={() => toggle(s.id)}
            >
              {s.enabled ? "ON" : "OFF"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}