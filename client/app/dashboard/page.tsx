"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/app/components/Toast";
import { apiFetch } from "@/lib/api";
import { AiLoader, PageLoader, Spinner } from "@/app/components/LoadingSpinner";
import { ProgressRing } from "@/app/components/ProgressRing";
import type { ChecklistItem, Roadmap } from "@/lib/types";
import { useRouter } from "next/navigation";

/* ═══════════════════════════════════════════
   ICONS
   ═══════════════════════════════════════════ */

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

function RocketIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

/* ═══════════════════════════════════════════
   STAT CARD
   ═══════════════════════════════════════════ */

function StatCard({
  label,
  value,
  color,
  delay,
}: {
  label: string;
  value: string | number;
  color: string;
  delay: string;
}) {
  return (
    <div
      className={`panel animate-fade-in-up ${delay}`}
      style={{
        borderRadius: "var(--radius-xl)",
        padding: "20px 24px",
        flex: "1 1 140px",
      }}
    >
      <p
        style={{
          fontSize: "0.65rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: "var(--text-tertiary)",
          marginBottom: "8px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: "1.6rem",
          fontWeight: 700,
          color,
          lineHeight: 1,
        }}
      >
        {value}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   PRIORITY HELPERS
   ═══════════════════════════════════════════ */

const priorityMeta: Record<string, { color: string; badgeClass: string }> = {
  HIGH: { color: "var(--error)", badgeClass: "badge-error" },
  MEDIUM: { color: "var(--warning)", badgeClass: "badge-warning" },
  LOW: { color: "var(--info)", badgeClass: "badge-accent" },
};

const difficultyChips = ["Beginner", "Intermediate", "Advanced"];

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedRoadmap, setExpandedRoadmap] = useState<number | null>(null);

  // Generator form
  const [goal, setGoal] = useState("");
  const [durationWeeks, setDurationWeeks] = useState(12);
  const [difficulty, setDifficulty] = useState("Beginner");

  // Quick add form
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<number | null>(null);
  const [itemTitle, setItemTitle] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemDueDate, setItemDueDate] = useState("");
  const [itemPriority, setItemPriority] = useState("MEDIUM");
  const [showAddForm, setShowAddForm] = useState(false);

  /* ── Load data ── */

  const loadData = useCallback(async () => {
    try {
      const list = await apiFetch<Roadmap[]>("/api/roadmaps");
      setRoadmaps(list.data);
      if (list.data.length > 0) {
        setSelectedRoadmapId((prev) => prev ?? list.data[0].id);
        setExpandedRoadmap((prev) => prev ?? list.data[0].id);
      }
    } catch {
      addToast("Failed to load roadmaps", "error");
    } finally {
      setDataLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      loadData();
    }
  }, [user, authLoading, router, loadData]);

  /* ── Generate roadmap ── */

  const onGenerate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!goal.trim()) return;
    setGenerating(true);
    try {
      const response = await apiFetch<Roadmap>("/api/roadmaps/generate", {
        method: "POST",
        body: JSON.stringify({ goal, durationWeeks, difficulty }),
      });
      setRoadmaps((prev) => [response.data, ...prev]);
      setSelectedRoadmapId(response.data.id);
      setExpandedRoadmap(response.data.id);
      setGoal("");
      addToast("Roadmap generated successfully! 🚀", "success");
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Failed to generate roadmap",
        "error",
      );
    } finally {
      setGenerating(false);
    }
  };

  /* ── Add checklist item ── */

  const onAddItem = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedRoadmapId) {
      addToast("Select a roadmap first", "info");
      return;
    }
    try {
      const response = await apiFetch<ChecklistItem>(
        `/api/checklists/roadmap/${selectedRoadmapId}`,
        {
          method: "POST",
          body: JSON.stringify({
            title: itemTitle,
            description: itemDescription,
            dueDate: itemDueDate || null,
            priority: itemPriority,
          }),
        },
      );
      setRoadmaps((prev) =>
        prev.map((r) =>
          r.id === selectedRoadmapId
            ? { ...r, checklist: [...r.checklist, response.data] }
            : r,
        ),
      );
      setItemTitle("");
      setItemDescription("");
      setItemDueDate("");
      setShowAddForm(false);
      addToast("Task added", "success");
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Failed to add task",
        "error",
      );
    }
  };

  /* ── Toggle item status ── */

  const updateItemStatus = async (item: ChecklistItem) => {
    const nextStatus = item.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    // Optimistic update
    setRoadmaps((prev) =>
      prev.map((r) => ({
        ...r,
        checklist: r.checklist.map((ci) =>
          ci.id === item.id ? { ...ci, status: nextStatus } : ci,
        ),
      })),
    );
    try {
      await apiFetch<ChecklistItem>(`/api/checklists/item/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: nextStatus }),
      });
      if (nextStatus === "COMPLETED") {
        addToast("Task completed! 🎉", "success");
      }
    } catch (err) {
      // Revert on error
      setRoadmaps((prev) =>
        prev.map((r) => ({
          ...r,
          checklist: r.checklist.map((ci) =>
            ci.id === item.id ? { ...ci, status: item.status } : ci,
          ),
        })),
      );
      addToast(
        err instanceof Error ? err.message : "Failed to update task",
        "error",
      );
    }
  };

  /* ── Stats ── */

  const stats = useMemo(() => {
    const allItems = roadmaps.flatMap((r) => r.checklist);
    const completed = allItems.filter((i) => i.status === "COMPLETED").length;
    const total = allItems.length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent, roadmapCount: roadmaps.length };
  }, [roadmaps]);

  /* ── Loading states ── */

  if (authLoading || (!user && !authLoading)) {
    return <PageLoader />;
  }

  return (
    <div style={{ padding: "32px 24px 80px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* ── HEADER ── */}
      <header className="animate-fade-in-up">
        <p
          className="badge badge-accent"
          style={{ marginBottom: "16px" }}
        >
          Checklist Studio
        </p>
        <h1
          style={{
            fontSize: "1.8rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.03em",
          }}
        >
          Welcome back, {user?.displayName || user?.email || "learner"}.
        </h1>
        <p
          style={{
            marginTop: "8px",
            fontSize: "0.9rem",
            color: "var(--text-secondary)",
            maxWidth: "600px",
          }}
        >
          Generate AI roadmaps, convert them to actionable checklists, and
          track your progress.
        </p>
      </header>

      {/* ── STATS BAR ── */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          marginTop: "32px",
        }}
      >
        <StatCard label="Roadmaps" value={stats.roadmapCount} color="var(--accent-tertiary)" delay="delay-100" />
        <StatCard label="Total tasks" value={stats.total} color="var(--text-primary)" delay="delay-200" />
        <StatCard label="Completed" value={stats.completed} color="var(--success)" delay="delay-300" />
        <div
          className="panel animate-fade-in-up delay-400"
          style={{
            borderRadius: "var(--radius-xl)",
            padding: "12px 24px",
            flex: "1 1 140px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ProgressRing value={stats.percent} size={80} strokeWidth={6} label="done" />
        </div>
      </div>

      {/* ── MAIN CONTENT GRID ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "24px",
          marginTop: "32px",
        }}
        className="lg:grid-cols-[380px_1fr]"
      >
        {/* ── LEFT SIDEBAR ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* AI Generator */}
          <form
            onSubmit={onGenerate}
            className="card-accent animate-fade-in-up delay-200"
            style={{
              borderRadius: "var(--radius-xl)",
              padding: "28px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius-md)",
                  background: "var(--accent-gradient)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                }}
              >
                <SparklesIcon />
              </div>
              <div>
                <h2
                  style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  AI Roadmap Generator
                </h2>
                <p style={{ fontSize: "0.72rem", color: "var(--text-tertiary)" }}>
                  Powered by Gemini
                </p>
              </div>
            </div>

            {generating ? (
              <AiLoader />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label className="label" htmlFor="dash-goal">Learning goal</label>
                  <textarea
                    id="dash-goal"
                    className="input"
                    style={{ minHeight: "90px" }}
                    placeholder="e.g. Learn React + TypeScript from scratch…"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="label" htmlFor="dash-duration">
                    Duration (weeks)
                  </label>
                  <input
                    id="dash-duration"
                    type="number"
                    min={1}
                    max={52}
                    className="input"
                    value={durationWeeks}
                    onChange={(e) => setDurationWeeks(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="label">Difficulty</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {difficultyChips.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDifficulty(d)}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "var(--radius-full)",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          border:
                            difficulty === d
                              ? "1px solid var(--accent-primary)"
                              : "1px solid var(--border-default)",
                          background:
                            difficulty === d
                              ? "rgba(99, 102, 241, 0.15)"
                              : "var(--surface-1)",
                          color:
                            difficulty === d
                              ? "var(--accent-tertiary)"
                              : "var(--text-secondary)",
                          transition: "all 0.2s",
                        }}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    width: "100%",
                    padding: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <SparklesIcon />
                  Generate roadmap
                </button>
              </div>
            )}
          </form>

          {/* Quick Add */}
          <div
            className="panel animate-fade-in-up delay-300"
            style={{
              borderRadius: "var(--radius-xl)",
              padding: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <h2
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                Quick add task
              </h2>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setShowAddForm((v) => !v)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "0.78rem",
                }}
              >
                <PlusIcon />
                {showAddForm ? "Close" : "Add"}
              </button>
            </div>

            {showAddForm && (
              <form
                onSubmit={onAddItem}
                className="animate-fade-in-up"
                style={{
                  marginTop: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                <div>
                  <label className="label" htmlFor="add-roadmap">Roadmap</label>
                  <select
                    id="add-roadmap"
                    className="input"
                    value={selectedRoadmapId ?? ""}
                    onChange={(e) =>
                      setSelectedRoadmapId(Number(e.target.value))
                    }
                  >
                    <option value="" disabled>
                      Select a roadmap
                    </option>
                    {roadmaps.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="add-title">Title</label>
                  <input
                    id="add-title"
                    className="input"
                    placeholder="What do you need to do?"
                    value={itemTitle}
                    onChange={(e) => setItemTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="add-desc">Notes</label>
                  <textarea
                    id="add-desc"
                    className="input"
                    style={{ minHeight: "60px" }}
                    placeholder="Optional notes…"
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label className="label" htmlFor="add-due">Due date</label>
                    <input
                      id="add-due"
                      type="date"
                      className="input"
                      value={itemDueDate}
                      onChange={(e) => setItemDueDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="add-priority">Priority</label>
                    <select
                      id="add-priority"
                      className="input"
                      value={itemPriority}
                      onChange={(e) => setItemPriority(e.target.value)}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: "100%", padding: "10px" }}
                >
                  Add task
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── RIGHT: ROADMAP LIST ── */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <h2
              className="animate-fade-in"
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              Your roadmaps
            </h2>
            <span
              className="badge badge-neutral animate-fade-in"
            >
              {stats.roadmapCount} roadmaps
            </span>
          </div>

          {dataLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="panel"
                  style={{
                    borderRadius: "var(--radius-xl)",
                    padding: "28px",
                  }}
                >
                  <div className="skeleton" style={{ height: 12, width: "25%", marginBottom: 12 }} />
                  <div className="skeleton" style={{ height: 24, width: "60%", marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 14, width: "80%", marginBottom: 20 }} />
                  <div className="skeleton" style={{ height: 6, width: "100%", borderRadius: "var(--radius-full)" }} />
                </div>
              ))}
            </div>
          ) : roadmaps.length === 0 ? (
            <div
              className="panel animate-fade-in-up"
              style={{
                borderRadius: "var(--radius-xl)",
                padding: "60px 32px",
                textAlign: "center",
              }}
            >
              <RocketIcon />
              <h3
                style={{
                  marginTop: "16px",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                }}
              >
                No roadmaps yet
              </h3>
              <p
                style={{
                  marginTop: "8px",
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  maxWidth: "360px",
                  margin: "8px auto 0",
                }}
              >
                Use the AI generator on the left to create your first learning roadmap.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {roadmaps.map((roadmap, idx) => {
                const total = roadmap.checklist.length;
                const completed = roadmap.checklist.filter(
                  (i) => i.status === "COMPLETED",
                ).length;
                const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
                const isExpanded = expandedRoadmap === roadmap.id;

                return (
                  <article
                    key={roadmap.id}
                    className={`panel animate-fade-in-up delay-${Math.min(idx + 1, 5) * 100}`}
                    style={{
                      borderRadius: "var(--radius-xl)",
                      overflow: "hidden",
                    }}
                  >
                    {/* Roadmap header */}
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedRoadmap(isExpanded ? null : roadmap.id)
                      }
                      style={{
                        width: "100%",
                        padding: "24px 28px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                        textAlign: "left",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "6px",
                            marginBottom: "8px",
                          }}
                        >
                          <span className="badge badge-accent">
                            {roadmap.difficulty}
                          </span>
                          <span className="badge badge-neutral">
                            {roadmap.durationWeeks}w
                          </span>
                          <span className="badge badge-success">
                            {roadmap.status}
                          </span>
                        </div>
                        <h3
                          style={{
                            fontSize: "1.1rem",
                            fontWeight: 700,
                            color: "var(--text-primary)",
                            marginBottom: "4px",
                          }}
                        >
                          {roadmap.title}
                        </h3>
                        <p
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--text-secondary)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {roadmap.goal}
                        </p>
                        {/* Progress bar */}
                        <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
                          <div className="progress-bar" style={{ flex: 1 }}>
                            <div
                              className="progress-bar-fill"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: 700,
                              color: "var(--text-secondary)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {completed}/{total}
                          </span>
                        </div>
                      </div>
                      <div style={{ color: "var(--text-tertiary)", flexShrink: 0 }}>
                        {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                      </div>
                    </button>

                    {/* Expanded: Checklist items */}
                    {isExpanded && (
                      <div
                        className="animate-fade-in"
                        style={{
                          padding: "0 28px 24px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        {roadmap.checklist.length === 0 ? (
                          <p
                            style={{
                              fontSize: "0.82rem",
                              color: "var(--text-tertiary)",
                              padding: "16px 0",
                            }}
                          >
                            No tasks yet. Use quick add to create one.
                          </p>
                        ) : (
                          roadmap.checklist.map((item) => {
                            const meta = priorityMeta[item.priority] || priorityMeta.MEDIUM;
                            const isDone = item.status === "COMPLETED";

                            return (
                              <div
                                key={item.id}
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: "12px",
                                  padding: "14px 16px",
                                  borderRadius: "var(--radius-lg)",
                                  background: "var(--surface-1)",
                                  border: "1px solid var(--border-subtle)",
                                  transition: "all 0.2s",
                                }}
                              >
                                {/* Checkbox */}
                                <button
                                  type="button"
                                  onClick={() => updateItemStatus(item)}
                                  className={`checkbox ${isDone ? "checkbox-checked" : ""}`}
                                  style={{ marginTop: "2px" }}
                                  aria-label={isDone ? "Mark pending" : "Mark completed"}
                                >
                                  {isDone && <CheckIcon />}
                                </button>

                                {/* Content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p
                                    style={{
                                      fontSize: "0.85rem",
                                      fontWeight: 600,
                                      color: isDone
                                        ? "var(--text-tertiary)"
                                        : "var(--text-primary)",
                                      textDecoration: isDone
                                        ? "line-through"
                                        : "none",
                                      transition: "all 0.3s",
                                    }}
                                  >
                                    {item.title}
                                  </p>
                                  {item.description && (
                                    <p
                                      style={{
                                        marginTop: "4px",
                                        fontSize: "0.75rem",
                                        color: "var(--text-tertiary)",
                                        lineHeight: 1.5,
                                      }}
                                    >
                                      {item.description}
                                    </p>
                                  )}
                                  <div
                                    style={{
                                      marginTop: "8px",
                                      display: "flex",
                                      flexWrap: "wrap",
                                      gap: "6px",
                                    }}
                                  >
                                    <span className={`badge ${meta.badgeClass}`}>
                                      {item.priority}
                                    </span>
                                    {item.dueDate && (
                                      <span className="badge badge-neutral">
                                        Due {item.dueDate}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Priority dot */}
                                <div
                                  style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    background: meta.color,
                                    marginTop: "8px",
                                    flexShrink: 0,
                                  }}
                                />
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
