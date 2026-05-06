import { useEffect, useState } from "react";
import { PageHeader, MetricCard, SectionCard, StatePanel } from "../components/ui";
import { fetchApi } from "../services/api";
import type { AccountSummary } from "../types";

export default function AccountPage() {
  const [account, setAccount] = useState<AccountSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    fetchApi<AccountSummary>("account/summary")
      .then((res) => {
        setAccount(res);
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
      <PageHeader title="Account Overview" description="View your account balance, equity, and margin details." />

      <StatePanel isLoading={loading} error={error} onRetry={loadData}>
        {account && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard title="Balance" value={account.balance} />
              <MetricCard title="Equity" value={account.equity} />
              <MetricCard 
                title="Profit" 
                value={account.profit} 
                trend={{ value: Math.abs(account.profit), isPositive: account.profit >= 0 }} 
              />
            </div>

            <SectionCard title="Account Details" className="mt-6">
              <div className="space-y-3">
                <Detail label="Account Name" value={(account as any).name ?? "N/A"} />
                <Detail label="Login ID" value={(account as any).login ?? "N/A"} />
                <Detail label="Currency" value={(account as any).currency ?? "USD"} />
                <Detail label="Leverage" value={(account as any).leverage ?? "N/A"} />
                <Detail label="Margin" value={account.margin ?? "N/A"} />
              </div>
            </SectionCard>
          </>
        )}
      </StatePanel>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between border-b border-white/5 py-2">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-200">{value}</span>
    </div>
  );
}