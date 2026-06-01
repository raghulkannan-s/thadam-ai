"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/app/components/Toast";
import { Spinner } from "@/app/components/LoadingSpinner";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ── Icons ── */

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      addToast("Welcome back! Redirecting…", "success");
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <div
        className="panel animate-scale-in"
        style={{
          width: "100%",
          maxWidth: "420px",
          borderRadius: "var(--radius-2xl)",
          padding: "40px 32px",
        }}
      >
        {/* Header */}
        <div className="badge badge-accent" style={{ marginBottom: "20px" }}>
          Welcome back
        </div>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          Sign in to your account
        </h1>
        <p
          style={{
            marginTop: "8px",
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
          }}
        >
          Pick up where you left off and keep your momentum going.
        </p>

        {/* Error */}
        {error && (
          <div
            className="animate-shake"
            style={{
              marginTop: "20px",
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              background: "var(--error-glow)",
              border: "1px solid rgba(248, 113, 113, 0.25)",
              color: "var(--error)",
              fontSize: "0.82rem",
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} style={{ marginTop: "28px" }}>
          <div style={{ marginBottom: "20px" }}>
            <label className="label" htmlFor="login-email">Email</label>
            <div style={{ position: "relative" }}>
              <div style={{
                position: "absolute", left: "14px", top: "50%",
                transform: "translateY(-50%)", pointerEvents: "none",
              }}>
                <MailIcon />
              </div>
              <input
                id="login-email"
                type="email"
                className="input"
                style={{ paddingLeft: "40px" }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div style={{ marginBottom: "28px" }}>
            <label className="label" htmlFor="login-password">Password</label>
            <div style={{ position: "relative" }}>
              <div style={{
                position: "absolute", left: "14px", top: "50%",
                transform: "translateY(-50%)", pointerEvents: "none",
              }}>
                <LockIcon />
              </div>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                className="input"
                style={{ paddingLeft: "40px", paddingRight: "44px" }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: "absolute", right: "12px", top: "50%",
                  transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--text-tertiary)", padding: "4px",
                }}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            {loading ? (
              <>
                <Spinner size={16} />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        {/* Footer */}
        <p
          style={{
            marginTop: "28px",
            textAlign: "center",
            fontSize: "0.82rem",
            color: "var(--text-secondary)",
          }}
        >
          New here?{" "}
          <Link
            href="/register"
            style={{
              color: "var(--accent-tertiary)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
