import { useEffect, useState } from "react";
import { config } from "../config";

export default function Logs() {
  const [items, setItems] = useState<{ time: string; event: string }[]>([]);

  useEffect(() => {
    fetch(`${config.apiBaseUrl}/logs`)
      .then((r) => r.json())
      .then((j) => setItems(j.data || []))
      .catch(() => setItems([]));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Automation Logs</h1>

      <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 text-sm">
        {items.length ? (
          items.map((l, idx) => (
            <p key={idx}>
              [{l.time}] {l.event}
            </p>
          ))
        ) : (
          <p className="text-gray-400">No events yet</p>
        )}
      </div>
    </div>
  );
}