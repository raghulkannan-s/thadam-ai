import apiClient from '@/core/api/client';
import { 
  getAccessToken as getCoreAccessToken, 
  setAccessToken, 
  clearTokens as clearCoreTokens 
} from '@/core/api/tokenManager';

let authFailureCallback: ((message: string) => void) | null = null;

export const onAuthFailure = (cb: ((message: string) => void) | null) => {
  authFailureCallback = cb;
};

// Expose the core functions
export const getAccessToken = getCoreAccessToken;

export const setTokens = (accessToken: string, refreshToken?: string) => {
  setAccessToken(accessToken);
  if (typeof window !== 'undefined') {
    localStorage.setItem('thadam_access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('thadam_refresh_token', refreshToken);
    }
  }
};

export const clearTokens = () => {
  clearCoreTokens();
  if (typeof window !== 'undefined') {
    localStorage.removeItem('thadam_access_token');
    localStorage.removeItem('thadam_refresh_token');
  }
};

export const loadStoredTokens = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('thadam_access_token');
    if (token) {
      setAccessToken(token);
    }
  }
};

export const restoreSession = async (options?: { notifyOnFailure?: boolean }) => {
  // If the interceptor handles token refresh, we might not need to manually call it here,
  // but to satisfy the auth-context flow, we'll try to trigger a refresh check.
  try {
    const res = await apiClient.post('/api/auth/refresh');
    const { accessToken } = res.data.data || res.data;
    if (accessToken) {
      setTokens(accessToken);
    }
  } catch (error) {
    if (options?.notifyOnFailure !== false && authFailureCallback) {
      authFailureCallback('Session expired');
    }
    throw error;
  }
};

export interface FetchOptions {
  method?: string;
  body?: string | Record<string, unknown>;
  headers?: Record<string, string>;
}

// Generic apiFetch wrapper that uses our Axios apiClient
export const apiFetch = async <T>(url: string, options: FetchOptions = {}): Promise<{ data: T }> => {
  try {
    const method = options.method?.toLowerCase() || 'get';
    let data = undefined;

    if (options.body) {
      data = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
    }

    const response = await apiClient.request({
      url,
      method,
      data,
      headers: options.headers,
    });

    // The legacy apiFetch expected { data: T } to be returned.
    // If the backend wraps the response in a standardized DTO (like ApiResponse),
    // response.data will have { success, message, data }.
    // We return { data: response.data.data || response.data } to bridge the gap.
    return {
      data: response.data?.data !== undefined ? response.data.data : response.data,
    };
  } catch (error: unknown) {
    throw error;
  }
};
