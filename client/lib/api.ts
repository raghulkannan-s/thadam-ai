import type { ApiResponse } from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

const DEFAULT_TIMEOUT = 60000;

let accessToken: string | null = null;
let refreshTokenValue: string | null = null;
let isRefreshing = false;
let pendingRequests: Array<{
  resolve: (token: string) => void;
  reject: (err: Error) => void;
}> = [];

export function getAccessToken(): string | null {
  return accessToken;
}

export function setTokens(access: string, refresh: string): void {
  accessToken = access;
  refreshTokenValue = refresh;
  localStorage.setItem("refreshToken", refresh);
}

export function clearTokens(): void {
  accessToken = null;
  refreshTokenValue = null;
  localStorage.removeItem("refreshToken");
}

export function loadStoredTokens(): void {
  const stored = localStorage.getItem("refreshToken");
  if (stored) {
    refreshTokenValue = stored;
  }
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function refreshAccessToken(): Promise<string> {
  if (!refreshTokenValue) {
    throw new ApiError("No refresh token available", 401);
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: refreshTokenValue }),
  });

  if (!response.ok) {
    clearTokens();
    throw new ApiError("Refresh token expired", 401);
  }

  const data = (await response.json()) as ApiResponse<{
    accessToken: string;
    refreshToken: string;
  }>;

  setTokens(data.data.accessToken, data.data.refreshToken);
  return data.data.accessToken;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  timeout = DEFAULT_TIMEOUT,
): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers,
    });

    if (response.status === 401 && refreshTokenValue && !path.includes("/auth/refresh")) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const newToken = await refreshAccessToken();
          isRefreshing = false;
          pendingRequests.forEach((p) => p.resolve(newToken));
          pendingRequests = [];
          headers["Authorization"] = `Bearer ${newToken}`;
          const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            signal: controller.signal,
            headers,
          });
          const retryData = (await retryResponse.json()) as ApiResponse<T>;
          if (!retryResponse.ok) {
            throw new ApiError(
              retryData.message || `Request failed (${retryResponse.status})`,
              retryResponse.status,
            );
          }
          return retryData;
        } catch (refreshErr) {
          isRefreshing = false;
          pendingRequests.forEach((p) => p.reject(refreshErr as Error));
          pendingRequests = [];
          clearTokens();
          throw refreshErr;
        }
      } else {
        return new Promise((resolve, reject) => {
          pendingRequests.push({
            resolve: async (newToken: string) => {
              headers["Authorization"] = `Bearer ${newToken}`;
              try {
                const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
                  ...options,
                  signal: controller.signal,
                  headers,
                });
                const retryData = (await retryResponse.json()) as ApiResponse<T>;
                if (!retryResponse.ok) {
                  reject(
                    new ApiError(
                      retryData.message || `Request failed (${retryResponse.status})`,
                      retryResponse.status,
                    ),
                  );
                  return;
                }
                resolve(retryData);
              } catch (err) {
                reject(err);
              }
            },
            reject,
          });
        });
      }
    }

    const data = (await response.json()) as ApiResponse<T>;

    if (!response.ok) {
      throw new ApiError(
        data.message || `Request failed (${response.status})`,
        response.status,
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("Request timed out. Please try again.", 408);
    }
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new ApiError(
        "Cannot connect to server. Make sure the backend is running.",
        0,
      );
    }
    throw new ApiError(
      error instanceof Error ? error.message : "An unexpected error occurred",
      500,
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
