"use client";

import { motion } from "framer-motion";
import StorySection, { itemVariants } from "./StorySection";
import {
  Sparkles,
  Settings,
  Map,
  ListChecks,
  Users,
  BarChart3,
} from "lucide-react";

/* ─── Story Data ─── */
const stories = [
  {
    id: "story-generate",
    icon: Sparkles,
    label: "AI Generation",
    title: "Describe your goal. AI builds your runway.",
    description:
      "Tell Thadam what you want to learn, your timeline, and your level. Gemini AI generates a complete, structured roadmap — with milestones, dependencies, and priorities mapped out for you.",
    visual: "generate",
    background: "default" as const,
  },
  {
    id: "story-customize",
    icon: Settings,
    label: "Customize",
    title: "Adjust your flight plan before takeoff",
    description:
      "Tweak the generated roadmap to fit your exact needs. Adjust the difficulty, alter the timeline, and fine-tune your learning pace to ensure the path is perfectly tailored to you.",
    visual: "customize",
    background: "alt" as const,
  },
  {
    id: "story-milestones",
    icon: Map,
    label: "Milestones",
    title: "Break mountains into stepping stones",
    description:
      "Every roadmap splits into clear, achievable milestones. Watch these checkpoints illuminate along your runway as you progress, proving that massive goals are just a series of small steps.",
    visual: "milestones",
    background: "default" as const,
  },
  {
    id: "story-tasks",
    icon: ListChecks,
    label: "Tasks",
    title: "Small actions create unstoppable momentum",
    description:
      "Each milestone breaks down into actionable daily tasks. Check them off as you go. Feel the progress compound day after day as your runway lights up behind you.",
    visual: "tasks",
    background: "alt" as const,
  },
  {
    id: "story-community",
    icon: Users,
    label: "Community",
    title: "Learn from thousands of paths already taken",
    description:
      "Explore roadmaps created by the community. Fork what resonates, upvote what works, and discover new learning paths you never considered. You're never learning alone.",
    visual: "community",
    background: "default" as const,
  },
  {
    id: "story-progress",
    icon: BarChart3,
    label: "Progress Tracking",
    title: "Watch your runway light up behind you",
    description:
      "Track completion rates, build learning streaks, and see exactly how far you've come. Accountability isn't punishing — it's empowering when you can see the lights illuminating your path.",
    visual: "progress",
    background: "alt" as const,
  },
];

/* ─── Visual Mockups for each section ─── */
function GenerateVisual() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Input */}
      <motion.div
        variants={itemVariants}
        className="glass-card"
        style={{ padding: "16px 20px" }}
      >
        <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
          Your Goal
        </div>
        <div style={{ fontSize: "0.95rem", color: "var(--text-primary)", fontWeight: 500 }}>
          Learn Machine Learning in 3 months
          <span className="typewriter-cursor" />
        </div>
      </motion.div>

      {/* Arrow */}
      <motion.div variants={itemVariants} style={{ textAlign: "center", color: "var(--accent-primary)" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </motion.div>

      {/* Output shimmer */}
      <motion.div variants={itemVariants} className="glass-card" style={{ padding: "16px 20px" }}>
        <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--accent-primary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <Sparkles size={12} />
          AI-Generated Roadmap
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {["Python Fundamentals", "Statistics & Probability", "Supervised Learning", "Neural Networks"].map(
            (item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    background: "var(--accent-primary)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>
                {item}
              </div>
            )
          )}
        </div>
      </motion.div>
    </div>
  );
}

function CustomizeVisual() {
  return (
    <motion.div variants={itemVariants} className="glass-card" style={{ padding: "24px" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>Time Commitment</div>
        <div className="customize-options" style={{ display: "flex", gap: 8 }}>
          {["Casual (3h/wk)", "Standard (10h/wk)", "Intense (20h/wk)"].map((opt, i) => (
            <div key={i} style={{
              flex: 1, textAlign: "center", padding: "8px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 500, cursor: "pointer",
              border: `1px solid ${i === 1 ? "var(--accent-primary)" : "var(--border-default)"}`,
              background: i === 1 ? "var(--landing-accent-glow)" : "transparent",
              color: i === 1 ? "var(--accent-primary)" : "var(--text-secondary)"
            }}>
              {opt}
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>Current Level</div>
        <div className="customize-options" style={{ display: "flex", gap: 8 }}>
          {["Beginner", "Intermediate", "Advanced"].map((opt, i) => (
            <div key={i} style={{
              flex: 1, textAlign: "center", padding: "8px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 500, cursor: "pointer",
              border: `1px solid ${i === 0 ? "var(--accent-primary)" : "var(--border-default)"}`,
              background: i === 0 ? "var(--landing-accent-glow)" : "transparent",
              color: i === 0 ? "var(--accent-primary)" : "var(--text-secondary)"
            }}>
              {opt}
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 480px) {
          .customize-options {
            flex-direction: column !important;
          }
        }
      `}</style>
    </motion.div>
  );
}

function MilestonesVisual() {
  const milestones = [
    { title: "Python Fundamentals", duration: "Weeks 1-2", progress: 100 },
    { title: "Statistics & Data", duration: "Weeks 3-4", progress: 60 },
    { title: "Supervised Learning", duration: "Weeks 5-8", progress: 0 },
    { title: "Deep Learning", duration: "Weeks 9-12", progress: 0 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {milestones.map((ms, i) => (
        <motion.div key={i} variants={itemVariants} className="glass-card" style={{ padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>Milestone {i + 1}: {ms.title}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: 2 }}>{ms.duration}</div>
            </div>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: ms.progress === 100 ? "var(--success)" : "var(--accent-primary)" }}>
              {ms.progress}%
            </div>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: "var(--bg-elevated)", overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${ms.progress}%` }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] as const, delay: 0.1 * i }}
              viewport={{ once: true }}
              style={{ height: "100%", borderRadius: 2, background: ms.progress === 100 ? "var(--success)" : "var(--accent-primary)" }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function TasksVisual() {
  const tasks = [
    { text: "Learn linear regression principles", done: true },
    { text: "Implement logistic regression in scikit-learn", done: true },
    { text: "Build a spam classification model", done: false },
    { text: "Deploy model via Flask API", done: false },
  ];

  return (
    <motion.div variants={itemVariants} className="glass-card" style={{ padding: "20px" }}>
      <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 16 }}>
        Active Tasks
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {tasks.map((task, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: "0.85rem" }}>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                border: `2px solid ${task.done ? "var(--success)" : "var(--border-default)"}`,
                background: task.done ? "var(--success)" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "all 0.3s ease",
              }}
            >
              {task.done && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <span
              style={{
                color: task.done ? "var(--text-tertiary)" : "var(--text-primary)",
                textDecoration: task.done ? "line-through" : "none",
                lineHeight: 1.4,
              }}
            >
              {task.text}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function CommunityVisual() {
  const roadmaps = [
    { title: "Full-Stack Web Dev", author: "Sarah K.", forks: 342, gradient: "linear-gradient(135deg, #3B82F6, #8B5CF6)" },
    { title: "Data Science Path", author: "Raj M.", forks: 218, gradient: "linear-gradient(135deg, #10B981, #3B82F6)" },
    { title: "System Design", author: "Alex T.", forks: 156, gradient: "linear-gradient(135deg, #F59E0B, #EF4444)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {roadmaps.map((rm, i) => (
        <motion.div
          key={i}
          variants={itemVariants}
          className="glass-card"
          style={{ overflow: "hidden", cursor: "pointer" }}
        >
          <div style={{ height: 3, background: rm.gradient }} />
          <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>{rm.title}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: 2 }}>by {rm.author}</div>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
              {rm.forks}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ProgressVisual() {
  const circumference = 2 * Math.PI * 42;

  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {/* Progress Ring */}
      <motion.div
        variants={itemVariants}
        className="glass-card"
        style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, flex: "1 1 140px" }}
      >
        <svg width="96" height="96" viewBox="0 0 96 96" className="landing-progress-ring">
          <circle className="landing-progress-ring__track" cx="48" cy="48" r="42" strokeWidth="6" />
          <motion.circle
            className="landing-progress-ring__fill"
            cx="48" cy="48" r="42" strokeWidth="6"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset: circumference * 0.32 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] as const, delay: 0.2 }}
            viewport={{ once: true }}
          />
        </svg>
        <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginTop: -4 }}>68%</div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>Overall Progress</div>
      </motion.div>

      {/* Streak */}
      <motion.div
        variants={itemVariants}
        className="glass-card"
        style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: "1 1 140px" }}
      >
        <div style={{ fontSize: "2rem" }}>🔥</div>
        <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)" }}>14</div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>Day Streak</div>
        <div style={{ display: "flex", gap: 3, marginTop: 4 }}>
          {Array.from({ length: 7 }, (_, i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: i < 6 ? "var(--success)" : "var(--accent-primary)",
                opacity: i < 6 ? 0.5 + i * 0.1 : 1,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Visual Switcher ─── */
function StoryVisual({ type }: { type: string }) {
  switch (type) {
    case "generate":
      return <GenerateVisual />;
    case "customize":
      return <CustomizeVisual />;
    case "milestones":
      return <MilestonesVisual />;
    case "tasks":
      return <TasksVisual />;
    case "community":
      return <CommunityVisual />;
    case "progress":
      return <ProgressVisual />;
    default:
      return null;
  }
}

/* ─── Scroll Story ─── */
export default function ScrollStory() {
  return (
    <div>
      {stories.map((story, index) => {
        const Icon = story.icon;
        const isEven = index % 2 === 0;

        return (
          <StorySection key={story.id} id={story.id} background={story.background}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 64,
                alignItems: "center",
              }}
              className="scroll-story-grid"
            >
              {/* Text Content — alternates sides */}
              <motion.div
                variants={itemVariants}
                style={{ order: isEven ? 1 : 2 }}
                className="scroll-story-text"
              >
                <div className="section-label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Icon size={14} />
                  {story.label}
                </div>
                <h2 className="section-title">{story.title}</h2>
                <p className="section-description">{story.description}</p>
              </motion.div>

              {/* Visual — alternates sides */}
              <motion.div
                variants={itemVariants}
                style={{ order: isEven ? 2 : 1 }}
                className="scroll-story-visual"
              >
                <StoryVisual type={story.visual} />
              </motion.div>
            </div>
          </StorySection>
        );
      })}

      {/* Responsive CSS for the grid */}
      <style jsx>{`
        @media (max-width: 768px) {
          .scroll-story-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .scroll-story-text {
            order: 1 !important;
          }
          .scroll-story-visual {
            order: 2 !important;
          }
        }
      `}</style>
    </div>
  );
}
