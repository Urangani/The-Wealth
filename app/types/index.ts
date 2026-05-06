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
