import { config } from "~/config";

const TOKEN_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

export interface User {
  id: string;
  email: string;
  display_name: string;
}

export interface BrokerAccount {
  id: string;
  broker_type: "mt5" | "deriv";
  account_label: string;
  mt5_login: number | null;
  deriv_account_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  access_token: string | null;
  refresh_token: string | null;
  active_account: BrokerAccount | null;
}

function getStored(): AuthState {
  try {
    const raw = localStorage.getItem("auth_state");
    if (raw) return JSON.parse(raw);
  } catch {}
  return { user: null, access_token: null, refresh_token: null, active_account: null };
}

function store(state: AuthState) {
  localStorage.setItem("auth_state", JSON.stringify(state));
}

export function clearAuth() {
  localStorage.removeItem("auth_state");
}

export function getAccessToken(): string | null {
  return getStored().access_token;
}

async function api<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const state = getStored();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (state.access_token) {
    headers["Authorization"] = `Bearer ${state.access_token}`;
  }
  const res = await fetch(`${config.apiBaseUrl}${endpoint}`, {
    ...options,
    headers,
  });
  if (res.status === 401 && state.refresh_token) {
    const refreshed = await tryRefresh(state.refresh_token);
    if (refreshed) {
      headers["Authorization"] = `Bearer ${refreshed.access_token}`;
      const retry = await fetch(`${config.apiBaseUrl}${endpoint}`, {
        ...options,
        headers,
      });
      if (retry.ok) return retry.json();
    }
    clearAuth();
    window.location.href = "/login";
    throw new Error("Session expired");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.detail || err.message || "Request failed");
  }
  return res.json();
}

async function tryRefresh(
  refreshToken: string
): Promise<{ access_token: string; refresh_token: string } | null> {
  try {
    const res = await fetch(`${config.apiBaseUrl}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) return null;
    const body = await res.json();
    const data = body.data || body;
    const updated = { ...getStored(), ...data };
    store(updated);
    return data;
  } catch {
    return null;
  }
}

export async function login(
  email: string,
  password: string
): Promise<AuthState> {
  const body = await api<{
    status: string;
    data: {
      access_token: string;
      refresh_token: string;
      user: User;
      active_account: BrokerAccount | null;
    };
  }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const state: AuthState = {
    user: body.data.user,
    access_token: body.data.access_token,
    refresh_token: body.data.refresh_token,
    active_account: body.data.active_account,
  };
  store(state);
  return state;
}

export async function register(
  email: string,
  password: string,
  display_name: string
): Promise<User> {
  const body = await api<{
    status: string;
    data: User;
  }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, display_name }),
  });
  return body.data;
}

export async function fetchMe(): Promise<AuthState> {
  const body = await api<{
    status: string;
    data: { user: User; active_account: BrokerAccount | null };
  }>("/auth/me");
  const state = { ...getStored(), ...body.data };
  store(state);
  return state;
}

export async function fetchAccounts(): Promise<BrokerAccount[]> {
  const body = await api<{ status: string; data: BrokerAccount[] }>(
    "/auth/accounts"
  );
  return body.data;
}

export async function linkAccount(params: {
  broker_type: string;
  account_label: string;
  mt5_login?: number;
  deriv_account_id?: string;
}): Promise<BrokerAccount> {
  const body = await api<{ status: string; data: BrokerAccount }>(
    "/auth/accounts/link",
    { method: "POST", body: JSON.stringify(params) }
  );
  return body.data;
}

export async function switchAccount(
  account_id: string
): Promise<BrokerAccount> {
  const body = await api<{ status: string; data: BrokerAccount }>(
    "/auth/accounts/switch",
    { method: "POST", body: JSON.stringify({ account_id }) }
  );
  const updated = getStored();
  updated.active_account = body.data;
  store(updated);
  return body.data;
}
