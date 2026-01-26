-- ============================================================================
-- Добавление RLS политик для таблиц без политик
-- ============================================================================
-- Эти таблицы имеют RLS включен, но без политик заблокированы для всех
-- Создаем политики для service role
-- ============================================================================

-- ============================================================================
-- 1. menohub_chat_logs - Логи чата бота
-- ============================================================================
-- Проверяем существование таблицы перед созданием политик
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'menohub_chat_logs'
    ) THEN
        -- Убеждаемся, что RLS включен
        ALTER TABLE menohub_chat_logs ENABLE ROW LEVEL SECURITY;

        -- Удаляем существующие политики (если есть)
        DROP POLICY IF EXISTS "Service role can insert chat logs" ON menohub_chat_logs;
        DROP POLICY IF EXISTS "Service role can select chat logs" ON menohub_chat_logs;
        DROP POLICY IF EXISTS "Service role can update chat logs" ON menohub_chat_logs;
        DROP POLICY IF EXISTS "Service role can delete chat logs" ON menohub_chat_logs;

        -- Политики для service role (API routes)
        CREATE POLICY "Service role can insert chat logs"
            ON menohub_chat_logs
            FOR INSERT
            WITH CHECK (auth.role() = 'service_role');

        CREATE POLICY "Service role can select chat logs"
            ON menohub_chat_logs
            FOR SELECT
            USING (auth.role() = 'service_role');

        CREATE POLICY "Service role can update chat logs"
            ON menohub_chat_logs
            FOR UPDATE
            USING (auth.role() = 'service_role')
            WITH CHECK (auth.role() = 'service_role');

        CREATE POLICY "Service role can delete chat logs"
            ON menohub_chat_logs
            FOR DELETE
            USING (auth.role() = 'service_role');

        RAISE NOTICE 'RLS политики созданы для menohub_chat_logs';
    ELSE
        RAISE NOTICE 'Таблица menohub_chat_logs не существует, пропускаем';
    END IF;
END $$;

-- ============================================================================
-- 2. menohub_documents - Документы бота
-- ============================================================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'menohub_documents'
    ) THEN
        -- Убеждаемся, что RLS включен
        ALTER TABLE menohub_documents ENABLE ROW LEVEL SECURITY;

        -- Удаляем существующие политики (если есть)
        DROP POLICY IF EXISTS "Service role can insert documents" ON menohub_documents;
        DROP POLICY IF EXISTS "Service role can select documents" ON menohub_documents;
        DROP POLICY IF EXISTS "Service role can update documents" ON menohub_documents;
        DROP POLICY IF EXISTS "Service role can delete documents" ON menohub_documents;

        -- Политики для service role (API routes)
        CREATE POLICY "Service role can insert documents"
            ON menohub_documents
            FOR INSERT
            WITH CHECK (auth.role() = 'service_role');

        CREATE POLICY "Service role can select documents"
            ON menohub_documents
            FOR SELECT
            USING (auth.role() = 'service_role');

        CREATE POLICY "Service role can update documents"
            ON menohub_documents
            FOR UPDATE
            USING (auth.role() = 'service_role')
            WITH CHECK (auth.role() = 'service_role');

        CREATE POLICY "Service role can delete documents"
            ON menohub_documents
            FOR DELETE
            USING (auth.role() = 'service_role');

        RAISE NOTICE 'RLS политики созданы для menohub_documents';
    ELSE
        RAISE NOTICE 'Таблица menohub_documents не существует, пропускаем';
    END IF;
END $$;

-- ============================================================================
-- 3. menohub_queries - Запросы пользователей (возможно, история запросов к боту)
-- ============================================================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'menohub_queries'
    ) THEN
        -- Убеждаемся, что RLS включен
        ALTER TABLE menohub_queries ENABLE ROW LEVEL SECURITY;

        -- Удаляем существующие политики (если есть)
        DROP POLICY IF EXISTS "Service role can insert queries" ON menohub_queries;
        DROP POLICY IF EXISTS "Service role can select queries" ON menohub_queries;
        DROP POLICY IF EXISTS "Service role can update queries" ON menohub_queries;
        DROP POLICY IF EXISTS "Service role can delete queries" ON menohub_queries;

        -- Политики для service role (API routes)
        CREATE POLICY "Service role can insert queries"
            ON menohub_queries
            FOR INSERT
            WITH CHECK (auth.role() = 'service_role');

        CREATE POLICY "Service role can select queries"
            ON menohub_queries
            FOR SELECT
            USING (auth.role() = 'service_role');

        CREATE POLICY "Service role can update queries"
            ON menohub_queries
            FOR UPDATE
            USING (auth.role() = 'service_role')
            WITH CHECK (auth.role() = 'service_role');

        CREATE POLICY "Service role can delete queries"
            ON menohub_queries
            FOR DELETE
            USING (auth.role() = 'service_role');

        RAISE NOTICE 'RLS политики созданы для menohub_queries';
    ELSE
        RAISE NOTICE 'Таблица menohub_queries не существует, пропускаем';
    END IF;
END $$;

-- ============================================================================
-- Проверка: Все ли политики созданы?
-- ============================================================================
-- После выполнения миграции запустите скрипт проверки:
-- supabase/migrations/051_check_rls_status.sql
-- 
-- Эти три таблицы больше не должны показывать "NO POLICIES"
-- ============================================================================

COMMENT ON POLICY "Service role can insert chat logs" ON menohub_chat_logs IS 
    'Service role (API) может создавать логи чата. Доступ контролируется через API routes с проверкой сессии.';

COMMENT ON POLICY "Service role can select chat logs" ON menohub_chat_logs IS 
    'Service role (API) может читать логи чата. Доступ контролируется через API routes с проверкой сессии.';

COMMENT ON POLICY "Service role can insert documents" ON menohub_documents IS 
    'Service role (API) может создавать документы. Доступ контролируется через API routes с проверкой сессии.';

COMMENT ON POLICY "Service role can select documents" ON menohub_documents IS 
    'Service role (API) может читать документы. Доступ контролируется через API routes с проверкой сессии.';

COMMENT ON POLICY "Service role can insert queries" ON menohub_queries IS 
    'Service role (API) может создавать запросы. Доступ контролируется через API routes с проверкой сессии.';

COMMENT ON POLICY "Service role can select queries" ON menohub_queries IS 
    'Service role (API) может читать запросы. Доступ контролируется через API routes с проверкой сессии.';
