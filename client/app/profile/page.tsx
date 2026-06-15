"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useBalance } from "@/lib/balance-context";
import Link from "next/link";
import { PageLoader } from "@/app/components/LoadingSpinner";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { balance } = useBalance();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) { router.push("/login"); }
  }, [user, authLoading, router]);

  if (authLoading) return <PageLoader />;
  if (!user) return null;

  return (
    <div style={{ padding: "32px 40px 80px", maxWidth: 700, margin: "0 auto" }}>
      <div className="animate-fade-in-up">
        <p className="badge badge-accent" style={{ marginBottom: "16px" }}>Profile</p>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>Your Account</h1>
      </div>

      <div className="panel animate-fade-in-up delay-100" style={{ borderRadius: "var(--radius-2xl)", padding: "32px", marginTop: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{
            width: 56, height: 56, borderRadius: "var(--radius-full)",
            background: "var(--accent-primary)", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: "1.3rem", color: "var(--text-inverse)",
            flexShrink: 0,
          }}>
            {(user.name || user.email).charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>{user.name}</h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>{user.email}</p>
            <span className="badge badge-accent" style={{ marginTop: "6px", display: "inline-block" }}>{user.role}</span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px" }}>
        <Link href="/wallet" className="panel" style={{
          borderRadius: "var(--radius-xl)", padding: "20px 24px",
          textDecoration: "none", display: "flex", alignItems: "center", gap: "14px",
        }}>
          <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "var(--accent-muted)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="2" strokeLinecap="round"><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="16" cy="12" r="2" /><path d="M6 6V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" /></svg>
          </div>
          <div>
            <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)" }}>Coin Balance</p>
            <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>{balance} coins</p>
          </div>
        </Link>

        <Link href="/dashboard" className="panel" style={{
          borderRadius: "var(--radius-xl)", padding: "20px 24px",
          textDecoration: "none", display: "flex", alignItems: "center", gap: "14px",
        }}>
          <div style={{ width: 40, height: 40, borderRadius: "var(--radius-md)", background: "var(--accent-muted)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></svg>
          </div>
          <div>
            <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)" }}>Dashboard</p>
            <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>My Roadmaps</p>
          </div>
        </Link>
      </div>

      <div className="panel animate-fade-in-up delay-200" style={{ borderRadius: "var(--radius-xl)", padding: "24px", marginTop: "24px" }}>
        <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>Account Details</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            { label: "User ID", value: `#${user.id}` },
            { label: "Name", value: user.name },
            { label: "Email", value: user.email },
            { label: "Role", value: user.role },
          ].map((item) => (
            <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border-subtle)", fontSize: "0.85rem" }}>
              <span style={{ color: "var(--text-secondary)" }}>{item.label}</span>
              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
