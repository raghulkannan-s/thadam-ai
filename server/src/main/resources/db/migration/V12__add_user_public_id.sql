ALTER TABLE users ADD COLUMN public_id VARCHAR(255);
UPDATE users SET public_id = gen_random_uuid()::text WHERE public_id IS NULL;
ALTER TABLE users ADD CONSTRAINT users_public_id_key UNIQUE (public_id);
