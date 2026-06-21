"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/features/auth/context/auth-context";

import { useRouter } from "next/navigation";

export default function FinalCTA() {
  const { user } = useAuth();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const handleTakeoff = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    window.dispatchEvent(new Event("thadam-takeoff"));
    setTimeout(() => {
      router.push(href);
    }, 1500);
  };

  return (
    <section
      ref={ref}
      className="landing-section landing-section--full"
      style={{
        background: "var(--landing-section-alt-bg)",
        position: "relative",
        overflow: "hidden",
      }}
      id="final-cta"
    >
      {/* Subtle gradient glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse 60% 50% at 50% 50%, var(--landing-glow) 0%, transparent 70%)
          `,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          maxWidth: 640,
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
          style={{ fontSize: "3.5rem", marginBottom: 20 }}
        >
          ✈️
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] as const }}
          style={{
            fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)",
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: "var(--text-primary)",
            margin: 0,
          }}
        >
          Ready for takeoff?
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            fontSize: "1.0625rem",
            lineHeight: 1.7,
            color: "var(--text-secondary)",
            marginTop: 16,
            maxWidth: 480,
          }}
        >
          Join thousands of learners building structured paths to their goals.
          Your roadmap is one click away.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="hero-buttons"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.35 }}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            marginTop: 32,
            justifyContent: "center",
          }}
        >
          <a
            href={user ? "/community" : "/register"}
            className="cta-primary"
            onClick={(e) => handleTakeoff(e, user ? "/community" : "/register")}
          >
            {user ? "Go to Dashboard" : "Generate My Roadmap"}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <Link href="/community" className="cta-secondary">
            Explore Community
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
