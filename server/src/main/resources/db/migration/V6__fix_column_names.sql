DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'update_at'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE users RENAME COLUMN update_at TO updated_at;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'roadmaps' AND column_name = 'update_at'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'roadmaps' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE roadmaps RENAME COLUMN update_at TO updated_at;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'milestones' AND column_name = 'update_at'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'milestones' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE milestones RENAME COLUMN update_at TO updated_at;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tasks' AND column_name = 'update_at'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'tasks' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE tasks RENAME COLUMN update_at TO updated_at;
    END IF;
END $$;
