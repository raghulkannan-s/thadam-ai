"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/context/auth-context";
import { useToast } from "@/components/ui/Toast";
import { apiFetch } from "@/lib/api";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import type { Roadmap, Milestone, Task, PageResponse } from "@/lib/types";

const priorityMeta: Record<string, { color: string; badgeClass: string }> = {
  CRITICAL: { color: "var(--error)", badgeClass: "badge-error" },
  HIGH: { color: "var(--error)", badgeClass: "badge-error" },
  MEDIUM: { color: "var(--warning)", badgeClass: "badge-warning" },
  LOW: { color: "var(--info)", badgeClass: "badge-accent" },
};

export default function RoadmapDetailPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [addingMilestone, setAddingMilestone] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [roadmapRes, milestonesRes, tasksRes] = await Promise.all([
        apiFetch<Roadmap>(`/api/roadmaps/${id}`),
        apiFetch<Milestone[]>(`/api/roadmaps/${id}/milestones`),
        apiFetch<PageResponse<Task>>(`/api/roadmaps/${id}/tasks`),
      ]);
      setRoadmap(roadmapRes.data);
      setMilestones(milestonesRes.data);
      setTasks(tasksRes.data.content);
    } catch {
      addToast("Failed to load roadmap", "error");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [id, addToast, router]);

  useEffect(() => {
    if (user && id) loadData();
  }, [user, id, loadData]);

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;
    try {
      const res = await apiFetch<Roadmap>(`/api/roadmaps/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editTitle,
          description: editDesc || null,
        }),
      });
      setRoadmap(res.data);
      setEditing(false);
      addToast("Roadmap updated", "success");
    } catch {
      addToast("Failed to update roadmap", "error");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this roadmap?")) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/roadmaps/${id}`, { method: "DELETE" });
      addToast("Roadmap deleted", "success");
      router.push("/dashboard");
    } catch {
      addToast("Failed to delete roadmap", "error");
      setDeleting(false);
    }
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;
    setAddingMilestone(true);
    try {
      const res = await apiFetch<Milestone>(`/api/roadmaps/${id}/milestones`, {
        method: "POST",
        body: JSON.stringify({ title: newMilestoneTitle, description: "" }),
      });
      setMilestones((prev) => [...prev, res.data]);
      setNewMilestoneTitle("");
      addToast("Milestone added", "success");
    } catch {
      addToast("Failed to add milestone", "error");
    } finally {
      setAddingMilestone(false);
    }
  };

  const updateMilestoneStatus = async (milestone: Milestone) => {
    const nextStatus =
      milestone.status === "COMPLETED" ? "IN_PROGRESS" : "COMPLETED";
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === milestone.id
          ? { ...m, status: nextStatus as Milestone["status"] }
          : m,
      ),
    );
    try {
      const res = await apiFetch<Milestone>(
        `/api/roadmaps/milestones/${milestone.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            title: milestone.title,
            description: milestone.description || "",
            status: nextStatus,
          }),
        },
      );
      setMilestones((prev) =>
        prev.map((m) => (m.id === milestone.id ? res.data : m)),
      );
      if (nextStatus === "COMPLETED")
        addToast("Milestone completed!", "success");
    } catch {
      setMilestones((prev) =>
        prev.map((m) => (m.id === milestone.id ? milestone : m)),
      );
    }
  };

  const deleteMilestone = async (milestoneId: number) => {
    if (!confirm("Delete this milestone?")) return;
    try {
      await apiFetch(`/api/roadmaps/milestones/${milestoneId}`, {
        method: "DELETE",
      });
      setMilestones((prev) => prev.filter((m) => m.id !== milestoneId));
      addToast("Milestone deleted", "success");
    } catch {
      addToast("Failed to delete milestone", "error");
    }
  };

  const updateTaskStatus = async (item: Task) => {
    const nextStatus = item.status === "DONE" ? "TODO" : "DONE";
    setTasks((prev) =>
      prev.map((t) =>
        t.id === item.id ? { ...t, status: nextStatus as Task["status"] } : t,
      ),
    );
    try {
      const res = await apiFetch<Task>(`/api/roadmaps/tasks/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      setTasks((prev) => prev.map((t) => (t.id === item.id ? res.data : t)));
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === item.id ? item : t)));
    }
  };

  const deleteTask = async (taskId: number) => {
    if (!confirm("Delete this task?")) return;
    try {
      await apiFetch(`/api/roadmaps/tasks/${taskId}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      addToast("Task deleted", "success");
    } catch {
      addToast("Failed to delete task", "error");
    }
  };

  if (authLoading || loading) return <PageLoader />;
  if (!roadmap) return null;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const percent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const groupedTasks: Record<number | "unassigned", Task[]> = {
    unassigned: [],
  };
  tasks.forEach((t) => {
    const key = t.milestoneId ?? "unassigned";
    if (!groupedTasks[key]) groupedTasks[key] = [];
    groupedTasks[key].push(t);
  });

  return (
    <div style={{ padding: "32px 40px 80px", maxWidth: 960, margin: "0 auto" }}>
      <div className="animate-fade-in-up">
        <p className="badge badge-accent" style={{ marginBottom: "12px" }}>
          {roadmap.status}
          {roadmap.forkedFromId ? " · Forked" : ""}
        </p>

        {editing ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <input
              className="input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Title"
              style={{ fontSize: "1.3rem", fontWeight: 700 }}
            />
            <textarea
              className="input"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="Description"
              style={{ minHeight: 80 }}
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handleSaveEdit}
                className="btn btn-primary btn-sm"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div style={{ flex: 1 }}>
                <h1
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {roadmap.title}
                </h1>
                {roadmap.description && (
                  <p
                    style={{
                      marginTop: "8px",
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.6,
                    }}
                  >
                    {roadmap.description}
                  </p>
                )}
              </div>
              <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                <button
                  onClick={() => {
                    setEditing(true);
                    setEditTitle(roadmap.title);
                    setEditDesc(roadmap.description || "");
                  }}
                  className="btn btn-ghost"
                  style={{ padding: "6px 12px", fontSize: "0.78rem" }}
                  title="Edit"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="btn btn-ghost"
                  style={{
                    padding: "6px 12px",
                    fontSize: "0.78rem",
                    color: "var(--error)",
                  }}
                  title="Delete"
                >
                  {deleting ? (
                    ""
                  ) : (
                    <>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
            <div
              style={{
                marginTop: "16px",
                display: "flex",
                gap: "24px",
                fontSize: "0.8rem",
                color: "var(--text-tertiary)",
              }}
            >
              <span>{milestones.length} milestones</span>
              <span>{totalTasks} tasks</span>
              <span>{completedTasks} done</span>
            </div>
            <div
              style={{
                marginTop: "12px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div className="progress-bar" style={{ flex: 1, maxWidth: 400 }}>
                <div
                  className="progress-bar-fill"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: "var(--text-secondary)",
                }}
              >
                {percent}%
              </span>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
        <style>{`@media (min-width: 768px) { .rd-grid { grid-template-columns: 1fr 2fr !important; } }`}</style>
        <div
          className="rd-grid"
          style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}
        >
          <div>
            <div
              className="panel animate-fade-in-up delay-100"
              style={{ borderRadius: "var(--radius-xl)", padding: "20px" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "14px",
                }}
              >
                <h2
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  Milestones
                </h2>
                <form
                  onSubmit={handleAddMilestone}
                  style={{ display: "flex", gap: "6px" }}
                >
                  <input
                    className="input"
                    style={{
                      width: 140,
                      padding: "6px 10px",
                      fontSize: "0.78rem",
                    }}
                    placeholder="New milestone"
                    value={newMilestoneTitle}
                    onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={addingMilestone || !newMilestoneTitle.trim()}
                    className="btn btn-primary btn-sm"
                    style={{ padding: "6px 10px" }}
                  >
                    {addingMilestone ? "" : "Add"}
                  </button>
                </form>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {milestones.length === 0 ? (
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-tertiary)",
                      padding: "8px 0",
                    }}
                  >
                    No milestones yet. Create your first one.
                  </p>
                ) : (
                  milestones
                    .sort((a, b) => (a.orderIndex ?? 99) - (b.orderIndex ?? 99))
                    .map((m) => (
                      <div
                        key={m.id}
                        className="animate-fade-in"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "10px 12px",
                          borderRadius: "var(--radius-md)",
                          background: "var(--surface-1)",
                          border: "1px solid var(--border-subtle)",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => updateMilestoneStatus(m)}
                          className={`checkbox ${m.status === "COMPLETED" ? "checkbox-checked" : ""}`}
                          style={{ flexShrink: 0 }}
                          aria-label={
                            m.status === "COMPLETED"
                              ? "Mark in progress"
                              : "Mark completed"
                          }
                        >
                          {m.status === "COMPLETED" && (
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="3"
                              strokeLinecap="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </button>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontSize: "0.82rem",
                              fontWeight: 600,
                              color:
                                m.status === "COMPLETED"
                                  ? "var(--text-tertiary)"
                                  : "var(--text-primary)",
                              textDecoration:
                                m.status === "COMPLETED"
                                  ? "line-through"
                                  : "none",
                            }}
                          >
                            {m.title}
                          </p>
                          <p
                            style={{
                              fontSize: "0.68rem",
                              color: "var(--text-tertiary)",
                              marginTop: "2px",
                            }}
                          >
                            {m.taskCount} tasks
                            {m.dueDate ? ` · Due ${m.dueDate}` : ""}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteMilestone(m.id)}
                          className="btn btn-ghost"
                          style={{
                            padding: "4px",
                            color: "var(--text-tertiary)",
                            fontSize: "0.7rem",
                          }}
                          title="Delete milestone"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>

          <div>
            <h2
              style={{
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "14px",
              }}
            >
              Tasks
            </h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {tasks.length === 0 ? (
                <div
                  className="panel"
                  style={{
                    borderRadius: "var(--radius-xl)",
                    padding: "40px",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    No tasks yet. Generate them or add manually from the
                    dashboard.
                  </p>
                </div>
              ) : (
                tasks.map((item) => {
                  const meta =
                    priorityMeta[item.priority] || priorityMeta.MEDIUM;
                  const isDone = item.status === "DONE";
                  const milestone = item.milestoneId
                    ? milestones.find((m) => m.id === item.milestoneId)
                    : null;
                  return (
                    <div
                      key={item.id}
                      className="animate-fade-in"
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        padding: "12px 14px",
                        borderRadius: "var(--radius-lg)",
                        background: "var(--surface-1)",
                        border: "1px solid var(--border-subtle)",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => updateTaskStatus(item)}
                        className={`checkbox ${isDone ? "checkbox-checked" : ""}`}
                        style={{ marginTop: "1px", flexShrink: 0 }}
                        aria-label={isDone ? "Mark pending" : "Mark completed"}
                      >
                        {isDone && (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            color: isDone
                              ? "var(--text-tertiary)"
                              : "var(--text-primary)",
                            textDecoration: isDone ? "line-through" : "none",
                          }}
                        >
                          {item.title}
                        </p>
                        {item.description && (
                          <p
                            style={{
                              marginTop: "3px",
                              fontSize: "0.72rem",
                              color: "var(--text-tertiary)",
                              lineHeight: 1.5,
                            }}
                          >
                            {item.description}
                          </p>
                        )}
                        <div
                          style={{
                            marginTop: "6px",
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "4px",
                            alignItems: "center",
                          }}
                        >
                          <span
                            className={`badge ${meta.badgeClass}`}
                            style={{ fontSize: "0.62rem", padding: "2px 6px" }}
                          >
                            {item.priority}
                          </span>
                          {milestone && (
                            <span
                              className="badge badge-neutral"
                              style={{
                                fontSize: "0.62rem",
                                padding: "2px 6px",
                              }}
                            >
                              {milestone.title}
                            </span>
                          )}
                          {item.dueDate && (
                            <span
                              className="badge badge-neutral"
                              style={{
                                fontSize: "0.62rem",
                                padding: "2px 6px",
                              }}
                            >
                              Due {item.dueDate}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteTask(item.id)}
                        className="btn btn-ghost"
                        style={{
                          padding: "4px",
                          color: "var(--text-tertiary)",
                          flexShrink: 0,
                        }}
                        title="Delete task"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
