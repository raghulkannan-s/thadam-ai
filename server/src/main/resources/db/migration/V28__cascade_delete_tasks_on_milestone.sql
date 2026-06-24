-- Drop the existing ON DELETE SET NULL constraint if it exists (assuming standard Postgres naming)
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_milestone_id_fkey;

-- Re-add the constraint with ON DELETE CASCADE
ALTER TABLE tasks ADD CONSTRAINT tasks_milestone_id_fkey FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE CASCADE;
