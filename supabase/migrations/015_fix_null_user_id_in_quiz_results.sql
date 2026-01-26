-- Fix NULL user_id in menohub_quiz_results
-- This migration helps identify and fix results that were saved without user_id
-- 
-- NOTE: This is a template migration. You need to:
-- 1. Find your user_id from menohub_users table
-- 2. Find results with NULL user_id that belong to you
-- 3. Update them with your user_id
--
-- Example queries are provided in docs/quiz-results-fix-null-user-id.md

-- Step 1: Create a function to help identify results that need fixing
CREATE OR REPLACE FUNCTION find_quiz_results_with_null_user_id()
RETURNS TABLE (
    quiz_result_id UUID,
    quiz_email TEXT,
    test_type TEXT,
    created_at TIMESTAMPTZ,
    suggested_user_id BIGINT,
    suggested_username TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        qr.id,
        qr.email,
        qr.test_type,
        qr.created_at,
        u.id,
        u.username
    FROM menohub_quiz_results qr
    LEFT JOIN menohub_users u ON LOWER(TRIM(qr.email)) = LOWER(TRIM(u.email))
    WHERE qr.user_id IS NULL
      AND qr.email IS NOT NULL
    ORDER BY qr.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Add comment
COMMENT ON FUNCTION find_quiz_results_with_null_user_id() IS 
'Helper function to find quiz results with NULL user_id that might be linked to users by email';

-- NOTE: Actual UPDATE statements should be run manually after identifying the correct user_id
-- Example:
-- UPDATE menohub_quiz_results
-- SET user_id = YOUR_USER_ID
-- WHERE user_id IS NULL AND email = 'YOUR_EMAIL';

