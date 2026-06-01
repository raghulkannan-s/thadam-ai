"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";

/* ── Icons ── */

function LogoIcon() {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: "var(--radius-md)",
        background: "var(--accent-gradient)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    </div>
  );
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/admin", label: "Admin" },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/";
    } catch {
      /* ignore */
    }
  };

  return (
    <nav
      className="glass animate-fade-in-down"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        padding: "0 24px",
        borderBottom: "1px solid var(--border-subtle)",
        borderTop: "none",
        borderLeft: "none",
        borderRight: "none",
        borderRadius: 0,
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
        }}
      >
        {/* Left: Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
          }}
        >
          <LogoIcon />
          <span
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Thadam AI
          </span>
        </Link>

        {/* Center: Nav links (desktop) */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            alignItems: "center",
          }}
          className="hidden md:flex"
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "8px 16px",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.85rem",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive
                    ? "var(--text-primary)"
                    : "var(--text-secondary)",
                  background: isActive ? "var(--surface-2)" : "transparent",
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right: Auth actions (desktop) */}
        <div
          style={{ display: "flex", gap: "8px", alignItems: "center" }}
          className="hidden md:flex"
        >
          {user ? (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 14px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--surface-2)",
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                }}
              >
                <UserIcon />
                <span style={{ fontWeight: 500 }}>
                  {user.displayName || user.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="btn-ghost"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.8rem",
                }}
              >
                <LogOutIcon />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost" style={{ fontSize: "0.85rem" }}>
                Sign in
              </Link>
              <Link
                href="/register"
                className="btn-primary"
                style={{
                  textDecoration: "none",
                  fontSize: "0.8rem",
                  padding: "8px 20px",
                }}
              >
                Get started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="btn-ghost md:hidden"
          style={{ padding: "8px" }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <XIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div
          className="animate-fade-in-down md:hidden"
          style={{
            padding: "8px 0 16px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  padding: "10px 16px",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.9rem",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive
                    ? "var(--text-primary)"
                    : "var(--text-secondary)",
                  background: isActive ? "var(--surface-2)" : "transparent",
                  textDecoration: "none",
                }}
              >
                {link.label}
              </Link>
            );
          })}
          <div style={{ borderTop: "1px solid var(--border-subtle)", marginTop: "4px", paddingTop: "8px" }}>
            {user ? (
              <button
                onClick={handleLogout}
                className="btn-ghost"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "0.9rem",
                  width: "100%",
                  justifyContent: "flex-start",
                }}
              >
                <LogOutIcon />
                Sign out ({user.displayName || user.email})
              </button>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-secondary"
                  style={{
                    textDecoration: "none",
                    fontSize: "0.85rem",
                    flex: 1,
                    textAlign: "center",
                  }}
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary"
                  style={{
                    textDecoration: "none",
                    fontSize: "0.85rem",
                    flex: 1,
                    textAlign: "center",
                  }}
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
