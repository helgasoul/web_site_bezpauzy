# Настройка векторной базы знаний (menohub_documents)

## 🎯 Цель

Настроить таблицу `menohub_documents` с векторными embeddings для работы основного агента (AI Agent).

## 📋 Что нужно проверить

1. ✅ Расширение `pgvector` установлено в Supabase
2. ✅ Таблица `menohub_documents` существует
3. ✅ Колонка `embedding` типа `vector(1536)` существует
4. ✅ Функция `match_menohub_documents` существует
5. ✅ Индекс для векторного поиска создан

## 🔍 Шаг 1: Проверка текущего состояния

Выполните этот SQL в Supabase Dashboard → SQL Editor:

```sql
-- Проверка расширения pgvector
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Проверка существования таблицы
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'menohub_documents'
);

-- Проверка структуры таблицы (если существует)
SELECT 
  column_name, 
  data_type, 
  character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'menohub_documents'
ORDER BY ordinal_position;

-- Проверка функции match_menohub_documents
SELECT 
  routine_name, 
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public' 
  AND routine_name = 'match_menohub_documents';
```

## 🔧 Шаг 2: Установка расширения pgvector

Если расширение не установлено:

```sql
-- Включить расширение pgvector
CREATE EXTENSION IF NOT EXISTS vector;
```

**Примечание:** В Supabase Cloud это обычно уже включено. Если используете собственный Supabase, убедитесь, что расширение установлено.

## 📝 Шаг 3: Создание таблицы (если не существует)

Если таблица не существует, выполните:

```sql
-- Создание таблицы menohub_documents
CREATE TABLE IF NOT EXISTS public.menohub_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  embedding vector(1536), -- Размерность для OpenAI embeddings
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индекс для векторного поиска
CREATE INDEX IF NOT EXISTS menohub_documents_embedding_idx 
ON public.menohub_documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Индекс для метаданных (для фильтрации)
CREATE INDEX IF NOT EXISTS menohub_documents_metadata_idx 
ON public.menohub_documents 
USING gin (metadata);

-- Комментарии к таблице
COMMENT ON TABLE public.menohub_documents IS 'Векторная база знаний для основного агента';
COMMENT ON COLUMN public.menohub_documents.embedding IS 'OpenAI embeddings (1536 dimensions)';
COMMENT ON COLUMN public.menohub_documents.metadata IS 'Метаданные документа (title, category, age_group и т.д.)';
```

## 🔧 Шаг 4: Создание функции для векторного поиска

Функция `match_menohub_documents` используется LangChain для поиска:

```sql
-- Функция для векторного поиска (match_menohub_documents)
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

-- Комментарий к функции
COMMENT ON FUNCTION match_menohub_documents IS 'Векторный поиск документов по similarity';
```

## 📊 Шаг 5: Структура метаданных

Рекомендуемая структура `metadata` JSONB:

```json
{
  "title": "Название документа",
  "category": "Категория (например: симптомы, лечение)",
  "age_group": "40-45" | "46-50" | "51+",
  "source": "Источник документа",
  "created_at": "2024-01-01T00:00:00Z"
}
```

## 🔄 Шаг 6: Добавление документов с embeddings

Для добавления документов с автоматической генерацией embeddings используйте скрипт или API.

**Пример структуры данных:**

```sql
-- Пример вставки документа (без embedding - будет добавлен через скрипт)
INSERT INTO menohub_documents (content, metadata)
VALUES (
  'Текст документа о менопаузе...',
  '{"title": "Приливы при менопаузе", "category": "симптомы", "age_group": "46-50"}'::jsonb
);
```

## 🛠️ Шаг 7: Генерация embeddings для существующих документов

Если у вас уже есть документы без embeddings, используйте скрипт для их генерации (см. `scripts/generate-embeddings.js`).

## ✅ Шаг 8: Проверка работы

После настройки проверьте:

```sql
-- Проверка количества документов
SELECT COUNT(*) FROM menohub_documents;

-- Проверка документов с embeddings
SELECT COUNT(*) FROM menohub_documents WHERE embedding IS NOT NULL;

-- Проверка структуры метаданных
SELECT 
  id,
  LEFT(content, 50) as content_preview,
  metadata->>'title' as title,
  metadata->>'category' as category,
  metadata->>'age_group' as age_group
FROM menohub_documents
LIMIT 5;
```

## 🔐 Шаг 9: Настройка RLS (Row Level Security)

Если нужно ограничить доступ:

```sql
-- Включить RLS
ALTER TABLE menohub_documents ENABLE ROW LEVEL SECURITY;

-- Политика: все могут читать (для публичной базы знаний)
CREATE POLICY "Public read access" ON menohub_documents
  FOR SELECT
  USING (true);

-- Политика: только service role может писать
CREATE POLICY "Service role write access" ON menohub_documents
  FOR ALL
  USING (auth.role() = 'service_role');
```

## 📝 Полный скрипт настройки

См. `supabase/migrations/053_setup_vector_store.sql` для полного скрипта.

## ⚠️ Важные замечания

1. **Размерность embeddings**: OpenAI использует 1536 измерений
2. **Индекс ivfflat**: Оптимизирован для cosine similarity
3. **Threshold**: По умолчанию 0.7 (можно настроить)
4. **Производительность**: Индекс создается автоматически при использовании ivfflat

## 🔗 Полезные ссылки

- [Supabase Vector Store](https://supabase.com/docs/guides/ai/vector-columns)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [LangChain Supabase Integration](https://js.langchain.com/docs/integrations/vectorstores/supabase)
