export interface AccountSummary {
  balance: number;
  equity: number;
  profit: number;
  margin?: number;
  margin_free?: number;
  margin_level?: number;
}

export interface Position {
  ticket: number;
  symbol: string;
  type: "BUY" | "SELL";
  volume: number;
  open_price?: number;
  current_price?: number;
  profit: number;
  sl?: number;
  tp?: number;
  time?: string;
  close_price?: number;
  status?: string;
}

export interface TradeRequest {
  symbol: string;
  lot: number;
  order_type: "BUY" | "SELL";
  sl?: number;
  tp?: number;
}

export interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  message?: string;
}

export interface Strategy {
  id: string;
  name: string;
  status: "active" | "inactive" | "error";
  performance: number;
  last_trade_time?: string;
}

export interface AIModelStatus {
  id: string;
  model_name: string;
  status: "training" | "inference" | "idle";
  accuracy: number;
  last_inference_time?: string;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  range: [number, number];
  wick: [number, number];
  bullish: boolean;
}

export interface OpenPosition {
  ticket: number;
  symbol: string;
  type: "BUY" | "SELL";
  volume: number;
  profit: number;
  open_price?: number;
}

export type Timeframe = "M1" | "M5" | "M15" | "M30" | "H1" | "H4" | "D1";

export const TIMEFRAMES: readonly Timeframe[] = ["M1", "M5", "M15", "M30", "H1", "H4", "D1"];

export type TradingMode = "live" | "analysis" | "reports";
