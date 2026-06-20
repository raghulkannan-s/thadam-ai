import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { RoadmapResponse, TaskResponse } from "@/lib/types";
import { toast } from "sonner";

export function useForkRoadmap() {
  const queryClient = useQueryClient();


  return useMutation({
    mutationFn: async (roadmapId: string) => {
      const res = await apiFetch<RoadmapResponse>(`/api/roadmaps/${roadmapId}/fork`, {
        method: "POST",
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Roadmap forked successfully!");
      queryClient.invalidateQueries({ queryKey: ["roadmaps"] });
    },
    onError: () => {
      toast.error("Failed to fork roadmap.");
    },
  });
}

export function useVoteRoadmap() {
  const queryClient = useQueryClient();


  return useMutation({
    mutationFn: async ({ roadmapId, type }: { roadmapId: string; type: "UPVOTE" | "DOWNVOTE" }) => {
      const res = await apiFetch(`/api/roadmaps/${roadmapId}/votes`, {
        method: "POST",
        body: JSON.stringify({ voteType: type }),
      });
      return res.data;
    },
    onSuccess: (_, variables) => {
      toast.success("Vote recorded!");
      queryClient.invalidateQueries({ queryKey: ["roadmaps", variables.roadmapId] });
      queryClient.invalidateQueries({ queryKey: ["roadmaps", "trending"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to vote.";
      toast.error(message);
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();


  return useMutation({
    mutationFn: async ({ taskId, status }: { taskId: number; status: string }) => {
      const res = await apiFetch<TaskResponse>(`/api/roadmaps/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("Task updated!");
      queryClient.invalidateQueries({ queryKey: ["roadmaps", data.roadmapId, "tasks"] });
      queryClient.invalidateQueries({ queryKey: ["roadmaps", data.roadmapId] });
    },
    onError: () => {
      toast.error("Failed to update task.");
    },
  });
}

export function useGenerateRoadmap() {
  const queryClient = useQueryClient();


  return useMutation({
    mutationFn: async (request: { prompt: string; difficulty: string; durationWeeks: number; estimatedHoursPerDay: number; visibility: string }) => {
      const res = await apiFetch<RoadmapResponse>("/api/roadmaps/generate", {
        method: "POST",
        body: JSON.stringify(request),
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Roadmap generated!");
      queryClient.invalidateQueries({ queryKey: ["roadmaps"] });
    },
    onError: () => {
      toast.error("Failed to generate roadmap. Please try again.");
    },
  });
}

export function useUpdateRoadmap() {
  const queryClient = useQueryClient();


  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { title?: string; description?: string; status?: string; visibility?: string } }) => {
      const res = await apiFetch<RoadmapResponse>(`/api/roadmaps/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("Roadmap updated!");
      queryClient.invalidateQueries({ queryKey: ["roadmaps", data.id] });
      queryClient.invalidateQueries({ queryKey: ["roadmaps"] });
    },
    onError: () => {
      toast.error("Failed to update roadmap.");
    },
  });
}
