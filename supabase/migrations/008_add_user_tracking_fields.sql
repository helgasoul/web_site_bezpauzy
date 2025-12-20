-- Add user tracking fields to menohub_users table
-- These fields are important for tracking user activity

-- Add query count tracking fields
ALTER TABLE menohub_users
ADD COLUMN IF NOT EXISTS query_count_daily INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS query_count_total INTEGER DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN menohub_users.query_count_daily IS 'Number of queries made today (resets daily)';
COMMENT ON COLUMN menohub_users.query_count_total IS 'Total number of queries made by user';

