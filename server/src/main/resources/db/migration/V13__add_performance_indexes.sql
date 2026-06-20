CREATE INDEX IF NOT EXISTS idx_roadmaps_popularity ON roadmaps(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_roadmaps_created_at ON roadmaps(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_roadmaps_visibility ON roadmaps(visibility);
CREATE INDEX IF NOT EXISTS idx_milestones_roadmap_id ON milestones(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_tasks_roadmap_id ON tasks(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_tasks_milestone_id ON tasks(milestone_id);
