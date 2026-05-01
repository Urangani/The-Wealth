let ws: WebSocket | null = null;
let listeners: ((data: any) => void)[] = [];

export function connectWS() {
  if (ws && ws.readyState === WebSocket.OPEN) return ws;

  ws = new WebSocket("ws://127.0.0.1:8000/ws/market");

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    listeners.forEach((fn) => fn(data));
  };

  ws.onclose = () => {
    ws = null;
  };

  return ws;
}

export function subscribe(fn: (data: any) => void) {
  listeners.push(fn);

  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}