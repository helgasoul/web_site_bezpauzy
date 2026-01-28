-- ============================================
-- Настройка векторной базы знаний для основного агента
-- ============================================
-- Таблица: menohub_documents
-- Используется: Основной агент (AI Agent) для ответов на вопросы
-- ============================================

-- Шаг 1: Включить расширение pgvector (если не включено)
CREATE EXTENSION IF NOT EXISTS vector;

-- Шаг 2: Создать таблицу menohub_documents
CREATE TABLE IF NOT EXISTS public.menohub_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  embedding vector(1536), -- Размерность для OpenAI embeddings (text-embedding-3-small или text-embedding-ada-002)
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Шаг 3: Создать индексы для производительности

-- Индекс для векторного поиска (ivfflat для cosine similarity)
-- Примечание: ivfflat требует минимум 1000 векторов для эффективной работы
-- Если документов меньше, можно использовать HNSW или убрать индекс временно
CREATE INDEX IF NOT EXISTS menohub_documents_embedding_idx 
ON public.menohub_documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Индекс для метаданных (GIN для JSONB)
CREATE INDEX IF NOT EXISTS menohub_documents_metadata_idx 
ON public.menohub_documents 
USING gin (metadata);

-- Индекс для поиска по тексту (опционально, для fallback)
CREATE INDEX IF NOT EXISTS menohub_documents_content_idx 
ON public.menohub_documents 
USING gin (to_tsvector('russian', content));

-- Шаг 4: Создать функцию для векторного поиска
-- Эта функция используется LangChain SupabaseVectorStore
CREATE OR REPLACE FUNCTION match_menohub_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    menohub_documents.id,
    menohub_documents.content,
    menohub_documents.metadata,
    1 - (menohub_documents.embedding <=> query_embedding) AS similarity
  FROM menohub_documents
  WHERE 
    menohub_documents.embedding IS NOT NULL
    AND 1 - (menohub_documents.embedding <=> query_embedding) > match_threshold
    AND (filter = '{}'::jsonb OR menohub_documents.metadata @> filter)
  ORDER BY menohub_documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Шаг 5: Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_menohub_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER menohub_documents_updated_at
  BEFORE UPDATE ON public.menohub_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_menohub_documents_updated_at();

-- Шаг 6: Комментарии для документации
COMMENT ON TABLE public.menohub_documents IS 'Векторная база знаний для основного агента (AI Agent). Содержит документы с embeddings для семантического поиска.';
COMMENT ON COLUMN public.menohub_documents.embedding IS 'OpenAI embeddings (1536 dimensions). Используется для векторного поиска.';
COMMENT ON COLUMN public.menohub_documents.metadata IS 'Метаданные документа в формате JSONB: {title, category, age_group, source, created_at}';
COMMENT ON FUNCTION match_menohub_documents IS 'Векторный поиск документов по cosine similarity. Используется LangChain SupabaseVectorStore.';

-- Шаг 7: Настройка RLS (опционально, если нужна публичная база знаний)
-- Раскомментируйте, если нужно ограничить доступ

-- ALTER TABLE public.menohub_documents ENABLE ROW LEVEL SECURITY;

-- -- Политика: все могут читать (для публичной базы знаний)
-- CREATE POLICY "Public read access" ON public.menohub_documents
--   FOR SELECT
--   USING (true);

-- -- Политика: только service role может писать
-- CREATE POLICY "Service role write access" ON public.menohub_documents
--   FOR ALL
--   USING (auth.role() = 'service_role');

-- ============================================
-- Проверка настройки
-- ============================================

-- Проверить, что таблица создана
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'menohub_documents'
  ) THEN
    RAISE EXCEPTION 'Таблица menohub_documents не создана!';
  END IF;
END $$;

-- Проверить, что функция создана
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.routines
    WHERE routine_schema = 'public' 
    AND routine_name = 'match_menohub_documents'
  ) THEN
    RAISE EXCEPTION 'Функция match_menohub_documents не создана!';
  END IF;
END $$;

-- Проверить расширение pgvector
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_extension WHERE extname = 'vector'
  ) THEN
    RAISE WARNING 'Расширение pgvector не установлено! Выполните: CREATE EXTENSION vector;';
  END IF;
END $$;
