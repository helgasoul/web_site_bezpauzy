-- Add website authentication fields to menohub_users table
-- This allows users to register on the website with username/password
-- and link their account to existing Telegram ID

-- Add username and password_hash columns
ALTER TABLE menohub_users
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Create index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_menohub_users_username ON menohub_users(username);

-- Add comment for documentation
COMMENT ON COLUMN menohub_users.username IS 'Username for website login (optional, can be NULL if user only uses Telegram)';
COMMENT ON COLUMN menohub_users.password_hash IS 'Hashed password for website login (bcrypt hash)';

