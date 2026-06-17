"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/context/auth-context";
import { useTheme } from "@/lib/theme-context";
import { useBalance } from "@/features/ledger/context/balance-context";
import { useState, useCallback, useEffect, useRef } from "react";

const SIDEBAR_EXPANDED = 240;
const SIDEBAR_COLLAPSED = 64;

const navLinks = [
  { href: "/community", label: "Community", icon: "globe" },
  { href: "/dashboard", label: "Dashboard", icon: "grid" },
  { href: "/people", label: "People", icon: "users" },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { balance } = useBalance();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  useEffect(() => {
    document.documentElement.style.setProperty("--sidebar-width", `${sidebarWidth}px`);
  }, [sidebarWidth]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (mobileOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen]);

  const handleLogout = useCallback(async () => {
    try { await logout(); window.location.href = "/"; } catch { }
  }, [logout]);

  const sidebarContent = (
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh",
      padding: collapsed ? "16px 0" : "20px 14px",
      overflow: "hidden",
      transition: "padding 0.3s var(--ease-out-expo)",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between",
        marginBottom: "28px", padding: collapsed ? "0" : "0 6px",
        minHeight: 30,
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <div style={{ width: 30, height: 30, borderRadius: "var(--radius-md)", background: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-inverse)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          {!collapsed && <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em", whiteSpace: "nowrap" }}>Thadam</span>}
        </Link>
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} className="btn-icon" aria-label="Collapse sidebar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
        )}
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
        {navLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
          return (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
              style={{
                display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start",
                gap: "10px", padding: collapsed ? "10px" : "9px 10px",
                borderRadius: "var(--radius-md)", fontSize: "0.85rem",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "var(--accent-secondary)" : "var(--text-secondary)",
                textDecoration: "none", transition: "all 0.15s", whiteSpace: "nowrap",
                background: isActive ? "var(--accent-muted)" : "transparent", border: "none",
              }}
              title={collapsed ? link.label : undefined}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                {link.icon === "grid" ? (<><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></>) : link.icon === "globe" ? (<><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>) : (<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>)}
              </svg>
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
        {user?.role === "ADMIN" && (
          <Link href="/admin" onClick={() => setMobileOpen(false)}
            style={{
              display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start",
              gap: "10px", padding: collapsed ? "10px" : "9px 10px",
              borderRadius: "var(--radius-md)", fontSize: "0.85rem",
              fontWeight: pathname === "/admin" ? 600 : 500,
              color: pathname === "/admin" ? "var(--accent-secondary)" : "var(--text-secondary)",
              textDecoration: "none", transition: "all 0.15s", whiteSpace: "nowrap",
              background: pathname === "/admin" ? "var(--accent-muted)" : "transparent",
            }}
            title={collapsed ? "Admin" : undefined}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            {!collapsed && <span>Admin</span>}
          </Link>
        )}
      </nav>

      {user && !collapsed && (
        <div style={{ padding: "10px 10px", marginBottom: "4px" }}>
          <Link href="/wallet"
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "8px 10px", borderRadius: "var(--radius-md)",
              fontSize: "0.8rem", fontWeight: 500, color: "var(--text-secondary)",
              textDecoration: "none", transition: "all 0.15s",
              background: "var(--surface-1)", border: "1px solid var(--border-subtle)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="16" cy="12" r="2" /><path d="M6 6V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
            </svg>
            <span style={{ flex: 1 }}>Wallet</span>
            <span style={{ fontWeight: 700, color: "var(--accent-secondary)", fontSize: "0.85rem" }}>{balance}</span>
          </Link>
        </div>
      )}

      <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "8px", marginTop: "4px" }}>
        <button onClick={toggleTheme}
          className="btn-ghost"
          style={{
            display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start",
            gap: "10px", padding: collapsed ? "10px" : "9px 10px",
            borderRadius: "var(--radius-md)", fontSize: "0.8rem",
            color: "var(--text-tertiary)", width: "100%",
          }}
          title={collapsed ? (theme === "dark" ? "Light mode" : "Dark mode") : undefined}
        >
          {theme === "dark" ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
          )}
          {!collapsed && <span>{theme === "dark" ? "Light" : "Dark"}</span>}
        </button>
      </div>

      {user ? (
        <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "8px", marginTop: "4px" }}>
          {!collapsed && (
            <Link href="/profile"
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "8px 10px", textDecoration: "none",
                borderRadius: "var(--radius-md)", transition: "background 0.15s",
              }}
            >
              <div style={{
                width: 30, height: 30, borderRadius: "var(--radius-full)",
                background: "var(--accent-primary)", display: "flex", alignItems: "center",
                justifyContent: "center", fontWeight: 700, fontSize: "0.8rem",
                color: "var(--text-inverse)", flexShrink: 0,
              }}>
                {(user.name || user.email).charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.name || user.email}
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--text-tertiary)" }}>{user.email}</div>
              </div>
            </Link>
          )}
          <button onClick={handleLogout}
            className="btn-ghost"
            style={{
              display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start",
              gap: "8px", fontSize: "0.8rem", padding: collapsed ? "10px" : "8px 10px",
              borderRadius: "var(--radius-md)", color: "var(--text-tertiary)", width: "100%",
            }}
            title={collapsed ? "Sign out" : undefined}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
            {!collapsed && "Sign out"}
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Link href="/login" onClick={() => setMobileOpen(false)}
            className="btn-ghost"
            style={{
              textDecoration: "none", fontSize: "0.85rem", textAlign: collapsed ? "center" : "left",
              display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start",
              gap: "8px", padding: collapsed ? "10px" : "8px 10px",
            }}
            title={collapsed ? "Sign in" : undefined}
          >
            {collapsed ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
            ) : "Sign in"}
          </Link>
          {!collapsed && <Link href="/register" onClick={() => setMobileOpen(false)} className="btn btn-primary btn-pill btn-sm" style={{ textDecoration: "none", textAlign: "center", display: "block" }}>Get started</Link>}
        </div>
      )}

      {collapsed && (
        <button onClick={() => setCollapsed(false)} className="btn-icon"
          style={{ padding: "10px", marginTop: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}
          aria-label="Expand sidebar"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      )}
    </div>
  );

  return (
    <>
      <aside ref={sidebarRef} className="glass" style={{
        position: "fixed", top: 0, left: 0, width: sidebarWidth, height: "100vh",
        zIndex: 100, borderRight: "1px solid var(--border-subtle)",
        borderTop: "none", borderLeft: "none", borderBottom: "none",
        borderRadius: 0, transition: "width 0.3s var(--ease-out-expo)", overflow: "hidden",
      }}>
        {sidebarContent}
      </aside>

      <button onClick={() => setMobileOpen((v) => !v)} className="btn-icon" style={{
        position: "fixed", top: "12px", left: "12px", zIndex: 200, padding: "8px",
        background: "var(--surface-2)", border: "1px solid var(--border-subtle)", display: "none",
      }} data-mobile-toggle aria-label="Toggle menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {mobileOpen ? (<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>) : (<><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>)}
        </svg>
      </button>

      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 150, display: "flex" }}>
          <div style={{ flex: 1, background: "rgba(0,0,0,0.5)" }} onClick={() => setMobileOpen(false)} />
          <aside className="glass animate-slide-in-left" style={{ width: SIDEBAR_EXPANDED, height: "100vh", borderRight: "1px solid var(--border-subtle)", borderRadius: 0, overflow: "hidden" }}>
            {sidebarContent}
          </aside>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          aside:first-of-type { display: none; }
          [data-mobile-toggle] { display: flex !important; }
          main { margin-left: 0 !important; }
        }
      `}</style>
    </>
  );
}
