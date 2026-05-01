import { useEffect, useState } from "react";

export default function Home() {
  const [account, setAccount] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [price, setPrice] = useState<any>(null);

  const [symbol, setSymbol] = useState("EURUSD");
  const [lot, setLot] = useState(0.1);

  const [loading, setLoading] = useState(true);

  // 📡 Fetch initial data
  const loadData = async () => {
    try {
      const accRes = await fetch("http://localhost:8000/account/summary");
      const accJson = await accRes.json();

      const posRes = await fetch("http://localhost:8000/trades/open");
      const posJson = await posRes.json();

      setAccount(accJson.data);
      setPositions(posJson.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };





  
  useEffect(() => {
    loadData();
  }, []);

  // ⚡ WebSocket for live price
useEffect(() => {
  const ws = new WebSocket("ws://127.0.0.1:8000/ws/market");

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    switch (msg.type) {
      case "price":
        setPrice(msg.data);
        break;

      case "account":
        setAccount(msg.data);
        break;

      case "positions":
        setPositions(msg.data);
        break;

      case "error":
        console.warn(msg.message);
        break;
    }
  };

  return () => ws.close();
}, []);

  // 🟢 Open Trade
  const openTrade = async (type: "BUY" | "SELL") => {
    await fetch("http://localhost:8000/trade/open", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        symbol,
        lot,
        order_type: type,
      }),
    });

    loadData(); // refresh positions
  };

  // 🔴 Close Trade
  const closeTrade = async (ticket: number) => {
    await fetch("http://localhost:8000/trade/close", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ticket }),
    });

    loadData();
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Account */}
      <div className="grid grid-cols-3 gap-4">
        <Card title="Balance" value={account?.balance} />
        <Card title="Equity" value={account?.equity} />
        <Card title="Profit" value={account?.profit} />
      </div>

      {/* Live Price */}
      <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
        <h2 className="mb-2">Live Market</h2>
        {price ? (
          <div className="flex gap-6">
            <p>{price.symbol}</p>
            <p className="text-green-400">Bid: {price.bid}</p>
            <p className="text-red-400">Ask: {price.ask}</p>
          </div>
        ) : (
          <p>Connecting...</p>
        )}
      </div>

      {/* Trade Panel */}
      <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
        <h2 className="mb-3">Execute Trade</h2>

        <div className="flex gap-3 items-center">
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="bg-gray-800 px-3 py-2 rounded"
          />

          <input
            type="number"
            step="0.01"
            value={lot}
            onChange={(e) => setLot(parseFloat(e.target.value))}
            className="bg-gray-800 px-3 py-2 rounded w-24"
          />

          <button
            onClick={() => openTrade("BUY")}
            className="bg-green-600 px-4 py-2 rounded"
          >
            BUY
          </button>

          <button
            onClick={() => openTrade("SELL")}
            className="bg-red-600 px-4 py-2 rounded"
          >
            SELL
          </button>
        </div>
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
              <th></th>
            </tr>
          </thead>

          <tbody>
            {positions.map((p) => (
              <tr key={p.ticket}>
                <td>{p.symbol}</td>
                <td className={p.type === "BUY" ? "text-green-400" : "text-red-400"}>
                  {p.type}
                </td>
                <td>{p.volume}</td>
                <td className={p.profit >= 0 ? "text-green-400" : "text-red-400"}>
                  {p.profit}
                </td>
                <td>
                  <button
                    onClick={() => closeTrade(p.ticket)}
                    className="bg-gray-700 px-2 py-1 rounded text-xs"
                  >
                    Close
                  </button>
                </td>
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