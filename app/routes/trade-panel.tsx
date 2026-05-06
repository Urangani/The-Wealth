import { useCallback, useEffect, useState } from "react";
import { PageHeader, SectionCard, NumberStepper, SymbolSelector } from "../components/ui";
import { fetchApi } from "../services/api";
import { subscribe, subscribeStatus } from "../services/ws";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  /** Recharts low-high range for the candlestick body */
  range: [number, number];
  /** Recharts open-close range for the candlestick wick */
  wick: [number, number];
  bullish: boolean;
}

interface OpenPosition {
  ticket: number;
  symbol: string;
  type: "BUY" | "SELL";
  volume: number;
  profit: number;
  open_price?: number;
}

const TIMEFRAMES = ["M1", "M5", "M15", "M30", "H1", "H4", "D1"] as const;
type Timeframe = (typeof TIMEFRAMES)[number];

function formatTime(ts: number): string {
  return new Date(ts * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Custom candlestick shape rendered as SVG rectangles
const CandlestickBar = (props: any) => {
  const { x, y, width, height, payload } = props;
  if (!payload) return null;

  const { open, high, low, close, bullish } = payload;
  const color = bullish ? "#34d399" : "#f87171";

  const allPrices = [open, high, low, close].filter(Boolean);
  const minP = Math.min(...allPrices);
  const maxP = Math.max(...allPrices);
  const range = maxP - minP || 0.0001;

  // Calculate pixel positions within the bar's allotted space
  const bodyTop = y + ((maxP - Math.max(open, close)) / range) * height;
  const bodyH = (Math.abs(close - open) / range) * height || 1;
  const wickX = x + width / 2;
  const wickTop = y;
  const wickBottom = y + height;

  return (
    <g>
      {/* High-low wick */}
      <line x1={wickX} x2={wickX} y1={wickTop} y2={wickBottom} stroke={color} strokeWidth={1} opacity={0.5} />
      {/* Open-close body */}
      <rect x={x + 1} y={bodyTop} width={Math.max(width - 2, 1)} height={Math.max(bodyH, 1)} fill={color} opacity={0.85} />
    </g>
  );
};

// Custom tooltip
const CandleTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const c = payload[0]?.payload as Candle;
  if (!c) return null;
  return (
    <div className="bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono shadow-xl">
      <p className="text-gray-400 mb-1">{formatTime(c.time)}</p>
      <p className="text-white">O <span className="text-gray-300">{c.open.toFixed(5)}</span></p>
      <p className="text-white">H <span className="text-emerald-400">{c.high.toFixed(5)}</span></p>
      <p className="text-white">L <span className="text-rose-400">{c.low.toFixed(5)}</span></p>
      <p className="text-white">C <span className={c.bullish ? "text-emerald-400" : "text-rose-400"}>{c.close.toFixed(5)}</span></p>
    </div>
  );
};

export default function TradePanel() {
  const [symbol, setSymbol] = useState("EURUSD");
  const [lot, setLot] = useState(0.1);
  const [timeframe, setTimeframe] = useState<Timeframe>("M5");
  const [isTrading, setIsTrading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [candles, setCandles] = useState<Candle[]>([]);
  const [candleLoading, setCandleLoading] = useState(false);
  const [positions, setPositions] = useState<OpenPosition[]>([]);
  const [wsStatus, setWsStatus] = useState<"connecting" | "open" | "closed" | "error">("connecting");

  // ── Candle loader ───────────────────────────────────────────────────────────
  const loadCandles = useCallback(async (sym: string, tf: Timeframe) => {
    setCandleLoading(true);
    try {
      const raw = await fetchApi<any[]>(`market/candles?symbol=${sym}&timeframe=${tf}&count=80`);
      const parsed: Candle[] = (raw || []).map((r) => ({
        ...r,
        bullish: r.close >= r.open,
        range: [r.low, r.high] as [number, number],
        wick: [r.open, r.close] as [number, number],
      }));
      setCandles(parsed);
    } catch {
      setCandles([]);
    } finally {
      setCandleLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCandles(symbol, timeframe);
  }, [symbol, timeframe, loadCandles]);

  // ── WS subscriptions ────────────────────────────────────────────────────────
  useEffect(() => {
    const unStatus = subscribeStatus(setWsStatus);
    const unData = subscribe((msg) => {
      if (msg.type === "positions") setPositions(msg.data || []);
    });
    return () => { unStatus(); unData(); };
  }, []);

  // ── Trade actions ───────────────────────────────────────────────────────────
  const placeTrade = async (orderType: "BUY" | "SELL") => {
    if (lot <= 0) { setFeedback({ type: "error", text: "Lot size must be > 0" }); return; }
    setIsTrading(true);
    setFeedback(null);
    try {
      await fetchApi("trade/open", {
        method: "POST",
        body: JSON.stringify({ symbol: symbol.toUpperCase(), lot, order_type: orderType }),
      });
      setFeedback({ type: "success", text: `✓ ${orderType} ${symbol} @ ${lot} lot opened` });
      setTimeout(() => setFeedback(null), 4000);
      loadCandles(symbol, timeframe);
    } catch (err: any) {
      setFeedback({ type: "error", text: err.message || "Trade failed" });
    } finally {
      setIsTrading(false);
    }
  };

  const symbolPositions = positions.filter((p) => p.symbol === symbol);
  const priceRange = candles.length
    ? { min: Math.min(...candles.map((c) => c.low)), max: Math.max(...candles.map((c) => c.high)) }
    : null;

  return (
    <div className="space-y-6">
      <PageHeader title="Execution Panel" description="Direct market order entry with live candlestick chart." />

      {/* ── Candle Chart ─────────────────────────────────────────────────── */}
      <SectionCard
        title={`${symbol} · ${timeframe}`}
        action={
          <div className="flex items-center gap-2">
            {/* WS Status dot */}
            <span className={`h-2 w-2 rounded-full ${wsStatus === "open" ? "bg-emerald-400 animate-pulse" : "bg-gray-600"}`} />
            {/* Timeframe selector */}
            <div className="flex gap-1">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    tf === timeframe
                      ? "bg-blue-600/30 text-blue-300 ring-1 ring-blue-500/40"
                      : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
            <button
              onClick={() => loadCandles(symbol, timeframe)}
              className="text-gray-500 hover:text-gray-300 text-xs px-2 py-1 rounded hover:bg-white/5 transition-colors"
            >
              ↻
            </button>
          </div>
        }
      >
        {candleLoading ? (
          <div className="flex items-center justify-center h-48 text-gray-500 text-sm gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-white" />
            Loading candles…
          </div>
        ) : candles.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-gray-600 text-sm">
            No candle data available. MT5 may be offline.
          </div>
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={candles} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="time"
                  tickFormatter={formatTime}
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={priceRange ? [priceRange.min * 0.9999, priceRange.max * 1.0001] : ["auto", "auto"]}
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => v.toFixed(4)}
                  width={60}
                />
                <Tooltip content={<CandleTooltip />} />

                {/* Position entry lines */}
                {symbolPositions.map((p) =>
                  p.open_price ? (
                    <ReferenceLine
                      key={p.ticket}
                      y={p.open_price}
                      stroke={p.type === "BUY" ? "#34d399" : "#f87171"}
                      strokeDasharray="4 2"
                      label={{ value: `${p.type} #${p.ticket}`, position: "right", fontSize: 9, fill: p.type === "BUY" ? "#34d399" : "#f87171" }}
                    />
                  ) : null
                )}

                {/* Candlestick bars */}
                <Bar dataKey="high" shape={<CandlestickBar />} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </SectionCard>

      {/* ── Order Form ───────────────────────────────────────────────────── */}
      <SectionCard title="Direct Order">
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <SymbolSelector value={symbol} onChange={setSymbol} disabled={isTrading} />

            <NumberStepper
              label="Lot Size"
              value={lot}
              onChange={setLot}
              step={0.01}
              min={0.01}
              max={100}
              disabled={isTrading}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={() => placeTrade("BUY")}
              disabled={isTrading || !symbol || lot <= 0}
              className="flex-1 rounded-lg bg-emerald-500/20 px-5 py-2.5 font-medium text-emerald-400 transition hover:bg-emerald-500/30 ring-1 ring-inset ring-emerald-500/30 disabled:opacity-50 flex items-center justify-center"
            >
              {isTrading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" /> : "▲ BUY"}
            </button>

            <button
              onClick={() => placeTrade("SELL")}
              disabled={isTrading || !symbol || lot <= 0}
              className="flex-1 rounded-lg bg-rose-500/20 px-5 py-2.5 font-medium text-rose-400 transition hover:bg-rose-500/30 ring-1 ring-inset ring-rose-500/30 disabled:opacity-50 flex items-center justify-center"
            >
              {isTrading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-rose-400 border-t-transparent" /> : "▼ SELL"}
            </button>
          </div>

          {feedback && (
            <div className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              feedback.type === "success"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
            }`}>
              {feedback.text}
            </div>
          )}
        </div>
      </SectionCard>

      {/* ── Open positions for this symbol ──────────────────────────────── */}
      {symbolPositions.length > 0 && (
        <SectionCard title={`Open Positions · ${symbol}`}>
          <div className="space-y-2">
            {symbolPositions.map((p) => (
              <div key={p.ticket} className="flex items-center justify-between rounded-lg bg-white/3 px-4 py-2.5 border border-white/5">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${p.type === "BUY" ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"}`}>
                    {p.type}
                  </span>
                  <span className="text-sm font-mono text-gray-300">#{p.ticket}</span>
                  <span className="text-xs text-gray-500">{p.volume} lot</span>
                </div>
                <span className={`text-sm font-mono font-semibold ${p.profit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {p.profit >= 0 ? "+" : ""}{p.profit.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}