"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setTokens } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

function OAuth2RedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);
      refresh().then(() => {
        router.push("/community");
      });
    } else {
      setError("OAuth authentication failed. No tokens received.");
      setTimeout(() => router.push("/login"), 3000);
    }
  }, [searchParams, router, refresh]);

  if (error) {
    return (
      <div style={{
        display: "flex", flex: 1, alignItems: "center",
        justifyContent: "center", padding: "40px 24px",
      }}>
        <div className="panel" style={{
          maxWidth: "420px", borderRadius: "var(--radius-2xl)",
          padding: "40px 32px", textAlign: "center",
        }}>
          <p style={{ color: "var(--error)", fontSize: "0.9rem" }}>{error}</p>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.8rem", marginTop: "12px" }}>
            Redirecting to login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", flex: 1, alignItems: "center",
      justifyContent: "center", padding: "40px 24px",
    }}>
      <div style={{ textAlign: "center" }}>
        <div className="animate-spin" style={{
          width: 32, height: 32, margin: "0 auto 16px",
          border: "3px solid var(--surface-3)",
          borderTop: "3px solid var(--accent-primary)",
          borderRadius: "50%",
        }} />
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Completing sign in...
        </p>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";

export default function OAuth2RedirectPage() {
  return (
    <Suspense fallback={
      <div style={{
        display: "flex", flex: 1, alignItems: "center",
        justifyContent: "center", padding: "40px 24px",
      }}>
        <div className="animate-spin" style={{
          width: 32, height: 32,
          border: "3px solid var(--surface-3)",
          borderTop: "3px solid var(--accent-primary)",
          borderRadius: "50%",
        }} />
      </div>
    }>
      <OAuth2RedirectContent />
    </Suspense>
  );
}
