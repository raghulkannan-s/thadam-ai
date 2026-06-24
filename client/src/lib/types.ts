export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  coins?: number;
  plan?: "FREE" | "PREMIUM";
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
  coins: number;
  roadmapCount: number;
  forkCount: number;
  upvotes: number;
  downvotes: number;
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
  coins?: number;
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

export type RoadmapCategory = "TECHNOLOGY" | "ARTS" | "SCIENCE" | "HEALTH" | "BUSINESS" | "COOKING" | "LIFESTYLE" | "OTHER";

export interface CommentResponse {
  id: number;
  content: string;
  roadmapId: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  upvoteCount: number;
  downvoteCount: number;
  userVote?: 'UPVOTE' | 'DOWNVOTE';
  replies: CommentResponse[];
  createdAt: string;
}

export interface RoadmapResponse {
  id: string;
  title: string;
  shortTitle?: string;
  description: string;
  status: string;
  visibility: RoadmapVisibility;
  category: RoadmapCategory;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  difficulty: string;
  durationWeeks: number;
  durationType: string;
  durationValue: number;
  estimatedHoursPerDay: number;
  startDate?: string;
  milestoneCount: number;
  taskCount: number;
  commentCount: number;
  forkedFromId?: string;
  hasForked: boolean;
  upvoteCount: number;
  downvoteCount: number;
  forkCount: number;  
  createdAt: string;
  updatedAt: string;
}

export interface CommunityRoadmapResponse {
  id: string;
  title: string;
  shortTitle?: string;
  description: string;
  status: string;
  visibility: RoadmapVisibility;
  category: RoadmapCategory;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  difficulty: string;
  durationWeeks: number;
  durationType: string;
  durationValue: number;
  estimatedHoursPerDay: number;
  startDate?: string;
  milestoneCount: number;
  taskCount: number;
  commentCount: number;
  upvoteCount: number;
  downvoteCount: number;
  userVote?: string;
  forkedFromId?: string;
  hasForked: boolean;
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
