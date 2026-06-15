"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/app/components/Toast";
import { apiFetch } from "@/lib/api";
import { AiLoader, PageLoader, Spinner } from "@/app/components/LoadingSpinner";
import { ProgressRing } from "@/app/components/ProgressRing";
import type { Roadmap, Task, PageResponse } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

const difficultyChips = ["Beginner", "Intermediate", "Advanced"];

const priorityMeta: Record<string, { color: string; badgeClass: string }> = {
  CRITICAL: { color: "var(--error)", badgeClass: "badge-error" },
  HIGH: { color: "var(--error)", badgeClass: "badge-error" },
  MEDIUM: { color: "var(--warning)", badgeClass: "badge-warning" },
  LOW: { color: "var(--info)", badgeClass: "badge-accent" },
};

function StatCard({ label, value, color, delay }: { label: string; value: string | number; color: string; delay: string }) {
  return (
    <div className={`panel animate-fade-in-up ${delay}`} style={{ borderRadius: "var(--radius-xl)", padding: "20px 24px", flex: "1 1 140px" }}>
      <p style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--text-tertiary)", marginBottom: "8px" }}>{label}</p>
      <p style={{ fontSize: "1.6rem", fontWeight: 700, color, lineHeight: 1 }}>{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [tasksByRoadmap, setTasksByRoadmap] = useState<Record<number, Task[]>>({});
  const [dataLoading, setDataLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedRoadmap, setExpandedRoadmap] = useState<number | null>(null);

  const [goal, setGoal] = useState("");
  const [durationWeeks, setDurationWeeks] = useState(12);
  const [difficulty, setDifficulty] = useState("Beginner");

  const [selectedRoadmapId, setSelectedRoadmapId] = useState<number | null>(null);
  const [itemTitle, setItemTitle] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemDueDate, setItemDueDate] = useState("");
  const [itemPriority, setItemPriority] = useState("MEDIUM");
  const [showAddForm, setShowAddForm] = useState(false);

  const loadTasks = useCallback(async (roadmapId: number) => {
    try {
      const res = await apiFetch<PageResponse<Task>>(`/api/roadmaps/${roadmapId}/tasks`);
      setTasksByRoadmap((prev) => ({ ...prev, [roadmapId]: res.data.content }));
    } catch {
      setTasksByRoadmap((prev) => ({ ...prev, [roadmapId]: [] }));
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      const res = await apiFetch<PageResponse<Roadmap>>("/api/roadmaps");
      const list = res.data.content;
      setRoadmaps(list);
      if (list.length > 0) {
        setSelectedRoadmapId((prev) => prev ?? list[0].id);
        setExpandedRoadmap((prev) => prev ?? list[0].id);
        await loadTasks(list[0].id);
      }
    } catch {
      addToast("Failed to load roadmaps", "error");
    } finally {
      setDataLoading(false);
    }
  }, [addToast, loadTasks]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) loadData();
  }, [user, authLoading, router, loadData]);

  useEffect(() => {
    if (expandedRoadmap && !tasksByRoadmap[expandedRoadmap]) loadTasks(expandedRoadmap);
  }, [expandedRoadmap, tasksByRoadmap, loadTasks]);

  const onGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;
    setGenerating(true);
    try {
      const res = await apiFetch<Roadmap>("/api/roadmaps/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: `Create a learning roadmap for: ${goal}. Duration: ${durationWeeks} weeks. Difficulty: ${difficulty}. Include milestones and tasks.` }),
      });
      setRoadmaps((prev) => [res.data, ...prev]);
      setSelectedRoadmapId(res.data.id);
      setExpandedRoadmap(res.data.id);
      setGoal("");
      addToast("Roadmap generated!", "success");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to generate roadmap", "error");
    } finally {
      setGenerating(false);
    }
  };

  const onAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoadmapId) { addToast("Select a roadmap first", "info"); return; }
    try {
      const res = await apiFetch<Task>(`/api/roadmaps/${selectedRoadmapId}/tasks`, {
        method: "POST",
        body: JSON.stringify({ title: itemTitle, description: itemDescription || null, dueDate: itemDueDate || null, priority: itemPriority }),
      });
      setTasksByRoadmap((prev) => ({ ...prev, [selectedRoadmapId]: [...(prev[selectedRoadmapId] || []), res.data] }));
      setItemTitle(""); setItemDescription(""); setItemDueDate(""); setShowAddForm(false);
      addToast("Task added", "success");
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to add task", "error");
    }
  };

  const updateItemStatus = async (item: Task) => {
    const nextStatus = item.status === "DONE" ? "TODO" : "DONE";
    setTasksByRoadmap((prev) => ({
      ...prev,
      [item.roadmapId]: (prev[item.roadmapId] || []).map((t) => t.id === item.id ? { ...t, status: nextStatus } : t),
    }));
    try {
      await apiFetch<Task>(`/api/roadmaps/tasks/${item.id}`, { method: "PATCH", body: JSON.stringify({ status: nextStatus }) });
      if (nextStatus === "DONE") addToast("Task completed!", "success");
    } catch {
      setTasksByRoadmap((prev) => ({
        ...prev,
        [item.roadmapId]: (prev[item.roadmapId] || []).map((t) => t.id === item.id ? { ...t, status: item.status } : t),
      }));
      addToast("Failed to update task", "error");
    }
  };

  const deleteRoadmap = async (roadmapId: number) => {
    if (!confirm("Delete this roadmap? This cannot be undone.")) return;
    try {
      await apiFetch(`/api/roadmaps/${roadmapId}`, { method: "DELETE" });
      setRoadmaps((prev) => prev.filter((r) => r.id !== roadmapId));
      addToast("Roadmap deleted", "success");
    } catch { addToast("Failed to delete roadmap", "error"); }
  };

  const deleteTask = async (item: Task) => {
    if (!confirm("Delete this task?")) return;
    try {
      await apiFetch(`/api/roadmaps/tasks/${item.id}`, { method: "DELETE" });
      setTasksByRoadmap((prev) => ({ ...prev, [item.roadmapId]: (prev[item.roadmapId] || []).filter((t) => t.id !== item.id) }));
      addToast("Task deleted", "success");
    } catch { addToast("Failed to delete task", "error"); }
  };

  const allTasks = useMemo(() => Object.values(tasksByRoadmap).flat(), [tasksByRoadmap]);

  const stats = useMemo(() => {
    const completed = allTasks.filter((t) => t.status === "DONE").length;
    const total = allTasks.length;
    return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0, roadmapCount: roadmaps.length };
  }, [allTasks, roadmaps.length]);

  if (authLoading) return <PageLoader />;

  return (
    <div style={{ padding: "32px 24px 80px", maxWidth: "1120px", margin: "0 auto" }}>
      <header className="animate-fade-in-up">
        <p className="badge badge-accent" style={{ marginBottom: "12px" }}>Checklist Studio</p>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
          Welcome back, {user?.name || user?.email || "learner"}.
        </h1>
        <p style={{ marginTop: "6px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Generate AI roadmaps, build checklists, and track your progress.
        </p>
      </header>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "28px" }}>
        <StatCard label="Roadmaps" value={stats.roadmapCount} color="var(--accent-secondary)" delay="delay-100" />
        <StatCard label="Total tasks" value={stats.total} color="var(--text-primary)" delay="delay-200" />
        <StatCard label="Completed" value={stats.completed} color="var(--success)" delay="delay-300" />
        <div className="panel animate-fade-in-up delay-400" style={{ borderRadius: "var(--radius-xl)", padding: "12px 24px", flex: "1 1 140px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ProgressRing value={stats.percent} size={80} strokeWidth={6} label="done" />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px", marginTop: "28px", maxWidth: "100%" }}>
        <style>{`@media (min-width: 900px) { .dash-grid { grid-template-columns: 360px 1fr !important; } }`}</style>
        <div className="dash-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <form onSubmit={onGenerate} className="panel animate-fade-in-up delay-200" style={{ borderRadius: "var(--radius-xl)", padding: "24px", borderColor: "var(--border-accent)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                <div style={{ width: 34, height: 34, borderRadius: "var(--radius-md)", background: "var(--accent-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-inverse)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>AI Roadmap Generator</p>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>Powered by Gemini</p>
                </div>
              </div>

              {generating ? <AiLoader /> : (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label className="label" htmlFor="dash-goal">Learning goal</label>
                    <textarea id="dash-goal" className="input" style={{ minHeight: "80px" }} placeholder="e.g. Learn React + TypeScript from scratch\u2026" value={goal} onChange={(e) => setGoal(e.target.value)} required />
                  </div>
                  <div>
                    <label className="label" htmlFor="dash-duration">Duration (weeks)</label>
                    <input id="dash-duration" type="number" min={1} max={52} className="input" value={durationWeeks} onChange={(e) => setDurationWeeks(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="label">Difficulty</label>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {difficultyChips.map((d) => (
                        <button key={d} type="button" onClick={() => setDifficulty(d)}
                          style={{ padding: "6px 14px", borderRadius: "var(--radius-full)", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", border: difficulty === d ? "1px solid var(--accent-primary)" : "1px solid var(--border-default)", background: difficulty === d ? "var(--accent-muted)" : "var(--surface-1)", color: difficulty === d ? "var(--accent-secondary)" : "var(--text-secondary)", transition: "all 0.2s" }}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                    </svg>
                    Generate roadmap
                  </button>
                </div>
              )}
            </form>

            <div className="panel animate-fade-in-up delay-300" style={{ borderRadius: "var(--radius-xl)", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>Quick add task</p>
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddForm((v) => !v)} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.78rem", padding: "6px 10px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  {showAddForm ? "Close" : "Add"}
                </button>
              </div>

              {showAddForm && (
                <form onSubmit={onAddItem} className="animate-fade-in-up" style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label className="label" htmlFor="add-roadmap">Roadmap</label>
                    <select id="add-roadmap" className="input" value={selectedRoadmapId ?? ""} onChange={(e) => setSelectedRoadmapId(Number(e.target.value))}>
                      <option value="" disabled>Select a roadmap</option>
                      {roadmaps.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor="add-title">Title</label>
                    <input id="add-title" className="input" placeholder="What do you need to do?" value={itemTitle} onChange={(e) => setItemTitle(e.target.value)} required />
                  </div>
                  <div>
                    <label className="label" htmlFor="add-desc">Notes</label>
                    <textarea id="add-desc" className="input" style={{ minHeight: "60px" }} placeholder="Optional notes\u2026" value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <label className="label" htmlFor="add-due">Due date</label>
                      <input id="add-due" type="date" className="input" value={itemDueDate} onChange={(e) => setItemDueDate(e.target.value)} />
                    </div>
                    <div>
                      <label className="label" htmlFor="add-priority">Priority</label>
                      <select id="add-priority" className="input" value={itemPriority} onChange={(e) => setItemPriority(e.target.value)}>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>Add task</button>
                </form>
              )}
            </div>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 className="animate-fade-in" style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>Your roadmaps</h2>
              <span className="badge badge-neutral animate-fade-in">{stats.roadmapCount} roadmaps</span>
            </div>

            {dataLoading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {[1, 2].map((i) => (
                  <div key={i} className="panel" style={{ borderRadius: "var(--radius-xl)", padding: "24px" }}>
                    <div className="skeleton" style={{ height: 12, width: "25%", marginBottom: 12 }} />
                    <div className="skeleton" style={{ height: 22, width: "60%", marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 14, width: "80%", marginBottom: 20 }} />
                    <div className="skeleton" style={{ height: 6, width: "100%", borderRadius: "var(--radius-full)" }} />
                  </div>
                ))}
              </div>
            ) : roadmaps.length === 0 ? (
              <div className="panel animate-fade-in-up" style={{ borderRadius: "var(--radius-xl)", padding: "50px 32px", textAlign: "center" }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto" }}>
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                  <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                  <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                  <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                </svg>
                <p style={{ marginTop: "14px", fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)" }}>No roadmaps yet</p>
                <p style={{ marginTop: "6px", fontSize: "0.82rem", color: "var(--text-secondary)", maxWidth: "320px", margin: "6px auto 0" }}>Use the AI generator to create your first learning roadmap.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {roadmaps.map((roadmap, idx) => {
                  const tasks = tasksByRoadmap[roadmap.id] || [];
                  const completed = tasks.filter((t) => t.status === "DONE").length;
                  const total = tasks.length;
                  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
                  const isExpanded = expandedRoadmap === roadmap.id;

                  return (
                    <article key={roadmap.id} className={`panel animate-fade-in-up ${idx === 0 ? "" : `delay-${Math.min(idx, 4) * 100}`}`} style={{ borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
                      <button type="button" onClick={() => { setExpandedRoadmap(isExpanded ? null : roadmap.id); if (roadmap.id !== expandedRoadmap) loadTasks(roadmap.id); }}
                        style={{ width: "100%", padding: "20px 24px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", textAlign: "left" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "6px" }}>
                            <span className="badge badge-accent">{roadmap.status}</span>
                            <span className="badge badge-neutral">{roadmap.taskCount} tasks</span>
                            {roadmap.forkedFromId && <span className="badge badge-neutral">Forked</span>}
                          </div>
                          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "3px" }}>{roadmap.title}</h3>
                          {roadmap.description && <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{roadmap.description}</p>}
                          <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
                            <div className="progress-bar" style={{ flex: 1 }}><div className="progress-bar-fill" style={{ width: `${percent}%` }} /></div>
                            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{completed}/{total}</span>
                          </div>
                        </div>
                        <div style={{ color: "var(--text-tertiary)", flexShrink: 0, transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "none" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                        </div>
                      </button>

                      <div style={{ padding: "0 24px 4px", display: "flex", justifyContent: "flex-end", gap: "4px" }}>
                        <Link href={`/roadmaps/${roadmap.id}`} onClick={(e) => e.stopPropagation()}
                          className="btn btn-ghost" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", padding: "4px 10px", color: "var(--text-tertiary)", textDecoration: "none" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                          View
                        </Link>
                        <button onClick={async (e) => { e.stopPropagation(); try { await apiFetch(`/api/roadmaps/${roadmap.id}/fork`, { method: "POST" }); addToast("Roadmap forked!", "success"); } catch { addToast("Failed to fork roadmap", "error"); } }}
                          className="btn btn-ghost" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", padding: "4px 10px", color: "var(--text-tertiary)" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="3" x2="6" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" /></svg>
                          Fork
                        </button>
                        <button onClick={async (e) => { e.stopPropagation(); await deleteRoadmap(roadmap.id); }}
                          className="btn btn-ghost" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", padding: "4px 10px", color: "var(--error)" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                          Delete
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="animate-fade-in" style={{ padding: "0 24px 20px", display: "flex", flexDirection: "column", gap: "6px" }}>
                          {tasks.length === 0 ? (
                            <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", padding: "12px 0" }}>No tasks yet. Use quick add to create one.</p>
                          ) : tasks.map((item) => {
                            const meta = priorityMeta[item.priority] || priorityMeta.MEDIUM;
                            const isDone = item.status === "DONE";
                            return (
                                 <div key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px 14px", borderRadius: "var(--radius-lg)", background: "var(--surface-1)", border: "1px solid var(--border-subtle)" }}>
                                <button type="button" onClick={() => updateItemStatus(item)}
                                  className={`checkbox ${isDone ? "checkbox-checked" : ""}`} style={{ marginTop: "1px", flexShrink: 0 }} aria-label={isDone ? "Mark pending" : "Mark completed"}>
                                  {isDone && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                                </button>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <p style={{ fontSize: "0.82rem", fontWeight: 600, color: isDone ? "var(--text-tertiary)" : "var(--text-primary)", textDecoration: isDone ? "line-through" : "none", transition: "all 0.3s" }}>{item.title}</p>
                                  {item.description && <p style={{ marginTop: "3px", fontSize: "0.72rem", color: "var(--text-tertiary)", lineHeight: 1.5 }}>{item.description}</p>}
                                  <div style={{ marginTop: "6px", display: "flex", flexWrap: "wrap", gap: "4px" }}>
                                    <span className={`badge ${meta.badgeClass}`} style={{ fontSize: "0.62rem", padding: "2px 6px" }}>{item.priority}</span>
                                    {item.dueDate && <span className="badge badge-neutral" style={{ fontSize: "0.62rem", padding: "2px 6px" }}>Due {item.dueDate}</span>}
                                  </div>
                                </div>
                                <button onClick={() => deleteTask(item)} className="btn btn-ghost" style={{ padding: "4px", color: "var(--text-tertiary)", flexShrink: 0 }} title="Delete task">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                </button>
                              </div>
                            );
                          })}
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
    </div>
  );
}
