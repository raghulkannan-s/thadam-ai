import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { CommunityRoadmapResponse, PageResponse, RoadmapResponse, MilestoneResponse, TaskResponse } from "@/lib/types";

export function useTrendingRoadmaps() {
  return useQuery({
    queryKey: ["roadmaps", "trending"],
    queryFn: async () => {
      const res = await apiFetch<PageResponse<CommunityRoadmapResponse>>("/api/roadmaps/feed/trending");
      return res.data;
    },
  });
}

export function useSearchRoadmaps(query: string) {
  return useQuery({
    queryKey: ["roadmaps", "search", query],
    queryFn: async () => {
      const res = await apiFetch<PageResponse<CommunityRoadmapResponse>>(`/api/roadmaps/search?q=${encodeURIComponent(query)}`);
      return res.data;
    },
    enabled: query.length > 0,
  });
}

export function useNewestRoadmaps() {
  return useQuery({
    queryKey: ["roadmaps", "newest"],
    queryFn: async () => {
      const res = await apiFetch<PageResponse<CommunityRoadmapResponse>>("/api/roadmaps/feed/newest");
      return res.data;
    },
  });
}

export function useCreatorRoadmaps(userId: string) {
  return useQuery({
    queryKey: ["roadmaps", "creator", userId],
    queryFn: async () => {
      const res = await apiFetch<PageResponse<CommunityRoadmapResponse>>(`/api/roadmaps/user/${userId}`);
      return res.data;
    },
    enabled: !!userId,
  });
}

export function useCreatorProfile(userId: string) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const res = await apiFetch<{ id: string, name: string, username?: string, email?: string }>(`/api/user/${userId}`);
      return res.data;
    },
    enabled: !!userId,
  });
}

export function useRoadmap(id: string) {
  return useQuery({
    queryKey: ["roadmaps", id],
    queryFn: async () => {
      const res = await apiFetch<CommunityRoadmapResponse>(`/api/roadmaps/${id}`);
      return res.data;
    },
  });
}

export function useRoadmapMilestones(id: string) {
  return useQuery({
    queryKey: ["roadmaps", id, "milestones"],
    queryFn: async () => {
      const res = await apiFetch<MilestoneResponse[]>(`/api/roadmaps/${id}/milestones`);
      return res.data;
    },
  });
}

export function useRoadmapTasks(id: string) {
  return useQuery({
    queryKey: ["roadmaps", id, "tasks"],
    queryFn: async () => {
      const res = await apiFetch<PageResponse<TaskResponse>>(`/api/roadmaps/${id}/tasks`);
      return res.data;
    },
  });
}

export function useMyRoadmaps() {
  return useQuery({
    queryKey: ["roadmaps", "my"],
    queryFn: async () => {
      const res = await apiFetch<PageResponse<RoadmapResponse>>("/api/roadmaps");
      return res.data;
    },
  });
}
