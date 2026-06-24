"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/features/auth/context/auth-context";
import { useRouter } from "next/navigation";
import { useTakeoffNavigation } from "../hooks/useTakeoffNavigation";

function SectionWrapper({ children, id }: { children: React.ReactNode; id: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });

  return (
    <section
      id={id}
      ref={ref}
      className="landing-section"
      style={{ minHeight: "100vh", width: "100%", display: "flex", alignItems: "center" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={isInView ? { opacity: 1, y: 0, scale: 0.9 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="section-grid"
      >
        <div className="left-text-column">
           {Array.isArray(children) ? children[0] : children}
        </div>
        <div className="right-visual-column">
           {Array.isArray(children) ? children[1] : null}
        </div>
      </motion.div>
    </section>
  );
}

export function CreatePathSection() {
  return (
    <SectionWrapper id="create">
      <div className="text-content">
        <div className="section-label">Step 01</div>
        <h2 className="section-title">From goal to roadmap in seconds.</h2>
        <p className="section-description">
          Describe your goal, set your weekly hours, and choose your difficulty. Our AI instantly maps out a tailored, step-by-step learning path specifically for you.
        </p>
      </div>
      <div className="visual-content"></div>
    </SectionWrapper>
  );
}

export function LearnTrackSection() {
  return (
    <SectionWrapper id="learn">
      <div className="text-content">
        <div className="section-label">Step 02</div>
        <h2 className="section-title">One step at a time.</h2>
        <p className="section-description">
          Massive goals are broken down into achievable milestones and bite-sized daily tasks. Track your completion rate and build learning streaks.
        </p>
      </div>
      <div className="visual-content"></div>
    </SectionWrapper>
  );
}

export function CommunitySection() {
  return (
    <SectionWrapper id="community">
      <div className="text-content">
        <div className="section-label">Step 03</div>
        <h2 className="section-title">Learn from the paths of others.</h2>
        <p className="section-description">
          Discover roadmaps created by experts. Fork trending paths, see where others branched off, and contribute your own journey back to the community.
        </p>
      </div>
      <div className="visual-content"></div>
    </SectionWrapper>
  );
}

export function FinalCTASection() {
  const { user } = useAuth();
  const handleTakeoff = useTakeoffNavigation();

  return (
    <section id="final-cta" className="landing-section" style={{ position: "relative", minHeight: "100vh", width: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "center", flex: 1 }}>
        <div style={{ paddingLeft: "clamp(24px, 10vw, 120px)", paddingRight: "40px" }}>
          <h2 className="section-title" style={{ marginBottom: 16 }}>Ready for takeoff?</h2>
          <p className="section-description" style={{ marginBottom: 40 }}>
            Join thousands of learners building structured paths to their goals. Your roadmap is one click away.
          </p>
          <div style={{ display: "flex", gap: 16 }}>
            <a
              href={user ? "/community" : "/register"}
              className="cta-primary"
              onClick={(e) => handleTakeoff(e, user ? "/community" : "/register")}
            >
              {user ? "Go to Dashboard" : "Generate My Roadmap"}
            </a>
          </div>
        </div>
      </div>

      {/* Integrated Footer */}
      <footer style={{
        width: "100%",
        padding: "24px clamp(24px, 10vw, 120px)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: "1px solid var(--landing-divider)",
        position: "absolute",
        bottom: 0,
        left: 0,
        zIndex: 20
      }}>
        <div style={{ fontSize: "0.85rem", color: "var(--landing-text-sub)" }}>
          &copy; {new Date().getFullYear()} Thadam AI. All rights reserved.
        </div>
        <div style={{ display: "flex", gap: 24, fontSize: "0.85rem" }}>
          <Link href="/privacy" style={{ color: "var(--landing-text-sub)", textDecoration: "none" }}>Privacy</Link>
          <Link href="/terms" style={{ color: "var(--landing-text-sub)", textDecoration: "none" }}>Terms</Link>
          <a href="https://github.com" target="_blank" rel="noreferrer" style={{ color: "var(--landing-text-sub)", textDecoration: "none" }}>GitHub</a>
          <a href="mailto:hello@thadam.ai" style={{ color: "var(--landing-text-sub)", textDecoration: "none" }}>Contact</a>
        </div>
      </footer>
    </section>
  );
}
