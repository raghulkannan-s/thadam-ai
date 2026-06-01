"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/app/components/Toast";
import { Spinner } from "@/app/components/LoadingSpinner";
import Link from "next/link";
import { useRouter } from "next/navigation";

/* ── Icons ── */

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

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

/* ── Password strength ── */

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score: 20, label: "Weak", color: "var(--error)" };
  if (score === 2) return { score: 40, label: "Fair", color: "var(--warning)" };
  if (score === 3) return { score: 60, label: "Good", color: "var(--info)" };
  if (score === 4) return { score: 80, label: "Strong", color: "var(--success)" };
  return { score: 100, label: "Excellent", color: "var(--success)" };
}

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await register(email, password, displayName);
      addToast("Account created! Welcome aboard 🎉", "success");
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
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
          Get started
        </div>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          Create your Thadam AI space
        </h1>
        <p
          style={{
            marginTop: "8px",
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
          }}
        >
          Generate AI roadmaps, build checklists, and track your learning.
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
          {/* Display name */}
          <div style={{ marginBottom: "20px" }}>
            <label className="label" htmlFor="register-name">Display name</label>
            <div style={{ position: "relative" }}>
              <div style={{
                position: "absolute", left: "14px", top: "50%",
                transform: "translateY(-50%)", pointerEvents: "none",
              }}>
                <UserIcon />
              </div>
              <input
                id="register-name"
                type="text"
                className="input"
                style={{ paddingLeft: "40px" }}
                placeholder="Raghul"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: "20px" }}>
            <label className="label" htmlFor="register-email">Email</label>
            <div style={{ position: "relative" }}>
              <div style={{
                position: "absolute", left: "14px", top: "50%",
                transform: "translateY(-50%)", pointerEvents: "none",
              }}>
                <MailIcon />
              </div>
              <input
                id="register-email"
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

          {/* Password */}
          <div style={{ marginBottom: "8px" }}>
            <label className="label" htmlFor="register-password">Password</label>
            <div style={{ position: "relative" }}>
              <div style={{
                position: "absolute", left: "14px", top: "50%",
                transform: "translateY(-50%)", pointerEvents: "none",
              }}>
                <LockIcon />
              </div>
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                className="input"
                style={{ paddingLeft: "40px", paddingRight: "44px" }}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
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

          {/* Password strength meter */}
          {password.length > 0 && (
            <div className="animate-fade-in" style={{ marginBottom: "24px" }}>
              <div
                style={{
                  height: "4px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--surface-2)",
                  overflow: "hidden",
                  marginBottom: "6px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${strength.score}%`,
                    background: strength.color,
                    borderRadius: "var(--radius-full)",
                    transition: "width 0.4s var(--ease-out-expo), background 0.4s",
                  }}
                />
              </div>
              <p style={{ fontSize: "0.72rem", color: strength.color, fontWeight: 600 }}>
                {strength.label}
              </p>
            </div>
          )}

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
              marginTop: password.length === 0 ? "20px" : "0",
            }}
          >
            {loading ? (
              <>
                <Spinner size={16} />
                Creating account…
              </>
            ) : (
              "Create account"
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
          Already have an account?{" "}
          <Link
            href="/login"
            style={{
              color: "var(--accent-tertiary)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
