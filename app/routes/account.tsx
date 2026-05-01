import { useEffect, useState } from "react";

type Account = {
  balance: number;
  equity: number;
  profit: number;
  margin?: number;
  name?: string;
  login?: number;
  currency?: string;
  leverage?: number;
};

export default function AccountPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/account/summary")
      .then((res) => res.json())
      .then((res) => {
        setAccount(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {

    return <div className="text-gray-400">Loading account...</div>;
  }

  if (!account) {
    return <div className="text-red-400">Failed to load account</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Account Overview</h1>

      {/* Top stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card label="Balance" value={account.balance} />
        <Card label="Equity" value={account.equity} />
        <Card label="Profit" value={account.profit} />
      </div>

      {/* Account details */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
        <h2 className="text-lg font-medium text-gray-300">Account Details</h2>

        <Detail label="Account Name" value={account.name ?? "N/A"} />
        <Detail label="Login ID" value={account.login ?? "N/A"} />
        <Detail label="Currency" value={account.currency ?? "USD"} />
        <Detail label="Leverage" value={account.leverage ?? "N/A"} />
        <Detail label="Margin" value={account.margin ?? "N/A"} />
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between border-b border-gray-800 py-2">
      <span className="text-gray-400">{label}</span>
      <span className="text-gray-200">{value}</span>
    </div>
  );
}