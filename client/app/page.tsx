"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

const steps = [
  {
    number: "01", title: "Describe your goal",
    description: "Tell the AI what you want to learn, for how long, and at what difficulty.",
    color: "var(--accent-primary)",
  },
  {
    number: "02", title: "Get a structured plan",
    description: "Gemini generates a step-by-step roadmap with milestones, tasks, and priorities.",
    color: "var(--accent-secondary)",
  },
  {
    number: "03", title: "Track your progress",
    description: "Check off tasks, build streaks, and watch your completion rate grow.",
    color: "var(--accent-primary)",
  },
  {
    number: "04", title: "Share and explore",
    description: "Publish your roadmaps, fork community creations, and upvote what works.",
    color: "var(--accent-secondary)",
  },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div style={{ overflow: "hidden" }}>
      <section style={{
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
        padding: "100px 24px 60px", maxWidth: "720px", margin: "0 auto",
      }}>
        <div className="badge badge-accent animate-fade-in" style={{ marginBottom: "24px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          &nbsp;AI-Powered Learning Platform
        </div>

        <h1 className="animate-fade-in-up" style={{
          fontSize: "clamp(2rem, 4.5vw, 3.25rem)", fontWeight: 700,
          lineHeight: 1.1, letterSpacing: "-0.04em",
          color: "var(--text-primary)",
        }}>
          Turn AI roadmaps into a{" "}
          <span style={{ color: "var(--accent-primary)" }}>living checklist</span>
          {" "}you can finish.
        </h1>

        <p className="animate-fade-in-up delay-200" style={{
          fontSize: "1.05rem", color: "var(--text-secondary)",
          maxWidth: "520px", marginTop: "20px", lineHeight: 1.7,
        }}>
          Thadam generates personalized learning roadmaps with Gemini AI and turns them
          into actionable checklists. Set a goal, track daily, build momentum.
        </p>

        <div className="animate-fade-in-up delay-300" style={{
          display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "36px", justifyContent: "center",
        }}>
          <Link
            href={user ? "/community" : "/register"}
            className="btn btn-primary btn-pill"
            style={{ textDecoration: "none", padding: "12px 28px", fontSize: "0.9rem" }}
          >
            {user ? "Go to community" : "Start your checklist"}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
          {!user && (
            <Link
              href="/login"
              className="btn btn-secondary btn-pill"
              style={{ textDecoration: "none", padding: "12px 28px", fontSize: "0.9rem" }}
            >
              Sign in
            </Link>
          )}
        </div>
      </section>

      <section style={{ maxWidth: "900px", margin: "0 auto", padding: "20px 24px 80px" }}>
        <p style={{
          textAlign: "center", fontSize: "0.6875rem", fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.15em",
          color: "var(--accent-secondary)", marginBottom: "8px",
        }}>
          How it works
        </p>
        <h2 style={{
          textAlign: "center", fontSize: "1.5rem", fontWeight: 700,
          color: "var(--text-primary)", marginBottom: "44px", letterSpacing: "-0.03em",
        }}>
          Four steps to focused learning
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
          {steps.map((step, i) => (
            <div
              key={step.title}
              className={`panel animate-fade-in-up delay-${(i + 1) * 100}`}
              style={{ borderRadius: "var(--radius-xl)", padding: "28px 24px" }}
            >
              <span style={{
                fontSize: "0.75rem", fontWeight: 800,
                color: step.color, letterSpacing: "0.05em",
              }}>
                {step.number}
              </span>
              <h3 style={{
                fontSize: "1rem", fontWeight: 600,
                color: "var(--text-primary)", marginTop: "14px", marginBottom: "8px",
              }}>
                {step.title}
              </h3>
              <p style={{
                fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.6,
              }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: "700px", margin: "0 auto", padding: "0 24px 80px" }}>
        <div className="panel" style={{
          borderRadius: "var(--radius-2xl)", padding: "48px 40px",
          borderColor: "var(--border-accent)", textAlign: "center",
        }}>
          <span style={{
            fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.15em", color: "var(--accent-secondary)",
          }}>
            Built for consistency
          </span>
          <h2 style={{
            fontSize: "1.3rem", fontWeight: 700, color: "var(--text-primary)",
            marginTop: "12px", marginBottom: "8px", letterSpacing: "-0.03em",
          }}>
            Everything you need to finish what you start
          </h2>
          <p style={{
            fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.7,
            maxWidth: "480px", margin: "0 auto",
          }}>
            AI-generated roadmaps, checklists, streaks, community voting, forking,
            and detailed progress tracking — all in one place.
          </p>
          <div style={{
            display: "flex", justifyContent: "center", gap: "8px", marginTop: "28px",
          }}>
            <div className="kbd"><kbd>⌘</kbd></div>
            <div className="kbd"><kbd>K</kbd></div>
            <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginLeft: "4px" }}>
              Quick navigation
            </span>
          </div>
        </div>
      </section>

      <footer style={{
        borderTop: "1px solid var(--border-subtle)", padding: "28px 24px", textAlign: "center",
      }}>
        <p style={{ fontSize: "0.78rem", color: "var(--text-tertiary)" }}>
          &copy; {new Date().getFullYear()} Thadam AI. Built for learners who finish what they start.
        </p>
      </footer>
    </div>
  );
}
