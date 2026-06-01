"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

/* ── Icons ── */

function SparklesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a4 4 0 0 0-4 4c0 4 4 6 4 10" />
      <path d="M12 2a4 4 0 0 1 4 4c0 4-4 6-4 10" />
      <circle cx="12" cy="20" r="2" />
    </svg>
  );
}

function ListChecksIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 17 2 2 4-4" />
      <path d="m3 7 2 2 4-4" />
      <path d="M13 6h8" />
      <path d="M13 12h8" />
      <path d="M13 18h8" />
    </svg>
  );
}

function TrendingUpIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

/* ── Data ── */

const steps = [
  {
    icon: <BrainIcon />,
    title: "Describe your goal",
    description: "Tell the AI what you want to learn, for how long, and at what level.",
  },
  {
    icon: <ListChecksIcon />,
    title: "Get a structured roadmap",
    description: "AI generates a step-by-step plan with tasks, timelines, and priorities.",
  },
  {
    icon: <CheckIcon />,
    title: "Turn it into a checklist",
    description: "Each task becomes a trackable checklist item you can tick off daily.",
  },
  {
    icon: <TrendingUpIcon />,
    title: "Build momentum",
    description: "Watch your progress grow. Streaks, completion rates, and visible wins.",
  },
];

const features = [
  {
    icon: <SparklesIcon />,
    title: "AI-powered roadmaps",
    description: "Gemini AI creates personalized learning plans tailored to your goals and pace.",
  },
  {
    icon: <ListChecksIcon />,
    title: "Actionable checklists",
    description: "Every roadmap converts to a checklist so you know exactly what to do next.",
  },
  {
    icon: <ZapIcon />,
    title: "Streak tracking",
    description: "Stay consistent with daily progress tracking and completion streaks.",
  },
];

/* ── Component ── */

export default function Home() {
  const { user } = useAuth();

  return (
    <div style={{ overflow: "hidden" }}>
      {/* ── HERO ── */}
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "80px 24px 60px",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        {/* Accent chip */}
        <div
          className="badge badge-accent animate-fade-in"
          style={{ marginBottom: "24px", fontSize: "0.7rem" }}
        >
          <SparklesIcon /> AI-Powered Learning Platform
        </div>

        {/* Headline */}
        <h1
          className="animate-fade-in-up"
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            color: "var(--text-primary)",
          }}
        >
          Turn AI roadmaps into a{" "}
          <span
            style={{
              background: "var(--accent-gradient)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            living checklist
          </span>{" "}
          you can finish.
        </h1>

        {/* Subtitle */}
        <p
          className="animate-fade-in-up delay-200"
          style={{
            fontSize: "1.05rem",
            color: "var(--text-secondary)",
            maxWidth: "560px",
            marginTop: "20px",
            lineHeight: 1.7,
          }}
        >
          Thadam keeps your learning on track with AI-generated roadmaps,
          structured checklists, daily wins, and visible momentum.
        </p>

        {/* CTAs */}
        <div
          className="animate-fade-in-up delay-300"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            marginTop: "36px",
            justifyContent: "center",
          }}
        >
          <Link
            href={user ? "/dashboard" : "/register"}
            className="btn-primary"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 28px",
              fontSize: "0.9rem",
            }}
          >
            {user ? "Go to dashboard" : "Start your checklist"}
            <ArrowRightIcon />
          </Link>
          {!user && (
            <Link
              href="/login"
              className="btn-secondary"
              style={{
                textDecoration: "none",
                padding: "12px 28px",
                fontSize: "0.9rem",
              }}
            >
              Sign in
            </Link>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "40px 24px 80px",
        }}
      >
        <p
          className="animate-fade-in"
          style={{
            textAlign: "center",
            fontSize: "0.7rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.25em",
            color: "var(--accent-tertiary)",
            marginBottom: "12px",
          }}
        >
          How it works
        </p>
        <h2
          className="animate-fade-in-up"
          style={{
            textAlign: "center",
            fontSize: "1.6rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "48px",
            letterSpacing: "-0.02em",
          }}
        >
          Four steps to focused learning
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          {steps.map((step, i) => (
            <div
              key={step.title}
              className={`panel animate-fade-in-up delay-${(i + 1) * 100}`}
              style={{
                borderRadius: "var(--radius-xl)",
                padding: "28px 24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "var(--radius-md)",
                  background: "var(--surface-3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent-tertiary)",
                }}
              >
                {step.icon}
              </div>
              <div>
                <p
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: "var(--text-tertiary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    marginBottom: "6px",
                  }}
                >
                  Step {i + 1}
                </p>
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginBottom: "8px",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "0 24px 80px",
        }}
      >
        <div
          className="gradient-border panel"
          style={{
            borderRadius: "var(--radius-2xl)",
            padding: "48px 32px",
          }}
        >
          <p
            style={{
              textAlign: "center",
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.25em",
              color: "var(--accent-tertiary)",
              marginBottom: "12px",
            }}
          >
            Built for consistency
          </p>
          <h2
            style={{
              textAlign: "center",
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              marginBottom: "40px",
              letterSpacing: "-0.02em",
            }}
          >
            Everything you need to finish what you start
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "24px",
            }}
          >
            {features.map((feature) => (
              <div
                key={feature.title}
                style={{
                  padding: "24px",
                  borderRadius: "var(--radius-lg)",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div
                  style={{
                    color: "var(--accent-primary)",
                    marginBottom: "14px",
                  }}
                >
                  {feature.icon}
                </div>
                <h3
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    marginBottom: "8px",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                  }}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          borderTop: "1px solid var(--border-subtle)",
          padding: "32px 24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "0.78rem",
            color: "var(--text-tertiary)",
          }}
        >
          © {new Date().getFullYear()} Thadam AI. Built for learners who finish
          what they start.
        </p>
      </footer>
    </div>
  );
}
