"use client";

import Link from "next/link";

export default function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--bg-base)",
        padding: "48px 24px 32px",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
          gap: 40,
        }}
        className="footer-grid"
      >
        {/* Brand */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <img
              src="/assets/logo-no-bg.png"
              alt="Thadam AI Logo"
              style={{
                width: 36,
                height: 36,
                objectFit: "contain",
              }}
            />
            <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              Thadam AI
            </span>
          </div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", lineHeight: 1.6, maxWidth: 280 }}>
            AI-powered learning roadmaps that turn goals into structured, trackable journeys.
          </p>
        </div>

        {/* Product */}
        <div>
          <h4 style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
            Product
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href="#roadmap-showcase" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textDecoration: "none", transition: "color 0.2s" }}>
              Features
            </Link>
            <Link href="/community" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textDecoration: "none", transition: "color 0.2s" }}>
              Community
            </Link>
            <Link href="/register" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textDecoration: "none", transition: "color 0.2s" }}>
              Get Started
            </Link>
          </div>
        </div>

        {/* Resources */}
        <div>
          <h4 style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
            Resources
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href="#story-generate" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textDecoration: "none", transition: "color 0.2s" }}>
              How It Works
            </Link>
            <Link href="#community-showcase" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textDecoration: "none", transition: "color 0.2s" }}>
              Explore Roadmaps
            </Link>
          </div>
        </div>

        {/* Legal */}
        <div>
          <h4 style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
            Legal
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-tertiary)" }}>
              Privacy Policy
            </span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-tertiary)" }}>
              Terms of Service
            </span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          maxWidth: 1100,
          margin: "32px auto 0",
          paddingTop: 24,
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <p style={{ fontSize: "0.78rem", color: "var(--text-tertiary)", margin: 0 }}>
          © {currentYear} Thadam AI. Built for learners who finish what they start.
        </p>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
