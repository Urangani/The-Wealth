import type { RouteConfig } from "@react-router/dev/routes";

export default [
  {
    path: "/login",
    file: "routes/login.tsx",
  },
  {
    path: "/register",
    file: "routes/register.tsx",
  },
  {
    path: "/",
    file: "routes/home.tsx",
  },
  {
    path: "/journal",
    file: "routes/journal.tsx",
  },
  {
    path: "/risk",
    file: "routes/risk.tsx",
  },
  {
    path: "/calendar",
    file: "routes/calendar.tsx",
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
    path: "/account",
    file: "routes/account.tsx",
  },
] satisfies RouteConfig;