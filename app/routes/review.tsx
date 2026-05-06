import { useEffect, useState } from "react";
import { PageHeader, MetricCard, StatePanel } from "../components/ui";
import { fetchApi } from "../services/api";

export default function Review() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    fetchApi<any>("review/summary")
      .then((res) => {
        setSummary(res);
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

  return (
    <div className="space-y-6">
      <PageHeader title="Weekly Review" description="Summary of your trading performance over the last week." />

      <StatePanel isLoading={loading} error={error} onRetry={loadData}>
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard title="Trades" value={`${summary.trades ?? "—"}`} />
            <MetricCard title="Win Rate" value={`${(summary.win_rate ?? 0).toFixed?.(1) ?? "—"}%`} />
            <MetricCard title="Net P/L" value={`${summary.net_pnl ?? "—"}`} />
          </div>
        )}
      </StatePanel>
    </div>
  );
}