"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In a real production app, log this to an error reporting service like Sentry
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "40px 24px",
        background: "var(--bg-base)",
        color: "var(--text-primary)",
      }}
    >
      <div
        className="panel animate-scale-in"
        style={{
          maxWidth: "480px",
          width: "100%",
          padding: "40px",
          borderRadius: "var(--radius-2xl)",
          textAlign: "center",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "rgba(239, 68, 68, 0.1)",
            color: "var(--error)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginBottom: "12px",
          }}
        >
          Something went wrong
        </h1>
        <p
          style={{
            fontSize: "0.95rem",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            marginBottom: "32px",
          }}
        >
          An unexpected error occurred. Our engineering team has been notified.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <button
            onClick={() => reset()}
            className="btn btn-primary"
            style={{ minWidth: "140px" }}
          >
            Try again
          </button>
          <Link
            href="/"
            className="btn btn-ghost"
            style={{ minWidth: "140px" }}
          >
            Go to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
