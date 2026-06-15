"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/app/components/Toast";
import { Spinner } from "@/app/components/LoadingSpinner";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

const GOOGLE_OAUTH_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/oauth2/authorization/google`;

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
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
      addToast("Welcome back! Redirecting\u2026", "success");
      router.push("/community");
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

        {error && (
          <div
            className="animate-shake"
            style={{
              marginTop: "20px",
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              background: "var(--error-bg)",
              border: "1px solid rgba(248, 113, 113, 0.25)",
              color: "var(--error)",
              fontSize: "0.82rem",
            }}
          >
            {error}
          </div>
        )}

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
                placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
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
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "0.9rem",
            }}
          >
            {loading ? (
              <>
                <Spinner size={16} />
                Signing in\u2026
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginTop: "24px",
        }}>
          <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
          <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", fontWeight: 500 }}>
            or
          </span>
          <div style={{ flex: 1, height: "1px", background: "var(--border-subtle)" }} />
        </div>

        <a
          href={GOOGLE_OAUTH_URL}
          className="btn btn-secondary"
          style={{
            width: "100%",
            marginTop: "16px",
            padding: "12px",
            fontSize: "0.85rem",
            textDecoration: "none",
          }}
        >
          <GoogleIcon />
          Continue with Google
        </a>

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
              color: "var(--accent-secondary)",
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