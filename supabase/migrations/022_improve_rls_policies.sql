-- Improve Row Level Security policies for better security
-- This migration enhances existing RLS policies to be more restrictive

-- ============================================================================
-- 1. Improve quiz_results RLS policies
-- ============================================================================
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow all operations on menohub_quiz_results" ON menohub_quiz_results;

-- Policy: Service role can do everything (for API routes that check auth)
-- API routes verify user session before allowing access
CREATE POLICY "Service role can manage quiz results"
    ON menohub_quiz_results
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Policy: Users can only read their own quiz results (if using Supabase Auth)
-- This is a fallback in case we switch to Supabase Auth in the future
CREATE POLICY "Users can read their own quiz results"
    ON menohub_quiz_results
    FOR SELECT
    USING (
        auth.uid()::text = user_id::text
        OR auth.role() = 'service_role'
    );

-- ============================================================================
-- 2. Improve user_saved_content RLS policies
-- ============================================================================
-- Drop existing permissive policies
DROP POLICY IF EXISTS "Allow all operations on user_saved_content_select" ON menohub_user_saved_content;
DROP POLICY IF EXISTS "Allow all operations on user_saved_content_insert" ON menohub_user_saved_content;
DROP POLICY IF EXISTS "Allow all operations on user_saved_content_update" ON menohub_user_saved_content;
DROP POLICY IF EXISTS "Allow all operations on user_saved_content_delete" ON menohub_user_saved_content;

-- Policy: Service role can do everything (for API routes that check auth)
CREATE POLICY "Service role can manage saved content"
    ON menohub_user_saved_content
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Policy: Users can only access their own saved content (if using Supabase Auth)
CREATE POLICY "Users can manage their own saved content"
    ON menohub_user_saved_content
    FOR ALL
    USING (
        auth.uid()::bigint = user_id
        OR auth.role() = 'service_role'
    )
    WITH CHECK (
        auth.uid()::bigint = user_id
        OR auth.role() = 'service_role'
    );

-- ============================================================================
-- 3. Improve telegram_auth_codes RLS policies
-- ============================================================================
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow all operations on menohub_telegram_auth_codes" ON menohub_telegram_auth_codes;

-- Policy: Only service role can access auth codes (sensitive data)
-- These codes should only be accessible through API routes
CREATE POLICY "Service role can manage auth codes"
    ON menohub_telegram_auth_codes
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- 4. Improve users table RLS policies (more restrictive)
-- ============================================================================
-- The existing policies are already service_role only, but let's make them explicit
-- and add a comment for clarity

COMMENT ON POLICY "Allow service role to insert users" ON menohub_users IS 
    'Only service role (API) can insert users. User registration is handled through API routes.';

COMMENT ON POLICY "Allow service role to select users" ON menohub_users IS 
    'Only service role (API) can select users. Login and user lookup is handled through API routes.';

COMMENT ON POLICY "Allow service role to update users" ON menohub_users IS 
    'Only service role (API) can update users. User updates are handled through authenticated API routes.';

-- ============================================================================
-- 5. Add comments to other tables for documentation
-- ============================================================================
COMMENT ON POLICY "Service role can manage quiz results" ON menohub_quiz_results IS 
    'Only service role (API) can manage quiz results. Access control is enforced at API level through JWT session verification.';

COMMENT ON POLICY "Service role can manage saved content" ON menohub_user_saved_content IS 
    'Only service role (API) can manage saved content. Access control is enforced at API level through JWT session verification.';

COMMENT ON POLICY "Service role can manage auth codes" ON menohub_telegram_auth_codes IS 
    'Only service role (API) can access auth codes. These are sensitive temporary authentication tokens.';

-- ============================================================================
-- 6. Verify RLS is enabled on all critical tables
-- ============================================================================
-- Ensure RLS is enabled (idempotent - won't error if already enabled)
DO $$
BEGIN
    -- Check and enable RLS on critical tables if not already enabled
    -- Note: These should already be enabled, but this ensures it
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'menohub_quiz_results'
    ) THEN
        RAISE NOTICE 'Table menohub_quiz_results does not exist';
    ELSE
        ALTER TABLE menohub_quiz_results ENABLE ROW LEVEL SECURITY;
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'menohub_user_saved_content'
    ) THEN
        ALTER TABLE menohub_user_saved_content ENABLE ROW LEVEL SECURITY;
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'menohub_telegram_auth_codes'
    ) THEN
        ALTER TABLE menohub_telegram_auth_codes ENABLE ROW LEVEL SECURITY;
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'menohub_users'
    ) THEN
        ALTER TABLE menohub_users ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- ============================================================================
-- 6. Improve forum tables RLS policies
-- ============================================================================
-- Forum categories: read-only for everyone (public content)
-- No changes needed - already correct

-- Forum topics: restrict write operations to service role
DROP POLICY IF EXISTS "Service role can insert forum topics" ON menohub_forum_topics;
DROP POLICY IF EXISTS "Service role can update forum topics" ON menohub_forum_topics;

CREATE POLICY "Service role can insert forum topics"
    ON menohub_forum_topics
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update forum topics"
    ON menohub_forum_topics
    FOR UPDATE
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Forum replies: restrict write operations to service role
DROP POLICY IF EXISTS "Service role can insert forum replies" ON menohub_forum_replies;
DROP POLICY IF EXISTS "Service role can update forum replies" ON menohub_forum_replies;

CREATE POLICY "Service role can insert forum replies"
    ON menohub_forum_replies
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update forum replies"
    ON menohub_forum_replies
    FOR UPDATE
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- 7. Create helper function to check if RLS is properly configured
-- ============================================================================
-- Примечание: Функция опциональна. Можно проверить RLS статус вручную через:
-- SELECT tablename, relrowsecurity FROM pg_tables t 
-- JOIN pg_class c ON c.relname = t.tablename 
-- WHERE schemaname = 'public' AND tablename LIKE 'menohub_%';

-- Упрощенная версия функции (опционально)
-- Если функция вызывает ошибки, можно пропустить её создание
-- RLS политики работают независимо от этой функции

-- DROP FUNCTION IF EXISTS check_rls_status();
-- 
-- CREATE OR REPLACE FUNCTION check_rls_status()
-- RETURNS TABLE(table_name TEXT, rls_enabled BOOLEAN, policy_count BIGINT) 
-- LANGUAGE sql
-- STABLE
-- AS $$
--     SELECT 
--         c.relname::TEXT,
--         COALESCE(c.relrowsecurity, false),
--         COALESCE(COUNT(p.polname), 0)::BIGINT
--     FROM pg_class c
--     JOIN pg_namespace n ON n.oid = c.relnamespace
--     LEFT JOIN pg_policy p ON p.polrelid = c.oid
--     WHERE n.nspname = 'public'
--         AND c.relkind = 'r'
--         AND (c.relname LIKE 'menohub_%' OR c.relname IN ('feature_votes', 'platform_events'))
--     GROUP BY c.relname, c.relrowsecurity
--     ORDER BY c.relname;
-- $$;

