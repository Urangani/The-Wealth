import { useEffect, useState } from "react";
import { PageHeader, MetricCard, SectionCard, StatePanel, EmptyState } from "../components/ui";
import { fetchApi } from "../services/api";

export default function Risk() {
  const [limits, setLimits] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    fetchApi<any>("risk/limits")
      .then((res) => {
        setLimits(res);
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
      <PageHeader title="Risk Management" description="Monitor trading limits and risk utilization." />

      <StatePanel isLoading={loading} error={error} onRetry={loadData}>
        {limits && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard title="Max Daily Loss" value={limits.max_daily_loss ?? "—"} className="border-rose-500/20" />
            <MetricCard title="Max Open Trades" value={limits.max_open_trades ?? "—"} className="border-amber-500/20" />
            <MetricCard title="Allowed Symbols" value={limits.allowed_symbols?.length ?? 0} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
           <SectionCard title="Drawdown Trend">
              <EmptyState title="Future Integration" description="Drawdown history tracking will be available in Phase D." />
           </SectionCard>
           <SectionCard title="Risk Utilization">
              <EmptyState title="Future Integration" description="Real-time risk utilization metrics are planned." />
           </SectionCard>
        </div>
        
        {limits && (
           <SectionCard title="Active Constraints" className="mt-6">
              <div className="space-y-2">
                 <p className="text-sm text-gray-400">Allowed symbols: <span className="text-gray-200">{limits.allowed_symbols?.join(", ")}</span></p>
              </div>
           </SectionCard>
        )}
      </StatePanel>
    </div>
  );
}