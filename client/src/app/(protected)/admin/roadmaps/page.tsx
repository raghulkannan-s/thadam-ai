"use client";

import { useAuth } from "@/features/auth/context/auth-context";
import { PageLoader } from "@/shared/ui/LoadingSpinner";
import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import type { RoadmapVisibility } from "@/lib/types";
import { Map, User, Calendar, Trash2, Hash } from "lucide-react";
import { cn } from "@/utils/cn";

interface ModerationRoadmap {
  id: string;
  title: string;
  visibility: RoadmapVisibility;
  authorName: string;
  authorId: string;
  createdAt: string;
}

export default function ModerationPage() {
  const { user, isLoading } = useAuth();
  const [roadmaps, setRoadmaps] = useState<ModerationRoadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadRoadmaps = useCallback(async () => {
    try {
      // Using the Moderation endpoint to get all roadmaps
      const res = await apiFetch<any>("/api/moderation/roadmaps?size=100&sort=createdAt,desc");
      setRoadmaps(res.data.content);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load roadmaps");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && (user.role === "ADMIN" || user.role === "MODERATOR")) {
      loadRoadmaps();
    } else {
      setLoading(false);
    }
  }, [user, loadRoadmaps]);

  const handleVisibilityChange = async (roadmapId: string, newVisibility: string) => {
    setUpdatingId(roadmapId);
    try {
      await apiFetch(
        `/api/moderation/roadmaps/${roadmapId}/visibility`,
        {
          method: "PATCH",
          body: JSON.stringify({ visibility: newVisibility }),
        },
      );
      setRoadmaps((prev) => prev.map((r) => (r.id === roadmapId ? { ...r, visibility: newVisibility as RoadmapVisibility } : r)));
      toast.success("Visibility updated successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update visibility");
    } finally {
      setUpdatingId(null);
    }
  };



  if (isLoading || loading) return <PageLoader />;

  if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
    return <PageLoader />;
  }

  return (
    <div className="w-full">
      <div className="animate-fade-in-up mb-8">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">Roadmap Moderation</h1>
        <p className="mt-2 text-[var(--text-secondary)] text-sm max-w-2xl leading-relaxed">
          Hide or completely remove user roadmaps that violate community guidelines or contain inappropriate content.
        </p>
      </div>

      <div className="premium-card overflow-hidden animate-fade-in-up delay-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] text-[var(--text-secondary)]">
              <tr>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Roadmap Details</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Author</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider">Visibility</th>
                <th className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {roadmaps.map((r) => (
                <tr key={r.id} className="hover:bg-[var(--bg-surface)]/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-[var(--text-primary)]">{r.title}</span>
                      <span className="text-[var(--text-tertiary)] flex items-center gap-1.5 mt-1 text-xs opacity-60">
                        <Hash className="h-3 w-3" />
                        {r.id.substring(0, 12)}...
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{r.authorName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(r.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={r.visibility}
                      onChange={(e) => handleVisibilityChange(r.id, e.target.value)}
                      disabled={updatingId === r.id}
                      className={cn(
                        "appearance-none bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-semibold rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all cursor-pointer",
                        updatingId === r.id && "opacity-50 cursor-not-allowed",
                        r.visibility === "PUBLIC" && "text-[var(--success)] border-[var(--success)]/30",
                        r.visibility === "PRIVATE" && "text-[var(--warning)] border-[var(--warning)]/30",
                        r.visibility === "DRAFT" && "text-[var(--text-tertiary)]"
                      )}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: "right 0.5rem center",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "1.5em 1.5em"
                      }}
                    >
                      <option value="PUBLIC">PUBLIC</option>
                      <option value="PRIVATE">PRIVATE</option>
                      <option value="DRAFT">DRAFT</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end transition-opacity">
                      <button
                        onClick={() => handleVisibilityChange(r.id, "PRIVATE")}
                        disabled={updatingId === r.id || r.visibility === "PRIVATE"}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Force Private"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Take Down
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {roadmaps.length === 0 && (
            <div className="p-12 text-center text-[var(--text-tertiary)] flex flex-col items-center justify-center">
              <Map className="h-8 w-8 mb-3 opacity-20" />
              <p>No roadmaps in the moderation queue.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
