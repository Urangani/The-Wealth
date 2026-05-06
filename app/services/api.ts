import { config } from "../config";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${config.apiBaseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new ApiError(response.status, data?.message || `API Error: ${response.statusText}`);
    }

    // Handle our backend wrapper if it exists (e.g. { status: "success", data: T })
    if (data && typeof data === 'object' && 'status' in data && 'data' in data) {
        if (data.status === 'error') {
            throw new ApiError(response.status, data.message || 'Unknown API Error');
        }
        return data.data as T;
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error(error instanceof Error ? error.message : "Network request failed");
  }
}
