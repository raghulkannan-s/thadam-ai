export type User = {
  id: number;
  email: string | null;
  displayName: string | null;
  role: string | null;
};

export type ChecklistItem = {
  id: number;
  title: string;
  description: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  dueDate: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  orderIndex: number;
};

export type Roadmap = {
  id: number;
  title: string;
  goal: string;
  durationWeeks: number;
  difficulty: string;
  status: string;
  detailJson: string | null;
  checklist: ChecklistItem[];
};

export type ToastType = "success" | "error" | "info";

export type Toast = {
  id: string;
  message: string;
  type: ToastType;
  exiting?: boolean;
};
