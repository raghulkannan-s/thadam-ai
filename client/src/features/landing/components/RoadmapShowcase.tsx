"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Sparkles } from "lucide-react";

/* ─── Workflow Steps ─── */
const steps = [
  {
    number: "01",
    label: "Set Your Goal",
    content: (
      <div style={{ padding: "14px 18px", borderRadius: 10, background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)" }}>
        <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
          I want to learn...
        </div>
        <div style={{ fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: 500 }}>
          Machine Learning in 3 months
        </div>
      </div>
    ),
  },
  {
    number: "02",
    label: "AI Generates",
    content: (
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderRadius: 10 }}>
        <div className="ai-shimmer" style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="ai-shimmer" style={{ height: 10, borderRadius: 4, marginBottom: 6, width: "80%" }} />
          <div className="ai-shimmer" style={{ height: 10, borderRadius: 4, width: "60%" }} />
        </div>
      </div>
    ),
  },
  {
    number: "03",
    label: "Roadmap Ready",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {["Python Basics", "Statistics", "Supervised ML", "Deep Learning"].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-primary)", flexShrink: 0 }} />
            {item}
          </div>
        ))}
      </div>
    ),
  },
  {
    number: "04",
    label: "Track Milestones",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          { text: "Environment Setup", done: true },
          { text: "Core Concepts", done: true },
          { text: "First Project", done: false },
        ].map((ms, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem" }}>
            <div style={{
              width: 16, height: 16, borderRadius: 4,
              border: `1.5px solid ${ms.done ? "var(--success)" : "var(--border-default)"}`,
              background: ms.done ? "var(--success)" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              {ms.done && (
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span style={{ color: ms.done ? "var(--text-tertiary)" : "var(--text-primary)", textDecoration: ms.done ? "line-through" : "none" }}>
              {ms.text}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    number: "05",
    label: "Complete Tasks",
    content: (
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Daily Tasks</span>
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--success)" }}>2/3</span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: "var(--bg-elevated)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: "66%", borderRadius: 2, background: "var(--success)", transition: "width 1s ease" }} />
        </div>
      </div>
    ),
  },
  {
    number: "06",
    label: "Arrive",
    content: (
      <div style={{ textAlign: "center", padding: "8px 0" }}>
        <div style={{ fontSize: "1.5rem", marginBottom: 4 }}>🎉</div>
        <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--success)" }}>Roadmap Complete!</div>
      </div>
    ),
  },
];

/* ─── Component ─── */
export default function RoadmapShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="landing-section"
      style={{ background: "var(--landing-section-alt-bg)" }}
      id="roadmap-showcase"
    >
      <div style={{ maxWidth: 900, margin: "0 auto", width: "100%" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          style={{ textAlign: "center", marginBottom: 64 }}
        >
          <div className="section-label" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Sparkles size={14} />
            How It Works
          </div>
          <h2 className="section-title" style={{ margin: "0 auto" }}>
            From goal to completion in six steps
          </h2>
          <p className="section-description" style={{ margin: "16px auto 0" }}>
            Thadam turns any learning goal into a structured, trackable journey.
          </p>
        </motion.div>

        {/* Steps Pipeline */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}
          className="roadmap-showcase-grid"
        >
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="glass-card"
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1] as const,
                delay: 0.15 + i * 0.1,
              }}
              style={{ padding: "24px 20px" }}
            >
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
              }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "var(--accent-primary)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  flexShrink: 0,
                }}>
                  {step.number}
                </div>
                <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>
                  {step.label}
                </span>
              </div>
              {step.content}
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .roadmap-showcase-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 600px) {
          .roadmap-showcase-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
