import { useState } from "react";
import { PageHeader, SectionCard } from "../components/ui";
import { fetchApi } from "../services/api";

export default function TradePanel() {
  const [symbol, setSymbol] = useState("EURUSD");
  const [lot, setLot] = useState(0.1);
  const [isTrading, setIsTrading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const placeTrade = async (orderType: "BUY" | "SELL") => {
    if (lot <= 0) {
      setFeedback({ type: "error", text: "Lot size must be greater than 0" });
      return;
    }

    setIsTrading(true);
    setFeedback(null);
    try {
      await fetchApi("trade/open", {
        method: "POST",
        body: JSON.stringify({ symbol: symbol.toUpperCase(), lot, order_type: orderType }),
      });
      setFeedback({ type: "success", text: `Successfully opened ${orderType} for ${symbol}` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Trade failed" });
    } finally {
      setIsTrading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <PageHeader title="Execution Panel" description="Direct market order entry." />

      <SectionCard title="Direct Order">
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 uppercase tracking-wider">Symbol</label>
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              disabled={isTrading}
              className="bg-gray-900/50 border border-white/10 px-3 py-2 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400 uppercase tracking-wider">Lot Size</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={lot}
              onChange={(e) => setLot(Number(e.target.value))}
              disabled={isTrading}
              className="bg-gray-900/50 border border-white/10 px-3 py-2 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => placeTrade("BUY")}
              disabled={isTrading || !symbol || lot <= 0}
              className="flex-1 rounded-lg bg-emerald-500/20 px-5 py-2.5 font-medium text-emerald-400 transition hover:bg-emerald-500/30 ring-1 ring-inset ring-emerald-500/30 disabled:opacity-50 flex items-center justify-center min-w-[100px]"
            >
              {isTrading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent"></div> : "BUY"}
            </button>

            <button
              onClick={() => placeTrade("SELL")}
              disabled={isTrading || !symbol || lot <= 0}
              className="flex-1 rounded-lg bg-rose-500/20 px-5 py-2.5 font-medium text-rose-400 transition hover:bg-rose-500/30 ring-1 ring-inset ring-rose-500/30 disabled:opacity-50 flex items-center justify-center min-w-[100px]"
            >
              {isTrading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-rose-400 border-t-transparent"></div> : "SELL"}
            </button>
          </div>

          {feedback && (
            <div className={`mt-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              feedback.type === "success" 
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            }`}>
              {feedback.text}
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
}