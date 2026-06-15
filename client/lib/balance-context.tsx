"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { apiFetch } from "@/lib/api";
import type { BalanceResponse } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

type BalanceState = {
  balance: number;
  loading: boolean;
  refreshBalance: () => Promise<void>;
};

const BalanceContext = createContext<BalanceState | undefined>(undefined);

export function BalanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!user) { setBalance(0); return; }
    setLoading(true);
    try {
      const res = await apiFetch<BalanceResponse>("/api/ledger/balance");
      setBalance(res.data.balance);
    } catch {
      setBalance(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchBalance(); }, [fetchBalance]);

  const value = useMemo(() => ({ balance, loading, refreshBalance: fetchBalance }), [balance, loading, fetchBalance]);

  return <BalanceContext.Provider value={value}>{children}</BalanceContext.Provider>;
}

export function useBalance(): BalanceState {
  const context = useContext(BalanceContext);
  if (!context) throw new Error("useBalance must be used within a BalanceProvider");
  return context;
}
