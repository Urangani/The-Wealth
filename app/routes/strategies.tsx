import { useEffect, useState, useCallback } from "react";
import {
  PageHeader,
  SectionCard,
  StatePanel,
  EmptyState,
} from "../components/ui";
import { fetchApi } from "../services/api";

interface StrategyItem {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
  params: Record<string, any>;
}

type ModalMode = "create" | null;

export default function Strategies() {
  const [strategies, setStrategies] = useState<StrategyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; type: "success" | "error"; text: string } | null>(null);
  const [running, setRunning] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalMode>(null);
  const [form, setForm] = useState({ id: "", name: "", description: "" });
  const [formError, setFormError] = useState<string | null>(null);

  const flash = (id: string, type: "success" | "error", text: string) => {
    setFeedback({ id, type, text });
    setTimeout(() => setFeedback(null), 3500);
  };

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
      flash(id, "success", updated.enabled ? "Strategy enabled" : "Strategy disabled");
    } catch (err: any) {
      flash(id, "error", err.message || "Toggle failed");
    }
  };

  const run = async (id: string, name: string) => {
    setRunning(id);
    try {
      await fetchApi(`strategies/${id}/run`, { method: "POST" });
      flash(id, "success", `${name} run triggered`);
    } catch (err: any) {
      flash(id, "error", err.message || "Run failed");
    } finally {
      setRunning(null);
    }
  };

  const deleteStrategy = async (id: string, name: string) => {
    if (!confirm(`Delete strategy "${name}"? This cannot be undone.`)) return;
    try {
      await fetchApi(`strategies/${id}`, { method: "DELETE" });
      setStrategies((prev) => prev.filter((s) => s.id !== id));
      flash("__global__", "success", `"${name}" deleted`);
    } catch (err: any) {
      flash("__global__", "error", err.message || "Delete failed");
    }
  };

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.id.trim() || !form.name.trim()) {
      setFormError("ID and Name are required.");
      return;
    }
    try {
      const created = await fetchApi<StrategyItem>("strategies", {
        method: "POST",
        body: JSON.stringify({ id: form.id.trim(), name: form.name.trim(), description: form.description }),
      });
      setStrategies((prev) => [...prev, created]);
      setModal(null);
      setForm({ id: "", name: "", description: "" });
      flash("__global__", "success", `"${created.name}" created`);
    } catch (err: any) {
      setFormError(err.message || "Create failed");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Strategies"
        description="Manage and execute your algorithmic trading strategies."
        actions={
          <button
            onClick={() => setModal("create")}
            className="rounded-lg bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-300 ring-1 ring-inset ring-blue-500/30 hover:bg-blue-600/30 transition-colors"
          >
            + New Strategy
          </button>
        }
      />

      {/* Global feedback banner */}
      {feedback?.id === "__global__" && (
        <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
          feedback.type === "success"
            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
        }`}>
          {feedback.text}
        </div>
      )}

      <SectionCard bodyClassName="p-0">
        <StatePanel isLoading={loading} error={error} onRetry={load} emptyTitle="No strategies configured">
          {strategies.length === 0 ? (
            <EmptyState
              title="No strategies yet"
              description="Click '+ New Strategy' to register your first strategy."
            />
          ) : (
            <div className="divide-y divide-white/5">
              {strategies.map((s) => {
                const isFeedback = feedback?.id === s.id;
                return (
                  <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-white text-sm">{s.name}</span>
                        <span className="text-[10px] font-mono text-gray-600 bg-white/5 px-1.5 py-0.5 rounded">{s.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          s.enabled
                            ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30"
                            : "bg-gray-700/50 text-gray-500 ring-1 ring-white/10"
                        }`}>
                          {s.enabled ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </div>
                      {s.description && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{s.description}</p>
                      )}
                      {isFeedback && (
                        <p className={`text-xs mt-1 font-medium ${feedback.type === "success" ? "text-emerald-400" : "text-rose-400"}`}>
                          {feedback.text}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Run */}
                      <button
                        onClick={() => run(s.id, s.name)}
                        disabled={!s.enabled || running === s.id}
                        title={!s.enabled ? "Enable strategy first" : "Run one cycle"}
                        className="rounded-md bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300 ring-1 ring-blue-500/20 hover:bg-blue-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {running === s.id
                          ? <span className="h-3 w-3 rounded-full border border-blue-300 border-t-transparent animate-spin" />
                          : "▶ Run"}
                      </button>

                      {/* Toggle */}
                      <button
                        onClick={() => toggle(s.id)}
                        className={`rounded-md px-3 py-1.5 text-xs font-medium ring-1 transition-colors ${
                          s.enabled
                            ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-gray-700/30 text-gray-400 ring-white/10 hover:bg-white/10"
                        }`}
                      >
                        {s.enabled ? "Disable" : "Enable"}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => deleteStrategy(s.id, s.name)}
                        className="rounded-md bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-400 ring-1 ring-rose-500/20 hover:bg-rose-500/20 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </StatePanel>
      </SectionCard>

      {/* ── Create Modal ─────────────────────────────────────────────────── */}
      {modal === "create" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-gray-900 border border-white/10 shadow-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">New Strategy</h2>
            <form onSubmit={submitCreate} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 uppercase tracking-wider">ID <span className="text-rose-400">*</span></label>
                <input
                  value={form.id}
                  onChange={(e) => setForm((f) => ({ ...f, id: e.target.value.toLowerCase().replace(/\s+/g, "_") }))}
                  placeholder="e.g. my_strategy"
                  className="bg-gray-800/60 border border-white/10 px-3 py-2 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 uppercase tracking-wider">Name <span className="text-rose-400">*</span></label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. My Strategy"
                  className="bg-gray-800/60 border border-white/10 px-3 py-2 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-gray-400 uppercase tracking-wider">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2}
                  placeholder="Optional description…"
                  className="bg-gray-800/60 border border-white/10 px-3 py-2 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/60 resize-none"
                />
              </div>
              {formError && <p className="text-xs text-rose-400">{formError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => { setModal(null); setFormError(null); }}
                  className="flex-1 rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}