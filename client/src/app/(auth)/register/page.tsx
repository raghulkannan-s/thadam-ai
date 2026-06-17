"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/features/auth/context/auth-context";
import { useToast } from "@/components/ui/Toast";
import { Spinner } from "@/components/ui/LoadingSpinner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sanitizeRedirectPath } from "@/features/auth/context/auth-redirect";

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

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

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

function getPasswordIssue(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Add at least one uppercase letter.";
  if (!/[0-9]/.test(password)) return "Add at least one number.";
  return null;
}

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState(false);

  const { register, user, isLoading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const getRedirectTarget = () => {
    if (typeof window === "undefined") return "/community";
    return sanitizeRedirectPath(new URLSearchParams(window.location.search).get("redirect"));
  };

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(getRedirectTarget());
    }
  }, [isLoading, router, user]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const passwordIssue = getPasswordIssue(password);
    if (passwordIssue) {
      setError(passwordIssue);
      return;
    }

    setLoading(true);
    try {
      await register(displayName, email, password);
      addToast("Account created! Welcome aboard", "success");
      router.push(getRedirectTarget());
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("oauthRedirect", getRedirectTarget());
    }
    setOauthLoading(true);
    window.location.href = GOOGLE_OAUTH_URL;
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="panel w-full max-w-md rounded-2xl p-8 sm:p-10 animate-scale-in">
        <div className="mb-2">
          <div className="badge badge-accent mb-4">Get started</div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight mb-1.5" style={{ color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
          Create your Thadam AI space
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
          Generate AI roadmaps, build checklists, and track your learning.
        </p>

        {error && (
          <div role="alert" aria-live="polite" className="animate-shake mb-5 rounded-lg border p-3.5 text-sm" style={{
            background: "var(--error-bg)",
            borderColor: "rgba(248, 113, 113, 0.25)",
            color: "var(--error)",
          }}>
            {error}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="label" htmlFor="register-name">Display name</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"><UserIcon /></span>
              <input
                id="register-name"
                type="text"
                className="input"
                style={{ paddingLeft: "2.5rem" }}
                placeholder="Raghul"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="label" htmlFor="register-email">Email</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"><MailIcon /></span>
              <input
                id="register-email"
                type="email"
                className="input"
                style={{ paddingLeft: "2.5rem" }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="mb-2">
            <label className="label" htmlFor="register-password">Password</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"><LockIcon /></span>
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                className="input"
                style={{ paddingLeft: "2.5rem", paddingRight: "2.75rem" }}
                placeholder="8+ chars, uppercase, number"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)" }}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {password.length > 0 && (
            <div className="animate-fade-in mb-5">
              <div className="h-1 rounded-full overflow-hidden mb-1.5" style={{ background: "var(--surface-2)" }}>
                <div className="h-full rounded-full transition-all duration-500" style={{
                  width: `${strength.score}%`,
                  background: strength.color,
                }} />
              </div>
              <p className="text-xs font-semibold" style={{ color: strength.color }}>{strength.label}</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                Use 8+ characters with an uppercase letter and a number.
              </p>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full py-3 text-sm"
            disabled={loading}
            style={{ marginTop: password.length === 0 ? "1.25rem" : "0" }}
          >
            {loading ? (
              <><Spinner size={16} /> Creating account</>
            ) : "Create account"}
          </button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px" style={{ background: "var(--border-subtle)" }} />
          <span className="text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>or</span>
          <div className="flex-1 h-px" style={{ background: "var(--border-subtle)" }} />
        </div>

        <button
          onClick={handleOAuth}
          disabled={oauthLoading}
          className="btn btn-secondary w-full py-3 text-sm"
        >
          {oauthLoading ? (
            <Spinner size={16} />
          ) : (
            <GoogleIcon />
          )}
          Sign up with Google
        </button>

        <p className="mt-7 text-center text-sm" style={{ color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link href={`/login?redirect=${encodeURIComponent(getRedirectTarget())}`} className="font-semibold no-underline" style={{ color: "var(--accent-secondary)" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
