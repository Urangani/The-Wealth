import type { RouteConfig } from "@react-router/dev/routes";

export default [
  {
    path: "/",
    file: "routes/home.tsx",
  },
  {
    path: "/journal",
    file: "routes/journal.tsx",
  },
  {
    path: "/strategies",
    file: "routes/strategies.tsx",
  },
  {
    path: "/risk",
    file: "routes/risk.tsx",
  },
  {
    path: "/logs",
    file: "routes/logs.tsx",
  },
  {
    path: "/review",
    file: "routes/review.tsx",
  },
  {
    path: "/account",
    file: "routes/account.tsx",
  },
  {
    path: "/trade-panel",
    file: "routes/trade-panel.tsx",
  },
  {
    path: "/strategy-management",
    file: "routes/strategy-management.tsx",
  },
  {
    path: "/ai-management",
    file: "routes/ai-management.tsx",
  },
  {
    path: "/calendar",
    file: "routes/calendar.tsx",
  },
] satisfies RouteConfig;