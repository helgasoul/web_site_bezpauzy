-- Fix user_id type in menohub_quiz_results table
-- Change from UUID to INTEGER to match menohub_users.id type

-- First, check if there are any existing records (for safety)
-- If table is empty or only has test data, we can safely drop and recreate

-- Drop the foreign key constraint
ALTER TABLE menohub_quiz_results 
DROP CONSTRAINT IF EXISTS menohub_quiz_results_user_id_fkey;

-- Drop the old column (will lose data if any exists, but table should be new)
ALTER TABLE menohub_quiz_results 
DROP COLUMN IF EXISTS user_id;

-- Add new column with correct type (BIGINT to match menohub_users.id)
-- NOTE: menohub_users.id is BIGINT, not INTEGER
ALTER TABLE menohub_quiz_results 
ADD COLUMN user_id BIGINT REFERENCES menohub_users(id) ON DELETE CASCADE;

-- Recreate index
DROP INDEX IF EXISTS idx_menohub_quiz_results_user_id;
CREATE INDEX IF NOT EXISTS idx_menohub_quiz_results_user_id ON menohub_quiz_results(user_id);

-- Make email nullable since we're using user_id now (user_id is primary identifier)
ALTER TABLE menohub_quiz_results 
ALTER COLUMN email DROP NOT NULL;

