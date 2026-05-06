import { config } from "../config";

let ws: WebSocket | null = null;
let listeners: ((data: any) => void)[] = [];
let statusListeners: ((status: "connecting" | "open" | "closed" | "error") => void)[] = [];

let reconnectTimer: number | null = null;
let reconnectAttempt = 0;

function emitStatus(status: "connecting" | "open" | "closed" | "error") {
  statusListeners.forEach((fn) => fn(status));
}

function scheduleReconnect() {
  if (reconnectTimer != null) return;
  reconnectAttempt += 1;
  const base = 250;
  const max = 5000;
  const delay = Math.min(max, base * 2 ** Math.min(reconnectAttempt, 6));

  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null;
    connectWS(true);
  }, delay);
}

export function connectWS(forceReconnect = false) {
  if (!forceReconnect && ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return ws;
  }

  try {
    emitStatus("connecting");
    ws = new WebSocket(config.wsUrl);
  } catch {
    emitStatus("error");
    scheduleReconnect();
    return ws;
  }

  ws.onopen = () => {
    reconnectAttempt = 0;
    emitStatus("open");
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    listeners.forEach((fn) => fn(data));
  };

  ws.onclose = () => {
    ws = null;
    emitStatus("closed");
    scheduleReconnect();
  };

  ws.onerror = () => {
    emitStatus("error");
  };

  return ws;
}

export function subscribe(fn: (data: any) => void) {
  listeners.push(fn);

  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

export function subscribeStatus(fn: (status: "connecting" | "open" | "closed" | "error") => void) {
  statusListeners.push(fn);
  return () => {
    statusListeners = statusListeners.filter((l) => l !== fn);
  };
}