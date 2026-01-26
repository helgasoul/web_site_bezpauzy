-- Fix user_id type mismatch in menohub_telegram_auth_codes
-- menohub_users.id is BIGINT, but user_id was UUID
-- Solution: Add website_user_id BIGINT column and keep user_id for backward compatibility

-- Add new column for website user ID (BIGINT to match menohub_users.id)
ALTER TABLE menohub_telegram_auth_codes 
ADD COLUMN IF NOT EXISTS website_user_id BIGINT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_menohub_telegram_auth_codes_website_user_id 
ON menohub_telegram_auth_codes(website_user_id);

-- Add comment explaining the columns
COMMENT ON COLUMN menohub_telegram_auth_codes.user_id IS 'Legacy UUID field (may be NULL)';
COMMENT ON COLUMN menohub_telegram_auth_codes.website_user_id IS 'Website user ID from menohub_users table (BIGINT)';

