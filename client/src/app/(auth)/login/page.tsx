"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/context/auth-context";
import { toast } from "sonner";
import { Spinner } from "@/shared/ui/LoadingSpinner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sanitizeRedirectPath } from "@/features/auth/context/auth-redirect";
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/shared/ui/Button";

const GOOGLE_OAUTH_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/oauth2/authorization/google`;

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="mr-2">
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
  const [oauthLoading, setOauthLoading] = useState(false);

  const { login, user, isLoading, sessionMessage, clearSessionMessage } = useAuth();

  const router = useRouter();

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
    clearSessionMessage();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back! Redirecting");
      router.push(getRedirectTarget());
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      toast.error(message);
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
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      {/* Left Panel - Visuals */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[var(--bg-surface)] overflow-hidden items-center justify-center border-r border-[var(--border-subtle)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/10 via-[var(--bg-surface)] to-[var(--bg-elevated)]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
        
        {/* Decorative elements */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[var(--accent-primary)]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-lg p-12 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--accent-primary)] text-white shadow-xl shadow-[var(--accent-primary)]/30 mb-8">
            <Sparkles className="h-8 w-8" />
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)] mb-6 leading-tight">
            Resume your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-primary)] to-purple-500">learning journey</span>
          </h2>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
            Welcome back to Thadam AI. Pick up right where you left off and keep your momentum going with personalized AI roadmaps.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 sm:p-12 relative z-10 bg-[var(--bg-base)]">
        <div className="w-full max-w-md animate-slide-up">
          <div className="text-center mb-10 lg:text-left">
            <h1 className="text-3xl font-black tracking-tight text-[var(--text-primary)] mb-3">
              Welcome back
            </h1>
            <p className="text-[var(--text-secondary)] font-medium">
              Enter your details to sign in to your account
            </p>
          </div>

          {(sessionMessage || error) && (
            <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-600 flex items-start gap-3 animate-shake">
              <div className="mt-0.5">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium">{sessionMessage || error}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--text-primary)]" htmlFor="login-email">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[var(--text-tertiary)] group-focus-within:text-[var(--accent-primary)] transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)] transition-all outline-none font-medium placeholder-[var(--text-tertiary)] shadow-sm"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-[var(--text-primary)]" htmlFor="login-password">Password</label>
                <Link href="#" className="text-sm font-semibold text-[var(--accent-primary)] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-[var(--text-tertiary)] group-focus-within:text-[var(--accent-primary)] transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xl py-3.5 pl-12 pr-12 focus:ring-2 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)] transition-all outline-none font-medium placeholder-[var(--text-tertiary)] shadow-sm"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-14 text-base font-bold mt-2 shadow-lg shadow-[var(--accent-primary)]/20 hover:shadow-[var(--accent-primary)]/30 group"
              disabled={loading}
            >
              {loading ? (
                <><Spinner size={20} className="mr-3" /> Signing in...</>
              ) : (
                <>Sign In <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" /></>
              )}
            </Button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-subtle)]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[var(--bg-base)] text-[var(--text-tertiary)] font-medium">Or continue with</span>
            </div>
          </div>

          <div className="mt-8">
            <Button
              onClick={handleOAuth}
              disabled={oauthLoading}
              variant="outline"
              className="w-full h-14 text-base font-bold border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] hover:border-[var(--text-tertiary)] text-[var(--text-primary)] transition-all"
            >
              {oauthLoading ? <Spinner size={20} className="mr-2" /> : <GoogleIcon />}
              Google
            </Button>
          </div>

          <p className="mt-10 text-center text-[var(--text-secondary)] font-medium">
            Don&apos;t have an account?{" "}
            <Link href={`/register?redirect=${encodeURIComponent(getRedirectTarget())}`} className="text-[var(--accent-primary)] font-bold hover:underline transition-colors">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
