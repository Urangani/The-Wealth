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
] satisfies RouteConfig;