import { useEffect, useRef, useState } from "react";
import { PageHeader, SectionCard, StatePanel } from "../components/ui";
import { fetchApi } from "../services/api";
import { subscribe } from "../services/ws";

interface LogItem {
  time: string;
  event: string;
  severity: "INFO" | "WARN" | "ERROR";
  logger?: string;
}

const SEVERITIES = ["ALL", "INFO", "WARN", "ERROR"] as const;
type SeverityFilter = (typeof SEVERITIES)[number];

const SEVERITY_STYLES: Record<string, string> = {
  ERROR: "bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/30",
  WARN: "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30",
  INFO: "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30",
};

const PILL_FILTER: Record<SeverityFilter, string> = {
  ALL: "text-gray-400 bg-white/5 hover:bg-white/10",
  INFO: "text-blue-400 bg-blue-500/10 hover:bg-blue-500/20",
  WARN: "text-amber-400 bg-amber-500/10 hover:bg-amber-500/20",
  ERROR: "text-rose-400 bg-rose-500/10 hover:bg-rose-500/20",
};

export default function Logs() {
  const [items, setItems] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<SeverityFilter>("ALL");
  const [search, setSearch] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadData = async (sev: SeverityFilter = filter) => {
    setLoading(true);
    setError(null);
    try {
      const severityParam = sev === "ALL" ? "ALL" : sev;
      const data = await fetchApi<LogItem[]>(`logs?limit=300&severity=${severityParam}`);
      setItems(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => { loadData(); }, []);

  // Auto-refresh every 5 s
  useEffect(() => {
    if (!autoRefresh) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => loadData(), 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, filter]);

  // Reload when filter changes
  useEffect(() => { loadData(filter); }, [filter]);

  // Push live log events broadcast over WS (future extension)
  useEffect(() => {
    const unsub = subscribe((msg) => {
      if (msg.type === "log") {
        setItems((prev) => [msg.data as LogItem, ...prev].slice(0, 300));
      }
    });
    return unsub;
  }, []);

  // Client-side search on top of server-side severity filter
  const visible = items.filter((l) =>
    search ? l.event.toLowerCase().includes(search.toLowerCase()) || (l.logger ?? "").toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Logs"
        description="Real-time execution events and automation history."
      />

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Severity filter pills */}
        <div className="flex gap-1.5">
          {SEVERITIES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium ring-1 ring-inset ring-white/10 transition-all ${PILL_FILTER[s]} ${filter === s ? "ring-current opacity-100" : "opacity-60 hover:opacity-90"}`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events…"
            className="w-full bg-gray-900/50 border border-white/10 pl-8 pr-3 py-1.5 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        {/* Auto-refresh toggle */}
        <button
          onClick={() => setAutoRefresh((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ring-1 ring-inset transition-colors ${
            autoRefresh
              ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30"
              : "bg-white/5 text-gray-400 ring-white/10"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${autoRefresh ? "bg-emerald-400 animate-pulse" : "bg-gray-600"}`} />
          {autoRefresh ? "Live" : "Paused"}
        </button>

        {/* Manual refresh */}
        <button
          onClick={() => loadData()}
          className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 ring-1 ring-inset ring-white/10 transition-colors"
        >
          ↻ Refresh
        </button>

        <span className="text-xs text-gray-600 ml-auto">{visible.length} entries</span>
      </div>

      {/* ── Log Table ────────────────────────────────────────────────────── */}
      <SectionCard bodyClassName="p-0">
        <StatePanel isLoading={loading && items.length === 0} error={error} onRetry={loadData} emptyTitle="No logs recorded">
          <div className="divide-y divide-white/5 font-mono text-xs">
            {visible.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                {search ? "No log entries match your search." : "Log file is empty."}
              </div>
            ) : (
              visible.map((l, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-4 px-5 py-2.5 hover:bg-white/[0.02] transition-colors ${
                    l.severity === "ERROR" ? "bg-rose-500/[0.03]" : ""
                  }`}
                >
                  {/* Timestamp */}
                  <span className="text-gray-600 shrink-0 w-40">{l.time}</span>

                  {/* Badge */}
                  <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold ${SEVERITY_STYLES[l.severity] ?? SEVERITY_STYLES.INFO}`}>
                    {l.severity}
                  </span>

                  {/* Logger source */}
                  {l.logger && (
                    <span className="text-gray-600 shrink-0 hidden md:block truncate max-w-[120px]">{l.logger}</span>
                  )}

                  {/* Message */}
                  <span className={`flex-1 break-all ${l.severity === "ERROR" ? "text-rose-300" : l.severity === "WARN" ? "text-amber-200" : "text-gray-300"}`}>
                    {l.event}
                  </span>
                </div>
              ))
            )}
          </div>
        </StatePanel>
      </SectionCard>
    </div>
  );
}