"use client";

import Link from "next/link";
import { useAuth } from "@/features/auth/providers/AuthProvider";

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
    <div className="overflow-hidden">
      <section className="flex flex-col items-center text-center px-6 pt-[100px] pb-[60px] max-w-[720px] mx-auto">
        <div className="badge badge-accent animate-fade-in mb-6">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          &nbsp;AI-Powered Learning Platform
        </div>

        <h1 className="animate-fade-in-up text-[clamp(2rem,4.5vw,3.25rem)] font-bold leading-[1.1] tracking-[-0.04em] text-[var(--text-primary)]">
          Turn AI roadmaps into a{" "}
          <span className="text-[var(--accent-primary)]">living checklist</span>
          {" "}you can finish.
        </h1>

        <p className="animate-fade-in-up delay-200 text-[1.05rem] text-[var(--text-secondary)] max-w-[520px] mt-5 leading-[1.7]">
          Thadam generates personalized learning roadmaps with Gemini AI and turns them
          into actionable checklists. Set a goal, track daily, build momentum.
        </p>

        <div className="animate-fade-in-up delay-300 flex flex-wrap gap-3 mt-9 justify-center">
          <Link
            href={user ? "/community" : "/register"}
            className="btn btn-primary btn-pill px-7 py-3 text-[0.9rem] no-underline"
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
              className="btn btn-secondary btn-pill px-7 py-3 text-[0.9rem] no-underline"
            >
              Sign in
            </Link>
          )}
        </div>
      </section>

      <section className="max-w-[900px] mx-auto px-6 pt-5 pb-20">
        <p className="text-center text-[0.6875rem] font-bold uppercase tracking-[0.15em] text-[var(--accent-secondary)] mb-2">
          How it works
        </p>
        <h2 className="text-center text-2xl font-bold text-[var(--text-primary)] mb-11 tracking-[-0.03em]">
          Four steps to focused learning
        </h2>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className={`panel animate-fade-in-up delay-${(i + 1) * 100} rounded-[var(--radius-xl)] px-6 py-7`}
            >
              <span className="text-xs font-extrabold tracking-[0.05em]" style={{ color: step.color }}>
                {step.number}
              </span>
              <h3 className="text-base font-semibold text-[var(--text-primary)] mt-3.5 mb-2">
                {step.title}
              </h3>
              <p className="text-[0.82rem] text-[var(--text-secondary)] leading-[1.6]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-[700px] mx-auto px-6 pb-20">
        <div className="panel rounded-[var(--radius-2xl)] px-10 py-12 border-[var(--border-accent)] text-center">
          <span className="text-[0.6875rem] font-bold uppercase tracking-[0.15em] text-[var(--accent-secondary)]">
            Built for consistency
          </span>
          <h2 className="text-[1.3rem] font-bold text-[var(--text-primary)] mt-3 mb-2 tracking-[-0.03em]">
            Everything you need to finish what you start
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-[1.7] max-w-[480px] mx-auto">
            AI-generated roadmaps, checklists, streaks, community voting, forking,
            and detailed progress tracking — all in one place.
          </p>
          <div className="flex justify-center gap-2 mt-7">
            <div className="kbd"><kbd>⌘</kbd></div>
            <div className="kbd"><kbd>K</kbd></div>
            <span className="text-[0.8rem] text-[var(--text-tertiary)] ml-1">
              Quick navigation
            </span>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--border-subtle)] px-6 py-7 text-center">
        <p className="text-[0.78rem] text-[var(--text-tertiary)]">
          &copy; {new Date().getFullYear()} Thadam AI. Built for learners who finish what they start.
        </p>
      </footer>
    </div>
  );
}

