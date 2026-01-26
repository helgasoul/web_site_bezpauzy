-- ============================================================================
-- SQL Script для проверки статуса RLS (Row Level Security) политик
-- ============================================================================
-- Этот скрипт проверяет:
-- 1. Включен ли RLS на всех таблицах
-- 2. Количество политик на каждой таблице
-- 3. Детальный список всех политик
--
-- Запустите этот скрипт в Supabase Dashboard → SQL Editor
-- ============================================================================

-- 1. Проверка статуса RLS на всех таблицах проекта
-- ============================================================================
SELECT 
    c.relname AS table_name,
    CASE 
        WHEN c.relrowsecurity THEN '✅ ENABLED'
        ELSE '❌ DISABLED'
    END AS rls_status,
    COALESCE(policy_count.count, 0) AS policy_count
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN (
    SELECT 
        schemaname,
        tablename,
        COUNT(*) AS count
    FROM pg_policies
    WHERE schemaname = 'public'
    GROUP BY schemaname, tablename
) policy_count ON policy_count.tablename = c.relname AND policy_count.schemaname = n.nspname
WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND (
        c.relname LIKE 'menohub_%' 
        OR c.relname IN ('feature_votes', 'platform_events')
    )
ORDER BY 
    CASE WHEN c.relrowsecurity THEN 0 ELSE 1 END,
    c.relname;

-- ============================================================================
-- 2. Детальный список всех политик с типами операций
-- ============================================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    CASE 
        WHEN cmd = 'r' THEN 'SELECT'
        WHEN cmd = 'a' THEN 'INSERT'
        WHEN cmd = 'w' THEN 'UPDATE'
        WHEN cmd = 'd' THEN 'DELETE'
        WHEN cmd = '*' THEN 'ALL'
        ELSE cmd::text
    END AS operation,
    CASE 
        WHEN roles IS NULL OR array_length(roles, 1) IS NULL THEN 'public'
        ELSE array_to_string(roles, ', ')
    END AS roles,
    CASE 
        WHEN qual IS NOT NULL THEN 'YES'
        ELSE 'NO'
    END AS has_using_clause,
    CASE 
        WHEN with_check IS NOT NULL THEN 'YES'
        ELSE 'NO'
    END AS has_with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
    AND (
        tablename LIKE 'menohub_%'
        OR tablename IN ('feature_votes', 'platform_events')
    )
ORDER BY tablename, policyname;

-- ============================================================================
-- 3. Проверка критичных таблиц (должны иметь RLS включен)
-- ============================================================================
-- Критичные таблицы, которые должны иметь RLS включен
WITH critical_tables AS (
    SELECT unnest(ARRAY[
        'menohub_users',
        'menohub_quiz_results',
        'menohub_user_saved_content',
        'menohub_telegram_auth_codes',
        'menohub_newsletter_subscribers',
        'menohub_book_orders',
        'menohub_contact_submissions',
        'menohub_resource_purchases',
        'menohub_user_cookie_preferences',
        'menohub_support_requests'
    ]) AS table_name
)
SELECT 
    ct.table_name,
    CASE 
        WHEN c.relrowsecurity THEN '✅ OK'
        ELSE '❌ MISSING'
    END AS rls_status,
    COALESCE(policy_count.count, 0) AS policy_count
FROM critical_tables ct
LEFT JOIN pg_class c ON c.relname = ct.table_name
LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = 'public'
LEFT JOIN (
    SELECT tablename, COUNT(*) AS count
    FROM pg_policies
    WHERE schemaname = 'public'
    GROUP BY tablename
) policy_count ON policy_count.tablename = ct.table_name
ORDER BY 
    CASE WHEN c.relrowsecurity THEN 0 ELSE 1 END,
    ct.table_name;

-- ============================================================================
-- 4. Проверка публичных таблиц (должны иметь публичное чтение)
-- ============================================================================
-- Таблицы, которые должны иметь публичное чтение (SELECT для всех)
WITH public_tables AS (
    SELECT unnest(ARRAY[
        'menohub_blog_posts',
        'menohub_video_content',
        'menohub_resources',
        'menohub_experts',
        'menohub_testimonials'
    ]) AS table_name
)
SELECT 
    pt.table_name,
    CASE 
        WHEN c.relrowsecurity THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END AS rls_status,
    COALESCE(public_read.count, 0) AS public_read_policies
FROM public_tables pt
LEFT JOIN pg_class c ON c.relname = pt.table_name
LEFT JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = 'public'
LEFT JOIN (
    SELECT 
        tablename,
        COUNT(*) AS count
    FROM pg_policies
    WHERE schemaname = 'public'
        AND cmd = 'r'  -- SELECT operation
        AND (roles IS NULL OR 'public' = ANY(roles) OR 'anon' = ANY(roles))
    GROUP BY tablename
) public_read ON public_read.tablename = pt.table_name
ORDER BY pt.table_name;

-- ============================================================================
-- 5. Проверка таблиц форума
-- ============================================================================
SELECT 
    c.relname AS table_name,
    CASE 
        WHEN c.relrowsecurity THEN '✅ ENABLED'
        ELSE '❌ DISABLED'
    END AS rls_status,
    COALESCE(policy_count.count, 0) AS policy_count
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN (
    SELECT tablename, COUNT(*) AS count
    FROM pg_policies
    WHERE schemaname = 'public'
    GROUP BY tablename
) policy_count ON policy_count.tablename = c.relname
WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND c.relname LIKE 'menohub_forum_%'
ORDER BY c.relname;

-- ============================================================================
-- 6. Таблицы без политик (потенциальная проблема безопасности)
-- ============================================================================
SELECT 
    c.relname AS table_name,
    '⚠️ NO POLICIES' AS status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_policies p ON p.tablename = c.relname AND p.schemaname = n.nspname
WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND c.relrowsecurity = true  -- RLS включен, но политик нет
    AND (
        c.relname LIKE 'menohub_%'
        OR c.relname IN ('feature_votes', 'platform_events')
    )
    AND p.policyname IS NULL
ORDER BY c.relname;

-- ============================================================================
-- КОНЕЦ ПРОВЕРКИ
-- ============================================================================
-- Если вы видите таблицы с "❌ DISABLED" или "⚠️ NO POLICIES" - это проблема!
-- Необходимо:
-- 1. Включить RLS: ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
-- 2. Создать политики через CREATE POLICY
