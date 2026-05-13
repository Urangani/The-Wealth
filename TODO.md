# Strategy Management UI - MVP TODO

This TODO converts the original layout spec into an implementation checklist aligned with the existing frontend code under `TheWealth/app/routes/strategy-management.tsx` and components in `TheWealth/app/components/strategy/*`.

## Status Legend
- ✅ Implemented in current UI
- 🟡 Partially implemented / placeholders remain
- ⛏️ Not implemented yet

---

## 1) Dashboard (Home Screen) - Strategy Pipeline View
### PipelineBoard grid + stages
- ✅ Stages: `Research → Coding → Backtesting → Tracking → Paper Trading → Live Trading → Optimization`
  - Implemented via `STAGES` in `app/routes/strategy-management.tsx` and rendered by `PipelineBoard.tsx`.
- ✅ Each strategy displayed as a card within its inferred stage
  - Implemented in `PipelineBoard.tsx` + `StrategyPipelineCard.tsx`.
- ✅ Confidence score badge (0–100 scale visualization)
  - Implemented in `StrategyPipelineCard.tsx` using `confidenceScore`/`tracking.confidenceScore`.

### Promote button per stage card
- ✅ “Promote →” button present on each strategy card
  - Implemented in `StrategyPipelineCard.tsx`.
- ✅ Promotion modal with requirement preview (Sharpe + drawdown thresholds)
  - Implemented in `PromotionModal.tsx`.
- 🟡 Promotion thresholds currently hardcoded for preview logic and modal action behavior:
  - Sharpe min: `1.5`
  - Max drawdown: `20%`
  - (Backed by UI-only `promotionPreview` in `strategy-management.tsx`; backend integration is already wired for the promote call.)

---

## 2) Strategy Detail Page (single selection panel)
### Header (name, stage, description)
- ✅ Strategy name + stage badge + description
  - Implemented in `StrategyDetailView.tsx`.

### Tabs
- ✅ Tabs exist: Overview / Backtest / Tracking / Paper Trading / Live Trading / Optimization
  - Implemented in `StrategyDetailView.tsx`.

### Tab content
- Overview
  - ✅ Parameters viewer from `strategy.params`
  - ✅ Meta: category, version, status (enabled/paused)
- Backtest Results
  - ✅ Equity curve sparkline
  - ✅ Sharpe / Drawdown / Win Rate summary cards (drawdown shown as `%`)
- Tracking
  - ✅ Rank display (from `strategy.tracking.rank`)
  - ✅ Confidence score progress bar (from `strategy.confidenceScore`)
- Paper Trading
  - ✅ Simulated trades table via `DataTable`
- Live Trading
  - 🟡 Risk dashboard is a placeholder (not implemented beyond UI stub)
  - ✅ Live positions list rendered (symbol + pnl coloring)
- Optimization
  - 🟡 Parameter sliders + “Run Optimization” button are placeholders (no API wiring)

---

## 3) Promotion Workflow
### Promote action behavior
- ✅ Clicking promote triggers backend call:
  - `POST strategies/:id/promote` with `{ targetStage, mode }`
  - Implemented in `app/routes/strategy-management.tsx` (`handlePromoteAction`).
- ✅ If requirements not met, user can “Send to Optimization” instead of promote
  - Implemented in `PromotionModal.tsx` + `handlePromoteAction` mode selection.

### Threshold logic (MVP)
- ✅ Sharpe threshold check in UI preview: `sharpe >= 1.5`
- ✅ Drawdown threshold check in UI preview:
  - UI assumes `strategy.backtest.drawdown` is in “percent” form and converts to ratio
  - check: `(drawdownPercent / 100) <= 0.2`

### If a strategy fails backtest/paper losses
- 🟡 Alerts exist in the UI, but data source is currently “whatever backend returns” (plus dummy strategies fallback).
  - `QuickStatsOverview` shows alerts; detailed alert rendering beyond summary is not implemented.

---

## 4) Analysis & Ranking Panel
### Rank table + category filters + parameter viewer
- 🟡 Not implemented yet in current MVP UI.
  - Existing UI includes “Top ranked” list + pipeline visualization.
  - Rank table / category filters / parameter suggestions panel are not present.

Current implemented “ranking-like” features:
- ✅ Quick Stats “Top ranked” based on `confidenceScore`
  - `QuickStatsOverview.tsx`.

---

## 5) Paper & Live Trading Monitor
### Paper Trading
- ✅ Trades table shown inside Strategy Detail -> Paper tab
  - Uses `strategy.paperTrading.trades`.

### Live Trading
- ✅ Positions list shown inside Strategy Detail -> Live tab
- 🟡 Risk dashboard (exposure, stop-loss triggers, anomaly alerts) not implemented beyond placeholder UI.

---

## 6) Optimization Panel
### Parameter sliders + run optimization + comparison chart
- 🟡 UI sliders and “Run Optimization” button exist but are placeholders:
  - No API call / no optimization history / no before-vs-after chart.

### Re-promote option
- 🟡 Not implemented yet.
  - Current promotion modal supports “Send to Optimization”, but there is no “re-promote to paper trading” flow from Optimization UI.

---

## MVP Principles Mapping
- ✅ Minimal but functional: pipeline visibility + promotion workflow
- ✅ Data-driven UI:
  - Confidence badges
  - Pipeline cards
  - Backtest sparkline + metrics
  - Trade/position tables/lists
- 🟡 Scalable direction:
  - ML ranking, advanced analytics, and multi-strategy portfolios are not implemented yet (future work).

---

## Next Implementation Steps (Ordered)
1. 🟡 Wire Optimization tab sliders to a real optimization API and display results/history.
2. 🟡 Replace live “Risk Dashboard Content” placeholder with real risk metrics + alert triggers.
3. 🟡 Add Analysis & Ranking Panel:
   - rank table across all strategies
   - category filters
   - parameter viewer + suggested optimizations
4. 🟡 Implement “Optimization → re-promote to Paper” workflow (button + backend call).
5. 🟡 Replace dummy strategies fallback behavior with more robust backend error states (if needed).
