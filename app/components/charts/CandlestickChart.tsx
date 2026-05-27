import React from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { Candle, OpenPosition, Timeframe } from "../../types";
import { TIMEFRAMES } from "../../types";

function formatTime(ts: number): string {
  return new Date(ts * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const CandlestickBar = (props: any) => {
  const { x, y, width, height, payload } = props;
  if (!payload) return null;

  const { open, high, low, close, bullish } = payload;
  const color = bullish ? "#34d399" : "#f87171";

  const allPrices = [open, high, low, close].filter(Boolean);
  const minP = Math.min(...allPrices);
  const maxP = Math.max(...allPrices);
  const range = maxP - minP || 0.0001;

  const bodyTop = y + ((maxP - Math.max(open, close)) / range) * height;
  const bodyH = (Math.abs(close - open) / range) * height || 1;
  const wickX = x + width / 2;
  const wickTop = y;
  const wickBottom = y + height;

  return (
    <g>
      <line x1={wickX} x2={wickX} y1={wickTop} y2={wickBottom} stroke={color} strokeWidth={1} opacity={0.5} />
      <rect x={x + 1} y={bodyTop} width={Math.max(width - 2, 1)} height={Math.max(bodyH, 1)} fill={color} opacity={0.85} />
    </g>
  );
};

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

export interface ChartOverlay {
  dataKey: string;
  color: string;
  label: string;
  strokeWidth?: number;
  strokeDasharray?: string;
}

export interface CandlestickChartProps {
  data: Candle[];
  loading?: boolean;
  symbol: string;
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  onRefresh: () => void;
  wsStatus: "connecting" | "open" | "closed" | "error";
  positions?: OpenPosition[];
  overlays?: ChartOverlay[];
  height?: number;
}

export function CandlestickChart({
  data,
  loading = false,
  symbol,
  timeframe,
  onTimeframeChange,
  onRefresh,
  wsStatus,
  positions = [],
  overlays = [],
  height = 56,
}: CandlestickChartProps) {
  const symbolPositions = positions.filter((p) => p.symbol === symbol);
  const priceRange = data.length
    ? { min: Math.min(...data.map((c) => c.low)), max: Math.max(...data.map((c) => c.high)) }
    : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-300">{symbol} · {timeframe}</span>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${wsStatus === "open" ? "bg-emerald-400 animate-pulse" : "bg-gray-600"}`} />
          <div className="flex gap-1">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
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
            onClick={onRefresh}
            className="text-gray-500 hover:text-gray-300 text-xs px-2 py-1 rounded hover:bg-white/5 transition-colors"
            title="Refresh"
          >
            ↻
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-500 text-sm gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-white" />
          Loading candles…
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-gray-600 text-sm">
          No candle data available. MT5 may be offline.
        </div>
      ) : (
        <div style={{ height: `${height}%` }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
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

              {symbolPositions.map((p) =>
                p.open_price ? (
                  <ReferenceLine
                    key={p.ticket}
                    y={p.open_price}
                    stroke={p.type === "BUY" ? "#34d399" : "#f87171"}
                    strokeDasharray="4 2"
                    label={{
                      value: `${p.type} #${p.ticket}`,
                      position: "right",
                      fontSize: 9,
                      fill: p.type === "BUY" ? "#34d399" : "#f87171",
                    }}
                  />
                ) : null
              )}

              <Bar dataKey="high" shape={<CandlestickBar />} isAnimationActive={false} />

              {overlays.map((overlay) => (
                <Line
                  key={overlay.dataKey}
                  type="monotone"
                  dataKey={overlay.dataKey}
                  stroke={overlay.color}
                  strokeWidth={overlay.strokeWidth ?? 1.5}
                  strokeDasharray={overlay.strokeDasharray}
                  dot={false}
                  isAnimationActive={false}
                  name={overlay.label}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
