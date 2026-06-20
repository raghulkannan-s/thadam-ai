-- Add visibility column to roadmaps table
ALTER TABLE roadmaps ADD COLUMN IF NOT EXISTS visibility VARCHAR(255) NOT NULL DEFAULT 'PUBLIC';
