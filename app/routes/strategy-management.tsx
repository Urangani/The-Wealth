import { useEffect, useState, useCallback } from "react";
import { PageHeader, SectionCard, StatePanel } from "../components/ui";
import { fetchApi } from "../services/api";

interface StrategyItem {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
  params: Record<string, any>;
}

/**
 * Strategy Management — advanced view of the strategy registry.
 * Shows all strategies in a card grid with param details, status,
 * and quick-action controls. Delegates create/delete to /strategies.
 */
export default function StrategyManagement() {
  const [strategies, setStrategies] = useState<StrategyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApi<StrategyItem[]>("strategies");
      setStrategies(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

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

  const activeCount = strategies.filter((s) => s.enabled).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Strategy Management"
        description="Monitor and configure active algorithmic trading strategies."
        actions={
          <div className="flex items-center gap-3 text-xs">
            <span className="text-gray-400">
              <span className="text-emerald-400 font-semibold text-sm">{activeCount}</span>
              <span className="text-gray-500"> / {strategies.length} active</span>
            </span>
            <button
              onClick={load}
              className="px-3 py-1.5 rounded-lg text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 ring-1 ring-inset ring-white/10 transition-colors"
            >
              ↻ Refresh
            </button>
          </div>
        }
      />

      {feedback && (
        <div className="px-4 py-2 rounded-lg text-sm bg-blue-500/10 text-blue-300 border border-blue-500/20">
          {feedback}
        </div>
      )}

      <StatePanel isLoading={loading} error={error} onRetry={load} emptyTitle="No strategies configured">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {strategies.map((s) => (
            <div
              key={s.id}
              className={`group relative rounded-2xl border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl ${
                s.enabled
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-white/5 bg-gray-900/40"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-semibold text-white text-sm">{s.name}</h3>
                  <code className="text-[10px] text-gray-600">{s.id}</code>
                </div>
                <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ${
                  s.enabled
                    ? "bg-emerald-500/20 text-emerald-400 ring-emerald-500/30"
                    : "bg-gray-700/50 text-gray-500 ring-white/10"
                }`}>
                  {s.enabled ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>

              {/* Description */}
              {s.description && (
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">{s.description}</p>
              )}

              {/* Params */}
              {Object.keys(s.params).length > 0 && (
                <div className="mb-4 grid grid-cols-2 gap-1.5">
                  {Object.entries(s.params).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between rounded bg-white/5 px-2 py-1">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wide">{k.replace(/_/g, " ")}</span>
                      <span className="text-[10px] font-mono text-gray-300">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-auto pt-1">
                <button
                  onClick={() => run(s.id, s.name)}
                  disabled={!s.enabled}
                  title={!s.enabled ? "Enable strategy to run" : "Trigger one cycle"}
                  className="flex-1 rounded-md bg-blue-500/10 py-1.5 text-xs font-medium text-blue-300 ring-1 ring-blue-500/20 hover:bg-blue-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  ▶ Run
                </button>
                <button
                  onClick={() => toggle(s.id)}
                  className={`flex-1 rounded-md py-1.5 text-xs font-medium ring-1 transition-colors ${
                    s.enabled
                      ? "bg-rose-500/10 text-rose-400 ring-rose-500/20 hover:bg-rose-500/20"
                      : "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20 hover:bg-emerald-500/20"
                  }`}
                >
                  {s.enabled ? "Disable" : "Enable"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </StatePanel>
    </div>
  );
}
