import { useState } from "react";

export default function TradePanel() {
  const [symbol, setSymbol] = useState("EURUSD");
  const [lot, setLot] = useState(0.1);

  const placeTrade = async (
    orderType: "BUY" | "SELL"
  ) => {
    await fetch(
      "http://localhost:8000/trade/open",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbol,
          lot,
          order_type: orderType,
        }),
      }
    );
  };

  return (
    <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 space-y-4">

      <h2 className="text-lg font-semibold">
        Trade Panel
      </h2>

      <input
        value={symbol}
        onChange={(e) =>
          setSymbol(e.target.value)
        }
        className="w-full bg-gray-950 p-2 rounded"
      />

      <input
        type="number"
        step="0.01"
        value={lot}
        onChange={(e) =>
          setLot(Number(e.target.value))
        }
        className="w-full bg-gray-950 p-2 rounded"
      />

      <div className="flex gap-3">
        <button
          onClick={() => placeTrade("BUY")}
          className="flex-1 bg-green-600 p-2 rounded"
        >
          BUY
        </button>

        <button
          onClick={() => placeTrade("SELL")}
          className="flex-1 bg-red-600 p-2 rounded"
        >
          SELL
        </button>
      </div>
    </div>
  );
}