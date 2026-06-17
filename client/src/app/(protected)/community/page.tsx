"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/features/auth/context/auth-context";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import type { CommunityRoadmap, PageResponse, VoteResponse } from "@/lib/types";
import Link from "next/link";

export default function CommunityPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [roadmaps, setRoadmaps] = useState<CommunityRoadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [searchTimeout, setSearchTimeout] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const loadCommunity = useCallback(
    async (q?: string) => {
      try {
        const url = q
          ? `/api/roadmaps/search?q=${encodeURIComponent(q)}&size=50`
          : "/api/roadmaps/public?size=50";
        const res = await apiFetch<PageResponse<CommunityRoadmap>>(url);
        setRoadmaps(res.data.content);
      } catch {
        addToast("Failed to load community roadmaps", "error");
      } finally {
        setLoading(false);
      }
    },
    [addToast],
  );

  useEffect(() => {
    if (user) loadCommunity();
  }, [user, loadCommunity]);

  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
    if (!user) return;
    if (!search.trim()) {
      loadCommunity();
      return;
    }
    const t = setTimeout(() => {
      loadCommunity(search.trim());
    }, 400);
    setSearchTimeout(t);
    return () => {
      if (t) clearTimeout(t);
    };
  }, [search, user, loadCommunity, searchTimeout]);

  const handleVote = async (
    roadmapId: number,
    voteType: "UPVOTE" | "DOWNVOTE",
  ) => {
    try {
      const res = await apiFetch<VoteResponse>(
        `/api/roadmaps/${roadmapId}/votes`,
        { method: "POST", body: JSON.stringify({ voteType }) },
      );
      setRoadmaps((prev) =>
        prev.map((r) =>
          r.id === roadmapId
            ? {
                ...r,
                upvoteCount: res.data.upvoteCount,
                downvoteCount: res.data.downvoteCount,
                userVote: res.data.voteType,
              }
            : r,
        ),
      );
    } catch {
      addToast("Failed to vote", "error");
    }
  };

  const handleFork = async (roadmapId: number) => {
    try {
      await apiFetch(`/api/roadmaps/${roadmapId}/fork`, { method: "POST" });
      addToast("Roadmap forked! Check your dashboard.", "success");
    } catch {
      addToast("Failed to fork roadmap", "error");
    }
  };

  const filtered = roadmaps.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.userName.toLowerCase().includes(search.toLowerCase()),
  );
  const sorted = [...filtered].sort(
    (a, b) =>
      b.upvoteCount - b.downvoteCount - (a.upvoteCount - a.downvoteCount),
  );

  if (loading) {
    return (
      <div style={{ padding: "32px 40px", maxWidth: 1000, margin: "0 auto" }}>
        <div
          className="skeleton"
          style={{
            height: 14,
            width: 80,
            marginBottom: 16,
            borderRadius: "var(--radius-full)",
          }}
        />
        <div
          className="skeleton"
          style={{ height: 28, width: 240, marginBottom: 8 }}
        />
        <div
          className="skeleton"
          style={{ height: 14, width: "60%", marginBottom: 24 }}
        />
        <div
          className="skeleton"
          style={{
            height: 44,
            width: "100%",
            marginBottom: 24,
            borderRadius: "var(--radius-lg)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 100, borderRadius: "var(--radius-xl)" }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1000, margin: "0 auto" }}>
      <div className="badge badge-accent" style={{ marginBottom: "16px" }}>
        Community
      </div>
      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        Explore Roadmaps
      </h1>
      <p
        style={{
          marginTop: "8px",
          fontSize: "0.85rem",
          color: "var(--text-secondary)",
        }}
      >
        Discover roadmaps created by the community. Upvote the ones you like, or
        fork them to your dashboard.
      </p>

      <div
        style={{
          position: "relative",
          marginTop: "24px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
            color: "var(--text-tertiary)",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input
          className="input"
          style={{ paddingLeft: "40px" }}
          placeholder="Search roadmaps or authors"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {sorted.length === 0 ? (
        <div
          className="panel"
          style={{
            padding: "40px",
            textAlign: "center",
            borderRadius: "var(--radius-2xl)",
          }}
        >
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            No roadmaps found. Be the first to create one!
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {sorted.map((roadmap, i) => {
            const netScore = roadmap.upvoteCount - roadmap.downvoteCount;
            return (
              <div
                key={roadmap.id}
                className="panel animate-fade-in-up"
                style={{
                  padding: "18px 20px",
                  borderRadius: "var(--radius-xl)",
                  animationDelay: `${i * 50}ms`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "14px",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "2px",
                      minWidth: "44px",
                    }}
                  >
                    <button
                      onClick={() => handleVote(roadmap.id, "UPVOTE")}
                      className="btn btn-ghost"
                      style={{
                        padding: "5px",
                        borderRadius: "var(--radius-md)",
                        color:
                          roadmap.userVote === "UPVOTE"
                            ? "var(--accent-primary)"
                            : "var(--text-tertiary)",
                        background:
                          roadmap.userVote === "UPVOTE"
                            ? "var(--accent-muted)"
                            : "transparent",
                      }}
                      title="Upvote"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="18 15 12 9 6 15" />
                      </svg>
                    </button>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color:
                          netScore > 0
                            ? "var(--accent-secondary)"
                            : netScore < 0
                              ? "var(--error)"
                              : "var(--text-secondary)",
                      }}
                    >
                      {netScore}
                    </span>
                    <button
                      onClick={() => handleVote(roadmap.id, "DOWNVOTE")}
                      className="btn btn-ghost"
                      style={{
                        padding: "5px",
                        borderRadius: "var(--radius-md)",
                        color:
                          roadmap.userVote === "DOWNVOTE"
                            ? "var(--error)"
                            : "var(--text-tertiary)",
                        background:
                          roadmap.userVote === "DOWNVOTE"
                            ? "var(--error-bg)"
                            : "transparent",
                      }}
                      title="Downvote"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "4px",
                        flexWrap: "wrap",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "1rem",
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          margin: 0,
                        }}
                      >
                        {roadmap.title}
                      </h3>
                      {roadmap.forkedFromId && (
                        <span className="badge badge-neutral">Fork</span>
                      )}
                    </div>
                    {roadmap.description && (
                      <p
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--text-secondary)",
                          margin: "3px 0 8px",
                          lineHeight: 1.5,
                        }}
                      >
                        {roadmap.description}
                      </p>
                    )}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        fontSize: "0.75rem",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      <span>
                        by{" "}
                        <strong style={{ color: "var(--text-secondary)" }}>
                          {roadmap.userName}
                        </strong>
                      </span>
                      <span>{roadmap.milestoneCount} milestones</span>
                      <span>{roadmap.taskCount} tasks</span>
                      <span>{roadmap.forkCount} forks</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                    <Link
                      href={`/roadmaps/${roadmap.id}`}
                      className="btn btn-ghost"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "7px 12px",
                        borderRadius: "var(--radius-md)",
                        fontSize: "0.78rem",
                        color: "var(--text-tertiary)",
                        textDecoration: "none",
                      }}
                      title="View details"
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
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      <span>View</span>
                    </Link>
                    <button
                      onClick={() => handleFork(roadmap.id)}
                      className="btn btn-ghost"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "7px 12px",
                        borderRadius: "var(--radius-md)",
                        fontSize: "0.78rem",
                        color: "var(--text-secondary)",
                      }}
                      title="Fork this roadmap"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="6" y1="3" x2="6" y2="15" />
                        <circle cx="18" cy="6" r="3" />
                        <circle cx="6" cy="18" r="3" />
                        <path d="M18 9a9 9 0 0 1-9 9" />
                      </svg>
                      <span>Fork</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
