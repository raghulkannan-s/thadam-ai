"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import {
  apiFetch,
  setTokens,
  clearTokens,
  loadStoredTokens,
  restoreSession,
  onAuthFailure,
  getAccessToken,
} from "@/lib/api";
import type { User, LoginResponse, RegisterResponse } from "@/lib/types";

export type AuthStatus =
  | "checking"
  | "authenticated"
  | "unauthenticated"
  | "refreshing"
  | "error";

type AuthState = {
  user: User | null;
  isLoading: boolean;
  status: AuthStatus;
  sessionMessage: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  clearSessionMessage: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);
const AUTH_BROADCAST_CHANNEL = "thadam-auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);

  const fetchUser = useCallback(async (): Promise<User | null> => {
    try {
      const res = await apiFetch<User>("/api/auth/me");
      return res.data;
    } catch {
      return null;
    }
  }, []);

  const refresh = useCallback(async () => {
    setStatus((current) => current === "checking" ? "checking" : "refreshing");
    loadStoredTokens();
    try {
      if (!getAccessToken()) {
        await restoreSession({ notifyOnFailure: false });
      }
      const fetched = await fetchUser();
      setUser(fetched);
      setStatus(fetched ? "authenticated" : "unauthenticated");
    } catch {
      setUser(null);
      setStatus("unauthenticated");
    } finally {
    }
  }, [fetchUser]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    onAuthFailure((message) => {
      clearTokens();
      setUser(null);
      setSessionMessage(message);
      setStatus("unauthenticated");
    });
    return () => onAuthFailure(null);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
      return;
    }
    const channel = new BroadcastChannel(AUTH_BROADCAST_CHANNEL);
    channel.onmessage = (event) => {
      if (event.data?.type === "logout" || event.data?.type === "session-expired") {
        clearTokens();
        setUser(null);
        setStatus("unauthenticated");
        if (event.data?.message) {
          setSessionMessage(event.data.message);
        }
      } else if (event.data?.type === "login") {
        refresh();
      }
    };
    return () => channel.close();
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setStatus("checking");
      try {
        const res = await apiFetch<LoginResponse>("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        setTokens(res.data.accessToken, res.data.refreshToken);
        const fetched = await fetchUser();
        setUser(fetched);
        setSessionMessage(null);
        setStatus(fetched ? "authenticated" : "error");
        if (fetched && typeof window !== "undefined" && "BroadcastChannel" in window) {
          const channel = new BroadcastChannel(AUTH_BROADCAST_CHANNEL);
          channel.postMessage({ type: "login" });
          channel.close();
        }
      } catch (error) {
        setStatus("unauthenticated");
        throw error;
      }
    },
    [fetchUser],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setStatus("checking");
      try {
        const res = await apiFetch<RegisterResponse>("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ name, email, password }),
        });
        setTokens(res.data.accessToken, res.data.refreshToken);
        const fetched = await fetchUser();
        setUser(fetched);
        setSessionMessage(null);
        setStatus(fetched ? "authenticated" : "error");
        if (fetched && typeof window !== "undefined" && "BroadcastChannel" in window) {
          const channel = new BroadcastChannel(AUTH_BROADCAST_CHANNEL);
          channel.postMessage({ type: "login" });
          channel.close();
        }
      } catch (error) {
        setStatus("unauthenticated");
        throw error;
      }
    },
    [fetchUser],
  );

  const logout = useCallback(async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {
      /* ignore */
    }
    clearTokens();
    setUser(null);
    setStatus("unauthenticated");
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      const channel = new BroadcastChannel(AUTH_BROADCAST_CHANNEL);
      channel.postMessage({ type: "logout" });
      channel.close();
    }
  }, []);

  const clearSessionMessage = useCallback(() => {
    setSessionMessage(null);
  }, []);

  const isLoading = status === "checking" || status === "refreshing";

  const value = useMemo(
    () => ({
      user,
      isLoading,
      status,
      sessionMessage,
      login,
      register,
      logout,
      refresh,
      clearSessionMessage,
    }),
    [user, isLoading, status, sessionMessage, login, register, logout, refresh, clearSessionMessage],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
