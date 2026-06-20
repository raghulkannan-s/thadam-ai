"use client";

import { useState } from "react";
import { useMyRoadmaps } from "@/features/roadmap/api/queries";
import { RoadmapVisibility } from "@/lib/types";
import { Badge } from "@/shared/ui/Badge";
import { RoadmapCardSkeleton } from "@/shared/ui/Skeleton";
import { ErrorState } from "@/shared/ui/ErrorState";
import { EmptyState } from "@/shared/ui/EmptyState";
import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function MyLearningPage() {
  const { data, isLoading, isError, refetch } = useMyRoadmaps();
  const [filter, setFilter] = useState<RoadmapVisibility | "ALL">("ALL");

  const roadmaps = data?.content || [];
  const filtered = filter === "ALL" ? roadmaps : roadmaps.filter(r => r.visibility === filter);

  const filters: Array<{ label: string; value: RoadmapVisibility | "ALL" }> = [
    { label: "All", value: "ALL" },
    { label: "Public", value: "PUBLIC" },
    { label: "Draft", value: "DRAFT" },
    { label: "Private", value: "PRIVATE" },
    { label: "Unlisted", value: "UNLISTED" },
    { label: "Archived", value: "ARCHIVED" },
  ];

  return (
    <div style={{ padding: "32px 40px 80px", maxWidth: 900, margin: "0 auto" }}>
      <div className="animate-fade-in-up">
        <div className="badge badge-accent" style={{ marginBottom: "16px" }}>
          <BookOpen className="w-4 h-4 mr-1" />
          My Learning
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>Your Roadmaps</h1>
        <p style={{ marginTop: "8px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Track and manage your created and forked learning paths.
        </p>
      </div>

      <div className="panel animate-fade-in-up delay-100" style={{ borderRadius: "var(--radius-xl)", padding: "24px", marginTop: "24px" }}>
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "12px", marginBottom: "16px" }}>
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                padding: "6px 12px",
                borderRadius: "16px",
                fontSize: "0.8rem",
                fontWeight: 600,
                border: `1px solid ${filter === f.value ? "var(--accent-primary)" : "var(--border-subtle)"}`,
                background: filter === f.value ? "var(--accent-primary)" : "var(--bg-surface)",
                color: filter === f.value ? "var(--text-inverse)" : "var(--text-secondary)",
                cursor: "pointer",
                whiteSpace: "nowrap"
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
          {isLoading && <><RoadmapCardSkeleton /><RoadmapCardSkeleton /></>}
          {isError && <ErrorState title="Failed to load" message="Could not load your roadmaps." onRetry={refetch} />}
          {!isLoading && !isError && filtered.length === 0 && (
            <div style={{ gridColumn: "1 / -1" }}>
              <EmptyState title="No roadmaps found" description={filter === "ALL" ? "You haven't created any roadmaps yet." : `No roadmaps found with visibility: ${filter}`} />
            </div>
          )}
          {filtered.map(roadmap => (
            <Link key={roadmap.id} href={`/roadmaps/${roadmap.id}`} style={{ textDecoration: "none" }}>
              <div style={{ padding: "16px", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", background: "var(--bg-elevated)", transition: "border-color 0.2s", height: "100%", display: "flex", flexDirection: "column" }}
                   onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent-primary)"}
                   onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border-subtle)"}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{roadmap.title}</h4>
                  <Badge variant={roadmap.visibility === "PUBLIC" ? "success" : "outline"}>{roadmap.visibility}</Badge>
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "12px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", flex: 1 }}>
                  {roadmap.description}
                </p>
                <div style={{ display: "flex", gap: "16px", fontSize: "0.8rem", color: "var(--text-tertiary)", marginTop: "auto" }}>
                  <span>{roadmap.milestoneCount} Milestones</span>
                  <span>{roadmap.taskCount} Tasks</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
