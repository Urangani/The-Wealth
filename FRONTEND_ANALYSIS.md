# Frontend Implementation Analysis - TheWealth

This document provides a comprehensive analysis of the frontend implementation of "TheWealth" trading system, mapping UI components to backend dependencies and identifying areas for optimization.

---

## 1. Page-by-Page Breakdown

### Page: Command Center (Home)
*   **Purpose & Role**: Central monitoring hub for system health, account performance, and active strategies.
*   **Frontend Components**:
    *   `PageHeader`: Title and description.
    *   `MetricCard` (x4): Balance, Equity (with `SparklineChart`), Profit (with trend), Margin Level.
    *   `SectionCard` (Market Connectivity): Live price tick, Bid/Ask values, WS status indicator.
    *   `SectionCard` (Active Strategies): List with toggle/run controls.
    *   `SectionCard` (Active Market Exposure): `DataTable` with open positions.
    *   `StatePanel`: Global loading/error handler.
*   **Backend Coordination**:
    *   **Endpoints**: `/account/summary`, `/trades/open`, `/strategies`, `/strategies/:id/toggle` (POST), `/strategies/:id/run` (POST), `/trade/close` (POST).
    *   **Data Models**: `AccountSummary`, `Position`, `StrategyItem`.
    *   **WS Topics**: `price`, `account`, `positions`, `status`.
*   **Optimized Layout & Hierarchy**: High-density dashboard. Uses a grid system for KPIs and a two-column layout for live data vs. strategy control.
*   **Consistency & Styling**: Uses Emerald/Rose for financial directions. Consistent card-based layout.

### Page: Trade Journal
*   **Purpose & Role**: Performance review and historical trade analysis.
*   **Frontend Components**:
    *   `MetricCard` (x3): Total P/L, Win Rate, Total Trades.
    *   `DistributionChart`: Trades by Symbol (Bar/Pie), Win/Loss Ratio.
    *   `SectionCard`: Filter/Search bar + `DataTable`.
*   **Backend Coordination**:
    *   **Endpoints**: `/journal/trades`.
    *   **Data Models**: `Position[]`.
*   **Optimized Layout & Hierarchy**: Summary statistics at top, followed by visual analytics, and detailed records at the bottom.
*   **Consistency & Styling**: Filters use standard input/select with themed styling.

### Page: Execution Panel (Trade Panel)
*   **Purpose & Role**: Manual trade entry and real-time market visualization.
*   **Frontend Components**:
    *   `SectionCard` (Chart): Candlestick chart using `Recharts` (`ComposedChart`) with custom `CandlestickBar`.
    *   `SymbolSelector`: Dropdown for asset selection.
    *   `NumberStepper`: Lot size control.
    *   `SectionCard` (Direct Order): Buy/Sell buttons with feedback alerts.
    *   `SectionCard` (Open Positions): Specific to the selected symbol.
*   **Backend Coordination**:
    *   **Endpoints**: `/market/candles`, `/trade/open` (POST).
    *   **Data Models**: `Candle`, `TradeRequest`.
*   **Optimized Layout & Hierarchy**: Vertical flow from visual context (chart) to action (order form) to result (open positions).

### Page: Strategy Management
*   **Purpose & Role**: Full lifecycle management of trading strategies from research to live.
*   **Frontend Components**:
    *   `QuickStatsOverview`: High-level counts and alerts.
    *   `PipelineBoard`: Kanban-style view of strategies across stages.
    *   `StrategyDetailView`: Detailed parameters, backtest charts, and action buttons.
    *   `PromotionModal`: Logic for advancing strategies through stages.
*   **Backend Coordination**:
    *   **Endpoints**: `/strategies`, `/strategies/:id/toggle`, `/strategies/:id/run`, `/strategies/:id/promote`.
    *   **Data Models**: `StrategyItem`.
    *   **Mismatches**: Currently uses `DUMMY_STRATEGIES` for UI demonstration, which may diverge from actual backend responses.
*   **Optimized Layout & Hierarchy**: Broad overview followed by a pipeline, then deep dive into selected item.

### Page: Risk Management
*   **Purpose & Role**: Safety monitoring and limit enforcement.
*   **Frontend Components**:
    *   `MetricCard`: Max Daily Loss, Max Open Trades, Allowed Symbols.
    *   `SectionCard`: Placeholders for Drawdown and Risk Utilization.
*   **Backend Coordination**:
    *   **Endpoints**: `/risk/limits`.
*   **Missing Functionality**: Drawdown tracking and real-time utilization are placeholders.

### Page: Trading Calendar
*   **Purpose & Role**: Session planning and event tracking.
*   **Frontend Components**:
    *   Custom Calendar Grid: Profit/Loss per day.
    *   Market Sessions Timeline: Visual bars for Sydney/Tokyo/London/NY.
    *   Event List: Impact-rated economic events.
    *   `Modal`: Daily drill-down with trade lists.
*   **Backend Coordination**:
    *   **Endpoints**: Currently mostly mock data. Needs `/calendar/summary` or `/calendar/events`.
*   **Optimized Layout & Hierarchy**: Calendar-first view with sidebars for stats and upcoming events.

### Page: System Logs
*   **Purpose & Role**: Low-level debugging and system activity tracking.
*   **Frontend Components**:
    *   Filter Pills: Severity-based filtering.
    *   Search Bar: Real-time client-side search.
    *   Auto-refresh Toggle: Polling control.
    *   Log List: Monospaced high-density list.
*   **Backend Coordination**:
    *   **Endpoints**: `/logs?limit=300&severity=...`.
    *   **WS Topics**: `log` (planned/future).

### Page: Weekly Review
*   **Purpose & Role**: Higher-level performance synthesis.
*   **Frontend Components**:
    *   `MetricCard`: Trades, Win Rate, Net P/L.
    *   `EmptyState`: Placeholders for historical trends.
*   **Backend Coordination**:
    *   **Endpoints**: `/review/summary`.

---

## 2. Component Usage Checklist

| Category | Component | Usage Count | Source |
| :--- | :--- | :--- | :--- |
| **UI** | `MetricCard` | High (All pages) | `app/components/ui` |
| | `SectionCard` | High (All pages) | `app/components/ui` |
| | `DataTable` | Medium (Home, Journal) | `app/components/ui` |
| | `StatePanel` | High (All pages) | `app/components/ui` |
| | `PageHeader` | High (All pages) | `app/components/ui` |
| | `EmptyState` | Medium (Risk, AI, Review) | `app/components/ui` |
| | `SymbolSelector` | Low (Trade Panel) | `app/components/ui` |
| | `NumberStepper` | Low (Trade Panel) | `app/components/ui` |
| **Charts** | `SparklineChart` | Low (Home) | `app/components/charts` |
| | `DistributionChart`| Low (Journal) | `app/components/charts` |
| | `CandlestickBar` | Low (Trade Panel) | `app/routes/trade-panel.tsx` |
| **Strategy**| `PipelineBoard` | Low (Strategy Mgmt) | `app/components/strategy` |

---

## 3. Backend Coordination Map

| Page | API Endpoint | Method | Data Model |
| :--- | :--- | :--- | :--- |
| **Home** | `/account/summary` | GET | `AccountSummary` |
| | `/trades/open` | GET | `Position[]` |
| | `/strategies` | GET | `StrategyItem[]` |
| **Journal** | `/journal/trades` | GET | `Position[]` |
| **Risk** | `/risk/limits` | GET | `any` (RiskLimits) |
| **Logs** | `/logs` | GET | `LogItem[]` |
| **Trade Panel**| `/market/candles` | GET | `Candle[]` |
| | `/trade/open` | POST | `TradeRequest` |
| **Strategy Mgmt**| `/strategies/:id/promote`| POST | `PromotionRequest` |

---

## 4. Recommendations & Opportunities

### Reuse & Modularity
*   **Abstract Chart Logic**: The Candlestick chart in `TradePanel` is highly custom. It should be moved to `app/components/charts/CandlestickChart.tsx` for potential reuse in Strategy Management (backtest results).
*   **Form Components**: `SymbolSelector` and `NumberStepper` are excellent. Consider creating a `TradeForm` component that encapsulates the logic for manual execution.
*   **Log Viewer**: The log viewer in `Logs` could be abstracted into a shared component for displaying strategy-specific logs in `StrategyDetailView`.

### Performance & Hierarchy
*   **Lazy Loading**: Use React Router's `lazy` for all routes to reduce initial bundle size.
*   **WS Throttling**: The `Home` page receives rapid price updates. Ensure the state updates are throttled or use a ref for high-frequency data if the DOM updates become a bottleneck.
*   **Pagination**: `DataTable` and `Logs` should implement server-side pagination once data volume increases.

### Consistency
*   **Data Models**: Standardize the `StrategyItem` and `Position` models between dummy data and API responses. Some pages use `any` or slightly different interfaces.
*   **Loading States**: Ensure `StatePanel` is used consistently across all new pages (AI Management, Review) once they are integrated.

### Missing/Placeholder Strategy
*   **AI Management**: Priority should be given to defining the `/ai/models` and `/ai/utilization` endpoints to replace the current `EmptyState`.
*   **Risk Metrics**: Implement the `/risk/drawdown` history endpoint to populate the placeholder charts.
