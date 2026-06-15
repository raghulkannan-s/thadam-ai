export type User = {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "MODERATOR";
};

export type TransactionType = "EARNED" | "SPENT" | "REFUND" | "ADMIN_ADJUSTMENT";
export type MilestoneStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";
export type RoadmapStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type VoteType = "UPVOTE" | "DOWNVOTE";
export type Role = "USER" | "ADMIN" | "MODERATOR";

export type Task = {
  id: number;
  title: string;
  description: string | null;
  milestoneId: number | null;
  roadmapId: number;
  assigneeId: number | null;
  status: TaskStatus;
  priority: TaskPriority;
  orderIndex: number | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Milestone = {
  id: number;
  title: string;
  description: string | null;
  roadmapId: number;
  orderIndex: number | null;
  dueDate: string | null;
  status: MilestoneStatus;
  taskCount: number;
  createdAt: string;
  updatedAt: string;
};

export type Roadmap = {
  id: number;
  title: string;
  description: string | null;
  status: RoadmapStatus;
  userId: number;
  milestoneCount: number;
  taskCount: number;
  forkedFromId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

export type UserResponse = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

export type AdminUserResponse = {
  id: number;
  name: string;
  email: string;
  role: Role;
  active: boolean;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type PageResponse<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  empty: boolean;
};

export type ToastType = "success" | "error" | "info";

export type Toast = {
  id: string;
  message: string;
  type: ToastType;
  exiting?: boolean;
};

export type VoteResponse = {
  id: number | null;
  userId: number | null;
  roadmapId: number;
  voteType: VoteType | null;
  upvoteCount: number;
  downvoteCount: number;
};

export type CommunityRoadmap = {
  id: number;
  title: string;
  description: string | null;
  status: RoadmapStatus;
  userId: number;
  userName: string;
  milestoneCount: number;
  taskCount: number;
  upvoteCount: number;
  downvoteCount: number;
  userVote: VoteType | null;
  forkedFromId: number | null;
  forkCount: number;
  createdAt: string;
  updatedAt: string;
};

export type PublicUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  roadmapCount: number;
};

export type BalanceResponse = {
  userId: number;
  balance: number;
};

export type CoinTransaction = {
  id: number;
  userId: number;
  amount: number;
  balanceAfter: number;
  transactionType: TransactionType;
  description: string | null;
  referenceType: string | null;
  referenceId: number | null;
  createdAt: string;
};
