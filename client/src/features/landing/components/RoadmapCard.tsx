"use client";

import { motion } from "framer-motion";
import { GitFork, ArrowUp, BookOpen, Clock, Users } from "lucide-react";

/* ─── Types ─── */
interface RoadmapCardData {
  title: string;
  author: string;
  avatar: string;
  gradient: string;
  milestones: number;
  completion: number;
  forks: number;
  upvotes: number;
  badge?: "Trending" | "Popular" | "New";
  duration: string;
  learners: number;
}

/* ─── Badge Colors ─── */
const badgeStyles: Record<string, { bg: string; color: string }> = {
  Trending: { bg: "rgba(239, 68, 68, 0.1)", color: "#EF4444" },
  Popular: { bg: "rgba(59, 130, 246, 0.1)", color: "#3B82F6" },
  New: { bg: "rgba(16, 185, 129, 0.1)", color: "#10B981" },
};

/* ─── Card Component ─── */
export default function RoadmapCard({ data, index }: { data: RoadmapCardData; index: number }) {
  return (
    <motion.div
      className="community-card"
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1] as const,
        delay: index * 0.08,
      }}
      style={{ cursor: "pointer" }}
    >
      {/* Gradient header bar */}
      <div className="community-card__gradient" style={{ background: data.gradient }} />

      <div style={{ padding: "20px" }}>
        {/* Badge + Title */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
          <h3 style={{
            fontSize: "0.95rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
            margin: 0,
          }}>
            {data.title}
          </h3>
          {data.badge && (
            <span style={{
              fontSize: "0.65rem",
              fontWeight: 700,
              padding: "3px 8px",
              borderRadius: 6,
              background: badgeStyles[data.badge].bg,
              color: badgeStyles[data.badge].color,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              whiteSpace: "nowrap",
              flexShrink: 0,
              marginLeft: 8,
            }}>
              {data.badge}
            </span>
          )}
        </div>

        {/* Author */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: data.gradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.55rem",
            fontWeight: 700,
            color: "#fff",
            flexShrink: 0,
          }}>
            {data.avatar}
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            {data.author}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>
              {data.milestones} milestones
            </span>
            <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--accent-primary)" }}>
              {data.completion}%
            </span>
          </div>
          <div style={{ height: 3, borderRadius: 2, background: "var(--bg-elevated)", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${data.completion}%`,
              borderRadius: 2,
              background: data.gradient,
              transition: "width 1s ease",
            }} />
          </div>
        </div>

        {/* Meta row */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          paddingTop: 12,
          borderTop: "1px solid var(--border-subtle)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
            <GitFork size={12} />
            {data.forks}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
            <ArrowUp size={12} />
            {data.upvotes}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
            <Users size={12} />
            {data.learners}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", color: "var(--text-tertiary)", marginLeft: "auto" }}>
            <Clock size={12} />
            {data.duration}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
