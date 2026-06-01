export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const DEFAULT_TIMEOUT = 60000; // 60s for AI calls

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  timeout = DEFAULT_TIMEOUT,
): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      credentials: "include",
    });

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
