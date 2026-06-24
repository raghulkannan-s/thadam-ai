import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { CommunityRoadmapResponse, PageResponse, RoadmapResponse, MilestoneResponse, TaskResponse, CommentResponse } from "@/lib/types";

export function useTrendingRoadmaps(category?: string) {
  return useQuery({
    queryKey: ["roadmaps", "trending", category],
    queryFn: async () => {
      const url = category ? `/api/roadmaps/feed/trending?category=${category}` : "/api/roadmaps/feed/trending";
      const res = await apiFetch<PageResponse<CommunityRoadmapResponse>>(url);
      return res.data;
    },
  });
}

export function useSearchRoadmaps(query: string, category?: string) {
  return useQuery({
    queryKey: ["roadmaps", "search", query, category],
    queryFn: async () => {
      const url = category 
        ? `/api/roadmaps/search?q=${encodeURIComponent(query)}&category=${category}` 
        : `/api/roadmaps/search?q=${encodeURIComponent(query)}`;
      const res = await apiFetch<PageResponse<CommunityRoadmapResponse>>(url);
      return res.data;
    },
    enabled: query.length > 0,
  });
}

export function useNewestRoadmaps(category?: string) {
  return useQuery({
    queryKey: ["roadmaps", "newest", category],
    queryFn: async () => {
      const url = category ? `/api/roadmaps/feed/newest?category=${category}` : "/api/roadmaps/feed/newest";
      const res = await apiFetch<PageResponse<CommunityRoadmapResponse>>(url);
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
      const res = await apiFetch<{ id: string, name: string, username?: string, email?: string, avatarUrl?: string }>(`/api/user/${userId}`);
      return res.data;
    },
    enabled: !!userId,
  });
}

export function usePublicProfile(userId: string) {
  return useQuery({
    queryKey: ["user", "public", userId],
    queryFn: async () => {
      const res = await apiFetch<any>(`/api/user/public/${userId}`);
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
    refetchInterval: (query) => {
      const status = (query.state.data as any)?.status;
      return status === 'GENERATING' ? 2000 : false;
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

export function useRoadmapComments(id: string) {
  return useQuery({
    queryKey: ["roadmaps", id, "comments"],
    queryFn: async () => {
      const res = await apiFetch<CommentResponse[]>(`/api/roadmaps/${id}/comments`);
      return res.data;
    },
    enabled: !!id,
  });
}
