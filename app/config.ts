function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

export const config = {
  apiBaseUrl: normalizeBaseUrl(
    (import.meta as any).env?.VITE_API_BASE_URL ?? "http://localhost:8000"
  ),
  wsUrl:
    (import.meta as any).env?.VITE_WS_URL ?? "ws://127.0.0.1:8000/ws/market",
};

