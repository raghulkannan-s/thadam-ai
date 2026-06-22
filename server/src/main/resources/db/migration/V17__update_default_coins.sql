-- Update the default value for new users
ALTER TABLE users ALTER COLUMN coins SET DEFAULT 50;

-- Update existing users who have exactly 0 coins to the new baseline 50 coins
-- so they aren't locked out of roadmap generation
UPDATE users SET coins = 50 WHERE coins = 0;
