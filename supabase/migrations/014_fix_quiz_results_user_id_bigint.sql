-- Fix user_id type mismatch in menohub_quiz_results
-- Change from INTEGER to BIGINT to match menohub_users.id type
-- This migration fixes the issue where quiz results are not displayed in user account

-- Step 1: Drop the foreign key constraint (if exists)
ALTER TABLE menohub_quiz_results 
DROP CONSTRAINT IF EXISTS menohub_quiz_results_user_id_fkey;

-- Step 2: Change the column type from INTEGER to BIGINT
-- Using USING clause to safely convert existing values
ALTER TABLE menohub_quiz_results 
ALTER COLUMN user_id TYPE BIGINT USING user_id::BIGINT;

-- Step 3: Recreate the foreign key constraint
ALTER TABLE menohub_quiz_results 
ADD CONSTRAINT menohub_quiz_results_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES menohub_users(id) ON DELETE CASCADE;

-- Step 4: Recreate the index (if it was dropped)
DROP INDEX IF EXISTS idx_menohub_quiz_results_user_id;
CREATE INDEX IF NOT EXISTS idx_menohub_quiz_results_user_id 
ON menohub_quiz_results(user_id);

-- Step 5: Add comment for documentation
COMMENT ON COLUMN menohub_quiz_results.user_id IS 'User ID from menohub_users table (BIGINT to match menohub_users.id type)';

