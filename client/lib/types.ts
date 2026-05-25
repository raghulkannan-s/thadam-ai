export type User = {
  id: number;
  email: string | null;
  displayName: string | null;
  role: string | null;
};

export type RoadmapTask = {
  id: number;
  title: string;
  description: string | null;
  orderIndex: number;
  expectedDays: number | null;
};

export type Roadmap = {
  id: number;
  title: string;
  goal: string;
  durationWeeks: number;
  difficulty: string;
  status: string;
  tasks: RoadmapTask[];
};
