"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Zap, Shield, Users } from "lucide-react";

const trustItems = [
  {
    icon: Users,
    text: "2,000+ roadmaps created",
  },
  {
    icon: Zap,
    text: "Powered by Gemini AI",
  },
  {
    icon: Shield,
    text: "Free to get started",
  },
];

export default function TrustStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div ref={ref} className="trust-strip">
      {trustItems.map((item, i) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={i}
            className="trust-item"
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1] as const,
              delay: i * 0.1,
            }}
          >
            <Icon size={16} style={{ color: "var(--accent-primary)" }} />
            <span>{item.text}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
