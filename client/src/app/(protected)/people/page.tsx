"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/features/auth/context/auth-context";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import type { PublicUser } from "@/lib/types";

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function RoadmapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default function PeoplePage() {
  const { user } = useAuth();

  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      const res = await apiFetch<PublicUser[]>("/api/user/public");
      setUsers(res.data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadUsers();
    }
  }, [user, loadUsers]);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ padding: "32px 40px", maxWidth: 900, margin: "0 auto" }}>
        <div className="skeleton" style={{ height: 14, width: 60, marginBottom: 16, borderRadius: "var(--radius-full)" }} />
        <div className="skeleton" style={{ height: 28, width: 200, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 14, width: "50%", marginBottom: 24 }} />
        <div className="skeleton" style={{ height: 44, width: "100%", marginBottom: 24, borderRadius: "var(--radius-lg)" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: 140, borderRadius: "var(--radius-xl)" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 40px", maxWidth: 900, margin: "0 auto" }}>
      <div className="badge badge-accent" style={{ marginBottom: "16px" }}>
        <UsersIcon />
        &nbsp;People
      </div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
        Community Members
      </h1>
      <p style={{ marginTop: "8px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
        Connect with other learners and see what they are building.
      </p>

      <div style={{ position: "relative", marginTop: "24px", marginBottom: "24px" }}>
        <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--text-tertiary)" }}>
          <SearchIcon />
        </div>
        <input
          className="input"
          style={{ paddingLeft: "40px" }}
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="panel" style={{ padding: "40px", textAlign: "center", borderRadius: "var(--radius-2xl)" }}>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>No users found.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
          {filtered.map((u, i) => (
            <Link
              href={`/creators/${u.id}`}
              key={u.id}
              className="panel animate-fade-in-up block no-underline hover:ring-2 hover:ring-[var(--accent-primary)]/50 transition-all cursor-pointer"
              style={{
                padding: "20px",
                borderRadius: "var(--radius-xl)",
                animationDelay: `${i * 50}ms`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "var(--radius-full)",
                    background: "var(--accent-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    color: "var(--text-inverse)",
                    flexShrink: 0,
                  }}
                >
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>
                    {u.name}
                  </div>
                  {u.role && (
                    <span className="badge" style={{
                      fontSize: "0.65rem",
                      background: u.role === "ADMIN" ? "rgba(245,158,11,0.15)" : u.role === "CREATOR" ? "rgba(56,189,248,0.15)" : "var(--bg-elevated)",
                      color: u.role === "ADMIN" ? "var(--accent-secondary)" : u.role === "CREATOR" ? "var(--info)" : "var(--text-secondary)",
                      border: `1px solid ${u.role === "ADMIN" ? "rgba(245,158,11,0.2)" : u.role === "CREATOR" ? "rgba(56,189,248,0.2)" : "var(--border-subtle)"}`,
                      marginTop: "4px",
                    }}>
                      {u.role === 'USER' ? 'LEARNER' : u.role}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "0.82rem", color: "var(--text-tertiary)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <MailIcon />
                  {u.email}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <RoadmapIcon />
                  {u.roadmapCount} roadmaps
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
