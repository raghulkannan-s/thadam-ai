"use client";

import { useRef, ReactNode } from "react";
import { motion, useInView } from "framer-motion";

interface StorySectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  background?: "default" | "alt";
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

export default function StorySection({
  children,
  className = "",
  id,
  background = "default",
}: StorySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      id={id}
      className={`landing-section ${className}`}
      style={{
        background: background === "alt"
          ? "var(--landing-section-alt-bg)"
          : "var(--landing-section-bg)",
      }}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>
        {children}
      </div>
    </motion.section>
  );
}
