"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/features/auth/context/auth-context";
import { toast } from "sonner";
import { Spinner } from "@/shared/ui/LoadingSpinner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sanitizeRedirectPath } from "@/features/auth/context/auth-redirect";
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { motion, AnimatePresence } from "framer-motion";

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

export function SlidingAuth({ defaultMode }: { defaultMode: "login" | "register" }) {
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [isDesktop, setIsDesktop] = useState(true);
  
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState(false);

  const { login, register, user, isLoading, sessionMessage, clearSessionMessage } = useAuth();
  const router = useRouter();
  
  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const [redirectTarget, setRedirectTarget] = useState("/community");

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRedirectTarget(sanitizeRedirectPath(new URLSearchParams(window.location.search).get("redirect")));
    }
  }, []);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(redirectTarget);
    }
  }, [isLoading, router, user, redirectTarget]);

  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    setError(null);
    clearSessionMessage();
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    if (typeof window !== "undefined") {
      window.history.pushState(null, '', `/${newMode}${window.location.search}`);
    }
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (mode === "register") {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      const passwordIssue = getPasswordIssue(password);
      if (passwordIssue) {
        setError(passwordIssue);
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
        toast.success("Welcome back! Redirecting");
      } else {
        await register(displayName, email, password);
        toast.success("Account created! Welcome aboard");
      }
      router.push(redirectTarget);
    } catch (err) {
      const message = err instanceof Error ? err.message : `${mode === "login" ? "Login" : "Registration"} failed`;
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("oauthRedirect", redirectTarget);
    }
    setOauthLoading(true);
    window.location.href = GOOGLE_OAUTH_URL;
  };

  // Animation variants
  const formVariants = {
    login: { x: isDesktop ? "100%" : "0%", opacity: 1 },
    register: { x: "0%", opacity: 1 }
  };

  const visualVariants = {
    login: { x: "0%", opacity: 1 },
    register: { x: "100%", opacity: 1 }
  };

  const fadeVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="relative flex min-h-screen bg-[var(--bg-base)] overflow-hidden items-center justify-center p-4 sm:p-8">
      
      {/* Back to Home Button (Global) */}
      <Link href="/" className="absolute top-6 left-6 z-50 flex items-center text-sm font-semibold text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors bg-[var(--bg-base)]/80 backdrop-blur-md px-3 py-1.5 rounded-full">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Home
      </Link>

      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[var(--bg-base)]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[var(--accent-primary)]/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* --- CENTERED GLASSMORPHIC CONTAINER --- */}
      <div className="relative z-10 w-full max-w-[1000px] min-h-[600px] lg:h-[650px] bg-white/5 dark:bg-black/20 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-[2rem] shadow-2xl flex flex-col lg:flex-row overflow-hidden">
        
        {/* LEFT HALF (Visible during Login mode, Form is on the Right) */}
        <div className={`hidden lg:flex flex-col w-1/2 h-full items-center justify-center p-12 text-center relative z-0 transition-all duration-500 ${mode === "login" ? "opacity-100" : "opacity-0 scale-95 pointer-events-none"}`}>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-lg mb-6 border border-[var(--border-subtle)]">
            <span className="text-2xl font-black text-[var(--accent-primary)]">T</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] mb-4 leading-tight">
            New to <span className="text-[var(--accent-primary)]">Thadam AI?</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-sm mb-8 leading-relaxed max-w-xs">
            Generate detailed learning roadmaps in seconds. Break down complex subjects into bite-sized milestones.
          </p>
          <Button 
            variant="outline" 
            className="rounded-full px-8 py-2 text-sm font-bold border-[var(--text-tertiary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-base)] transition-colors"
            onClick={() => switchMode("register")}
          >
            Sign up for free
          </Button>
        </div>

        {/* RIGHT HALF (Visible during Register mode, Form is on the Left) */}
        <div className={`hidden lg:flex flex-col w-1/2 h-full items-center justify-center p-12 text-center relative z-0 transition-all duration-500 ${mode === "register" ? "opacity-100" : "opacity-0 scale-95 pointer-events-none"}`}>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--accent-primary)] text-white shadow-lg shadow-[var(--accent-primary)]/30 mb-6">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] mb-4 leading-tight">
            Welcome <span className="text-[var(--accent-primary)]">Back!</span>
          </h2>
          <p className="text-[var(--text-secondary)] text-sm mb-8 leading-relaxed max-w-xs">
            Pick up right where you left off and keep your momentum going with personalized AI roadmaps.
          </p>
          <Button 
            variant="outline" 
            className="rounded-full px-8 py-2 text-sm font-bold border-[var(--text-tertiary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-base)] transition-colors"
            onClick={() => switchMode("login")}
          >
            Sign in instead
          </Button>
        </div>

        {/* --- THE SLIDING FORM BOX --- */}
        <motion.div
          initial={false}
          animate={mode}
          variants={formVariants}
          transition={{ type: "spring", stiffness: 350, damping: 35 }}
          className="absolute top-0 left-0 w-full lg:w-1/2 h-full z-20 bg-white/90 dark:bg-black/80 backdrop-blur-[40px] rounded-[2rem] shadow-2xl flex items-center justify-center p-6 sm:p-10 lg:p-12 overflow-y-auto border border-white/40 dark:border-white/10"
        >
          {/* Beautiful Bright Blue Tint Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/5 to-[var(--accent-primary)]/20 pointer-events-none rounded-[2rem]" />
          
          <div className="w-full max-w-[340px] my-auto relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                variants={fadeVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.2 }}
              >
                <div className="text-center mb-6 lg:text-left">
                  <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)] mb-2">
                    {mode === "login" ? "Sign In" : "Create Account"}
                  </h1>
                  <p className="text-[var(--text-secondary)] text-sm font-medium">
                    {mode === "login" 
                      ? "Enter your details below." 
                      : "Start building your roadmap today."}
                  </p>
                </div>

                {(sessionMessage || error) && (
                  <div className="mb-5 p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-600 flex items-start gap-2">
                    <div className="mt-0.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-xs font-medium">{sessionMessage || error}</p>
                  </div>
                )}

                <form onSubmit={onSubmit} className="space-y-3.5">
                  {mode === "register" && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[var(--text-primary)]" htmlFor="register-name">Display Name</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[var(--text-tertiary)] group-focus-within:text-[var(--accent-primary)] transition-colors">
                          <User className="h-4 w-4" />
                        </div>
                        <input
                          id="register-name"
                          type="text"
                          className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xl py-2.5 pl-10 pr-3.5 focus:ring-2 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)] transition-all outline-none text-sm font-medium placeholder-[var(--text-tertiary)] shadow-sm"
                          placeholder="Raghul"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          required={mode === "register"}
                          autoComplete="name"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-primary)]" htmlFor="auth-email">Email Address</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[var(--text-tertiary)] group-focus-within:text-[var(--accent-primary)] transition-colors">
                        <Mail className="h-4 w-4" />
                      </div>
                      <input
                        id="auth-email"
                        type="email"
                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xl py-2.5 pl-10 pr-3.5 focus:ring-2 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)] transition-all outline-none text-sm font-medium placeholder-[var(--text-tertiary)] shadow-sm"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[var(--text-primary)]" htmlFor="auth-password">Password</label>
                      {mode === "login" && (
                        <Link href="#" className="text-xs font-semibold text-[var(--accent-primary)] hover:underline">
                          Forgot password?
                        </Link>
                      )}
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[var(--text-tertiary)] group-focus-within:text-[var(--accent-primary)] transition-colors">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        id="auth-password"
                        type={showPassword ? "text" : "password"}
                        className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xl py-2.5 pl-10 pr-10 focus:ring-2 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)] transition-all outline-none text-sm font-medium placeholder-[var(--text-tertiary)] shadow-sm"
                        placeholder={mode === "login" ? "Enter your password" : "8+ chars, uppercase, number"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={mode === "register" ? 8 : undefined}
                        autoComplete={mode === "login" ? "current-password" : "new-password"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors focus:outline-none"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {mode === "register" && password.length > 0 && (
                    <div className="pb-1">
                      <div className="h-1 rounded-full overflow-hidden mb-1.5 bg-[var(--border-subtle)]">
                        <div className="h-full rounded-full transition-all duration-500 ease-out" style={{
                          width: `${strength.score}%`,
                          background: strength.color,
                        }} />
                      </div>
                      <div className="flex justify-between items-center">
                         <p className="text-[10px] font-bold" style={{ color: strength.color }}>{strength.label}</p>
                         <p className="text-[9px] font-medium text-[var(--text-tertiary)]">
                           Requires 8+ chars, 1 uppercase, 1 number.
                         </p>
                      </div>
                    </div>
                  )}

                  {mode === "register" && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[var(--text-primary)]" htmlFor="auth-confirm-password">Confirm Password</label>
                      </div>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[var(--text-tertiary)] group-focus-within:text-[var(--accent-primary)] transition-colors">
                          <Lock className="h-4 w-4" />
                        </div>
                        <input
                          id="auth-confirm-password"
                          type={showPassword ? "text" : "password"}
                          className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-xl py-2.5 pl-10 pr-10 focus:ring-2 focus:ring-[var(--accent-primary)]/20 focus:border-[var(--accent-primary)] transition-all outline-none text-sm font-medium placeholder-[var(--text-tertiary)] shadow-sm"
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          minLength={8}
                          autoComplete="new-password"
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full h-10 text-sm font-bold mt-2 shadow-lg shadow-[var(--accent-primary)]/20 hover:shadow-[var(--accent-primary)]/30 group"
                    disabled={loading}
                  >
                    {loading ? (
                      <><Spinner size={16} className="mr-2" /> {mode === "login" ? "Signing in..." : "Creating account..."}</>
                    ) : (
                      <>{mode === "login" ? "Sign In" : "Sign Up"} <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></>
                    )}
                  </Button>
                </form>

                <div className="mt-6 relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--border-subtle)]"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-[var(--bg-base)] text-[var(--text-tertiary)] font-medium">Or continue with</span>
                  </div>
                </div>

                <div className="mt-4">
                  <Button
                    onClick={handleOAuth}
                    disabled={oauthLoading}
                    variant="outline"
                    className="w-full h-10 text-sm font-bold border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] hover:border-[var(--text-tertiary)] text-[var(--text-primary)] transition-all"
                  >
                    {oauthLoading ? <Spinner size={16} className="mr-2" /> : <GoogleIcon />}
                    Google
                  </Button>
                </div>

                <p className="mt-6 text-center text-xs text-[var(--text-secondary)] font-medium lg:hidden">
                  {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                  <button 
                    onClick={() => switchMode(mode === "login" ? "register" : "login")}
                    className="text-[var(--accent-primary)] font-bold hover:underline transition-colors"
                  >
                    {mode === "login" ? "Sign up for free" : "Sign in"}
                  </button>
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
