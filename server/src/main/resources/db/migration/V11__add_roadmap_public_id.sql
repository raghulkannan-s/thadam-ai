ALTER TABLE roadmaps ADD COLUMN public_id VARCHAR(255);
UPDATE roadmaps SET public_id = gen_random_uuid()::text WHERE public_id IS NULL;
ALTER TABLE roadmaps ADD CONSTRAINT roadmaps_public_id_key UNIQUE (public_id);
