export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface RegisterResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface AdminUserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export interface PublicUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role?: string;
  roadmapCount?: number;
  avatarUrl?: string;
  bio?: string;
}

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  exiting?: boolean;
}

export type Role = "USER" | "ADMIN" | "CREATOR" | string;

export type RoadmapVisibility = "DRAFT" | "PUBLIC" | "PRIVATE" | "UNLISTED" | "ARCHIVED";

export interface RoadmapResponse {
  id: string;
  title: string;
  description: string;
  status: string;
  visibility: RoadmapVisibility;
  userId: string;
  difficulty: string;
  durationWeeks: number;
  estimatedHoursPerDay: number;
  startDate?: string;
  milestoneCount: number;
  taskCount: number;
  forkedFromId?: string;
  upvoteCount: number;
  downvoteCount: number;
  forkCount: number;  
  createdAt: string;
  updatedAt: string;
}

export interface CommunityRoadmapResponse {
  id: string;
  title: string;
  description: string;
  status: string;
  visibility: RoadmapVisibility;
  userId: string;
  userName: string;
  difficulty: string;
  durationWeeks: number;
  estimatedHoursPerDay: number;
  startDate?: string;
  milestoneCount: number;
  taskCount: number;
  upvoteCount: number;
  downvoteCount: number;
  userVote?: string;
  forkedFromId?: string;
  forkCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface MilestoneResponse {
  id: number;
  title: string;
  description: string;
  roadmapId: string;
  orderIndex: number;
  dueDate?: string;
  status: string;
  taskCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskResponse {
  id: number;
  title: string;
  description: string;
  milestoneId?: number;
  roadmapId: string;
  assigneeId?: string;
  status: string;
  priority: string;
  orderIndex: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
}
