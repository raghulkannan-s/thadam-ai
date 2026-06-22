"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/features/auth/context/auth-context";
import { useTakeoffNavigation } from "../hooks/useTakeoffNavigation";

export default function HeroSection() {
  const { user } = useAuth();
  const handleTakeoff = useTakeoffNavigation();

  return (
    <div
      className="landing-section landing-section--hero"
      style={{
        position: "relative",
        background: "transparent",
        overflow: "visible",
        justifyContent: "flex-start", // Align items to the start
      }}
      id="hero"
    >
      <div className="hero-content-wrapper">
        <motion.div
          className="fade-in-up"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            borderRadius: 100,
            background: "var(--landing-card-bg)",
            border: "1px solid var(--landing-card-border)",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "var(--landing-text-sub)",
            marginBottom: 28,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <span style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--path-fill)",
          }} />
          AI-Powered Learning Platform
        </motion.div>

        <motion.h1
          className="hero-headline fade-in-up"
          style={{ animationDelay: "100ms", textAlign: "left" }}
        >
          Turn AI Roadmaps Into{" "}
          <span style={{ color: "var(--path-fill)" }}>
            Real Progress
          </span>
        </motion.h1>

        <motion.p
          className="hero-subheadline fade-in-up"
          style={{ animationDelay: "200ms", textAlign: "left", marginLeft: 0 }}
        >
          Generate structured learning paths, customize your journey, and track your progress with a community of learners.
        </motion.p>

          {/* Action buttons removed per user request */}
      </div>
    </div>
  );
}
