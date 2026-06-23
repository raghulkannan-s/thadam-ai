"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Compass } from "lucide-react";
import RoadmapCard from "./RoadmapCard";
import Link from "next/link";

/* ─── Mock Data ─── */
const roadmaps = [
  {
    title: "Machine Learning Fundamentals",
    author: "Sarah Chen",
    avatar: "SC",
    gradient: "var(--accent-primary)",
    milestones: 8,
    completion: 85,
    forks: 342,
    upvotes: 891,
    badge: "Trending" as const,
    duration: "3 months",
    learners: 1247,
  },
  {
    title: "Full-Stack Web Development",
    author: "James Rodriguez",
    avatar: "JR",
    gradient: "var(--accent-primary)",
    milestones: 12,
    completion: 72,
    forks: 518,
    upvotes: 1203,
    badge: "Popular" as const,
    duration: "6 months",
    learners: 2103,
  },
  {
    title: "System Design Mastery",
    author: "Priya Patel",
    avatar: "PP",
    gradient: "var(--accent-primary)",
    milestones: 6,
    completion: 60,
    forks: 156,
    upvotes: 445,
    duration: "2 months",
    learners: 634,
  },
  {
    title: "iOS Development with SwiftUI",
    author: "Alex Thompson",
    avatar: "AT",
    gradient: "var(--accent-primary)",
    milestones: 10,
    completion: 45,
    forks: 89,
    upvotes: 312,
    badge: "New" as const,
    duration: "4 months",
    learners: 389,
  },
  {
    title: "DevOps & Cloud Engineering",
    author: "Omar Faruq",
    avatar: "OF",
    gradient: "var(--accent-primary)",
    milestones: 9,
    completion: 78,
    forks: 203,
    upvotes: 567,
    duration: "3 months",
    learners: 812,
  },
  {
    title: "Data Structures & Algorithms",
    author: "Min-Jun Kim",
    avatar: "MK",
    gradient: "var(--accent-primary)",
    milestones: 7,
    completion: 92,
    forks: 412,
    upvotes: 978,
    badge: "Popular" as const,
    duration: "2 months",
    learners: 1856,
  },
];

/* ─── Community Showcase ─── */
export default function CommunityShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="landing-section"
      style={{ background: "var(--landing-section-bg)" }}
      id="community-showcase"
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          style={{ textAlign: "center", marginBottom: 56 }}
        >
          <div className="section-label" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Compass size={14} />
            Community
          </div>
          <h2 className="section-title" style={{ margin: "0 auto" }}>
            Discover paths others have taken
          </h2>
          <p className="section-description" style={{ margin: "16px auto 0" }}>
            Browse, fork, and build upon roadmaps created by the learning community.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 20,
          }}
          className="community-grid"
        >
          {roadmaps.map((rm, i) => (
            <RoadmapCard key={i} data={rm} index={i} />
          ))}
        </div>

        {/* Explore CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          style={{ textAlign: "center", marginTop: 48 }}
        >
          <Link href="/community" className="cta-secondary">
            Explore All Roadmaps
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          .community-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 600px) {
          .community-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
