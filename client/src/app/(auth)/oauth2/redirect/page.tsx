"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setTokens, apiFetch } from "@/lib/api";
import { useAuth } from "@/features/auth/context/auth-context";
import type { LoginResponse } from "@/lib/types";
import { sanitizeRedirectPath } from "@/features/auth/context/auth-redirect";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_client: "Google sign in is not configured correctly. Please contact support.",
  redirect_uri_mismatch: "There is a configuration mismatch. Please contact support.",
  consent_denied: "You denied the sign in request. Please try again.",
  provider_unavailable: "Google sign in is temporarily unavailable. Please try again later.",
  email_not_provided: "Google did not provide an email address. Please try a different account.",
};

function OAuth2RedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      const message = OAUTH_ERROR_MESSAGES[error] || `Authentication failed (${error}). Please try again.`;
      setErrorMessage(message);
      setStatus("error");
      const timer = setTimeout(() => router.replace("/login"), 5000);
      return () => clearTimeout(timer);
    }

    if (!code) {
      setErrorMessage("No authentication code received. Please try signing in again.");
      setStatus("error");
      const timer = setTimeout(() => router.replace("/login"), 5000);
      return () => clearTimeout(timer);
    }

    router.replace("/oauth2/redirect", undefined);

    (async () => {
      try {
        const res = await apiFetch<LoginResponse>("/api/auth/exchange-oauth-code", {
          method: "POST",
          body: JSON.stringify({ code }),
        });
        setTokens(res.data.accessToken, res.data.refreshToken);
        await refresh();
        setStatus("success");
        const target = sanitizeRedirectPath(
          typeof window === "undefined" ? null : window.sessionStorage.getItem("oauthRedirect"),
        );
        if (typeof window !== "undefined") {
          window.sessionStorage.removeItem("oauthRedirect");
        }
        router.replace(target);
      } catch {
        setErrorMessage("Failed to complete sign in. Please try again.");
        setStatus("error");
        setTimeout(() => router.replace("/login"), 5000);
      }
    })();
  }, [searchParams, router, refresh]);

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="panel w-full max-w-md rounded-2xl p-8 text-center animate-fade-in">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--error-bg)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Sign In Failed</h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>{errorMessage}</p>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center animate-fade-in">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--success-bg)]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--success)" }}>Signed in successfully!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="text-center">
        <div className="animate-spin mx-auto mb-4 h-8 w-8 rounded-full border-[3px]" style={{
          borderColor: "var(--surface-3)",
          borderTopColor: "var(--accent-primary)",
        }} />
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Completing sign in...</p>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";

export default function OAuth2RedirectPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="animate-spin mx-auto h-8 w-8 rounded-full border-[3px]" style={{
          borderColor: "var(--surface-3)",
          borderTopColor: "var(--accent-primary)",
        }} />
      </div>
    }>
      <OAuth2RedirectContent />
    </Suspense>
  );
}
