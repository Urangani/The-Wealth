import { useEffect, useState } from "react";

export default function Home() {
  const [account, setAccount] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/account/summary")
      .then(res => res.json())
      .then(setAccount);

    fetch("http://localhost:8000/trades/open")
      .then(res => res.json())
      .then(setPositions);
  }, []);

  if (!account) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Account */}
      <div className="grid grid-cols-3 gap-4">
        <Card title="Balance" value={account.balance} />
        <Card title="Equity" value={account.equity} />
        <Card title="Profit" value={account.profit} />
      </div>

      {/* Positions */}
      <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
        <h2 className="mb-3">Open Positions</h2>

        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Type</th>
              <th>Volume</th>
              <th>P/L</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((p, i) => (
              <tr key={i}>
                <td>{p.symbol}</td>
                <td>{p.type}</td>
                <td>{p.volume}</td>
                <td>{p.profit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Card({ title, value }: any) {
  return (
    <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}