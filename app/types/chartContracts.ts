/**
 * chartContracts.ts
 *
 * Defines the expected data structures for future historical analytics endpoints.
 * These interfaces serve as a contract between the frontend charts and backend API.
 */

/**
 * Historical equity series for performance over time.
 * Expected endpoint: GET /analytics/equity-history?period=1w|1m|all
 */
export interface EquityHistoryPoint {
  time: string;       // ISO timestamp or formatted date
  equity: number;     // Account equity at that time
  balance: number;    // Account balance at that time
}

/**
 * Drawdown metrics for risk analysis.
 * Expected endpoint: GET /analytics/drawdown-series?period=1m
 */
export interface DrawdownPoint {
  time: string;
  drawdown_percent: number;
  drawdown_amount: number;
}

/**
 * Symbol performance breakdown.
 * Expected endpoint: GET /analytics/symbol-performance
 */
export interface SymbolPerformance {
  symbol: string;
  profit: number;
  trades_count: number;
  win_rate: number;
}

/**
 * Execution latency tracking.
 * Expected endpoint: GET /analytics/execution-latency
 */
export interface ExecutionLatency {
  time: string;
  latency_ms: number;
  order_type: "BUY" | "SELL" | "CLOSE";
  symbol: string;
}

/**
 * Strategy signal performance.
 * Expected endpoint: GET /analytics/strategy-performance
 */
export interface StrategySignalPerformance {
  strategy_id: string;
  name: string;
  total_signals: number;
  profitable_signals: number;
  profit_factor: number;
}
