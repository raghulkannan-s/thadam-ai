"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useBalance } from "@/lib/balance-context";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/app/components/Toast";
import { PageLoader } from "@/app/components/LoadingSpinner";
import type { CoinTransaction, PageResponse } from "@/lib/types";
import { useRouter } from "next/navigation";

const typeMeta: Record<string, { color: string; label: string }> = {
  EARNED: { color: "var(--success)", label: "Earned" },
  SPENT: { color: "var(--error)", label: "Spent" },
  REFUND: { color: "var(--info)", label: "Refund" },
  ADMIN_ADJUSTMENT: { color: "var(--warning)", label: "Adjustment" },
};

export default function WalletPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { balance, refreshBalance } = useBalance();
  const { addToast } = useToast();
  const router = useRouter();
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const loadTransactions = useCallback(async (p: number) => {
    try {
      const res = await apiFetch<PageResponse<CoinTransaction>>(`/api/ledger/transactions?page=${p}&size=20&sort=createdAt,desc`);
      setTransactions(res.data.content);
      setTotalPages(res.data.totalPages);
    } catch {
      addToast("Failed to load transactions", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); return; }
    if (user) { loadTransactions(page); refreshBalance(); }
  }, [user, authLoading, router, page, loadTransactions, refreshBalance]);

  if (authLoading) return <PageLoader />;

  return (
    <div style={{ padding: "32px 40px 80px", maxWidth: 800, margin: "0 auto" }}>
      <div className="animate-fade-in-up">
        <p className="badge badge-accent" style={{ marginBottom: "16px" }}>Wallet</p>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>Your Coins</h1>
        <p style={{ marginTop: "8px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Track your earnings, spending, and transaction history.</p>
      </div>

      <div className="panel animate-fade-in-up delay-100" style={{ borderRadius: "var(--radius-2xl)", padding: "32px", marginTop: "24px", textAlign: "center", borderColor: "var(--border-accent)" }}>
        <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--text-tertiary)", marginBottom: "8px" }}>Available Balance</p>
        <p style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--accent-primary)", lineHeight: 1, letterSpacing: "-0.03em" }}>{balance}</p>
        <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "8px" }}>coins</p>
      </div>

      <div style={{ marginTop: "32px" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>Transaction History</h2>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton" style={{ height: 56, borderRadius: "var(--radius-lg)" }} />)}
          </div>
        ) : transactions.length === 0 ? (
          <div className="panel" style={{ borderRadius: "var(--radius-xl)", padding: "40px", textAlign: "center" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" style={{ margin: "0 auto" }}>
              <rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="16" cy="12" r="2" /><path d="M6 6V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
            </svg>
            <p style={{ marginTop: "16px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>No transactions yet.</p>
            <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginTop: "4px" }}>Complete roadmaps and milestones to earn coins.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {transactions.map((t) => {
              const meta = typeMeta[t.transactionType] || { color: "var(--text-tertiary)", label: t.transactionType };
              const isCredit = t.amount > 0;
              return (
                <div key={t.id} className="animate-fade-in" style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px 16px", borderRadius: "var(--radius-lg)",
                  background: "var(--surface-1)", border: "1px solid var(--border-subtle)",
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: "var(--radius-md)", background: `${meta.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={meta.color} strokeWidth="2.5" strokeLinecap="round">
                      {isCredit ? <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></> : <><line x1="5" y1="12" x2="19" y2="12" /></>}
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)" }}>{t.description || meta.label}</span>
                      <span className="badge badge-neutral" style={{ fontSize: "0.6rem", padding: "1px 6px" }}>{meta.label}</span>
                    </div>
                    <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", marginTop: "2px" }}>
                      {new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      {t.referenceType ? ` · ${t.referenceType}` : ""}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: "0.9rem", fontWeight: 700, color: isCredit ? "var(--success)" : "var(--error)" }}>
                      {isCredit ? "+" : ""}{t.amount}
                    </p>
                    <p style={{ fontSize: "0.65rem", color: "var(--text-tertiary)" }}>Balance: {t.balanceAfter}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "20px" }}>
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="btn btn-ghost btn-sm">Previous</button>
            <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", padding: "6px 12px" }}>Page {page + 1} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="btn btn-ghost btn-sm">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
