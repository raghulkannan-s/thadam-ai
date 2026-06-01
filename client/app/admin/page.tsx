"use client";

import { useAuth } from "@/lib/auth-context";
import { PageLoader } from "@/app/components/LoadingSpinner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/* ── Icons ── */

function ShieldIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

const adminCards = [
  {
    icon: <UsersIcon />,
    title: "User Management",
    description: "View, search, and moderate user accounts. Ban or suspend violating users.",
    badge: "Coming soon",
    color: "var(--accent-primary)",
  },
  {
    icon: <FlagIcon />,
    title: "Report Review",
    description: "Review flagged content, spam roadmaps, and inappropriate submissions.",
    badge: "Coming soon",
    color: "var(--warning)",
  },
  {
    icon: <BarChartIcon />,
    title: "Platform Analytics",
    description: "Track signups, roadmap generation rate, completion metrics, and engagement.",
    badge: "Coming soon",
    color: "var(--success)",
  },
];

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) return <PageLoader />;

  return (
    <div style={{ padding: "32px 24px 80px", maxWidth: "900px", margin: "0 auto" }}>
      {/* Header */}
      <div className="animate-fade-in-up" style={{ textAlign: "center", marginBottom: "48px" }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "var(--radius-xl)",
            background: "var(--surface-2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            color: "var(--accent-tertiary)",
          }}
        >
          <ShieldIcon />
        </div>
        <div className="badge badge-accent" style={{ marginBottom: "16px" }}>
          Admin workspace
        </div>
        <h1
          style={{
            fontSize: "1.6rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          Moderation Suite
        </h1>
        <p
          style={{
            marginTop: "8px",
            fontSize: "0.9rem",
            color: "var(--text-secondary)",
            maxWidth: "500px",
            margin: "8px auto 0",
          }}
        >
          Admin tools for managing users, reviewing reports, and monitoring platform health.
        </p>
      </div>

      {/* Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "16px",
        }}
      >
        {adminCards.map((card, i) => (
          <div
            key={card.title}
            className={`panel animate-fade-in-up delay-${(i + 1) * 100}`}
            style={{
              borderRadius: "var(--radius-xl)",
              padding: "28px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "3px",
                background: card.color,
                opacity: 0.6,
              }}
            />
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "var(--radius-md)",
                background: "var(--surface-3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: card.color,
                marginBottom: "16px",
              }}
            >
              {card.icon}
            </div>
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "8px",
              }}
            >
              {card.title}
            </h3>
            <p
              style={{
                fontSize: "0.82rem",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                marginBottom: "16px",
              }}
            >
              {card.description}
            </p>
            <span className="badge badge-neutral">{card.badge}</span>
          </div>
        ))}
      </div>

      {/* Platform status */}
      <div
        className="panel animate-fade-in-up delay-500"
        style={{
          borderRadius: "var(--radius-xl)",
          padding: "32px",
          marginTop: "24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "0.82rem",
            color: "var(--text-tertiary)",
            lineHeight: 1.7,
          }}
        >
          Admin workflows are under development. Spam removal, report review, and user moderation
          endpoints will be connected here once the backend APIs are deployed.
        </p>
      </div>
    </div>
  );
}
