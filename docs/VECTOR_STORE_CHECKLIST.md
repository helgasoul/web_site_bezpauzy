# Чеклист настройки векторной базы знаний

## ✅ Быстрая проверка

### 1. Запустите скрипт проверки

```bash
npm run vector:check
```

Или:

```bash
node scripts/check-vector-store.js
```

### 2. Если таблица не существует

Выполните миграцию в Supabase Dashboard → SQL Editor:

```sql
-- Скопируйте и выполните содержимое:
-- supabase/migrations/053_setup_vector_store.sql
```

## 📋 Пошаговая проверка вручную

### Шаг 1: Проверка расширения pgvector

В Supabase Dashboard → SQL Editor:

```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

**Если пусто:**
```sql
CREATE EXTENSION vector;
```

### Шаг 2: Проверка таблицы

```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'menohub_documents'
);
```

**Если false:** Выполните миграцию `053_setup_vector_store.sql`

### Шаг 3: Проверка структуры

```sql
SELECT 
  column_name, 
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'menohub_documents';
```

**Должны быть колонки:**
- `id` (uuid)
- `content` (text)
- `embedding` (vector(1536))
- `metadata` (jsonb)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### Шаг 4: Проверка функции

```sql
SELECT routine_name 
FROM information_schema.routines
WHERE routine_schema = 'public' 
  AND routine_name = 'match_menohub_documents';
```

**Если пусто:** Функция не создана, выполните миграцию

### Шаг 5: Проверка документов

```sql
-- Количество документов
SELECT COUNT(*) FROM menohub_documents;

-- Документы с embeddings
SELECT COUNT(*) FROM menohub_documents WHERE embedding IS NOT NULL;
```

## 🔧 Настройка (если нужно)

### Вариант 1: Через миграцию (рекомендуется)

1. Откройте `supabase/migrations/053_setup_vector_store.sql`
2. Скопируйте весь SQL
3. Вставьте в Supabase Dashboard → SQL Editor
4. Выполните

### Вариант 2: Через Supabase CLI

```bash
supabase db push
```

## 📝 Добавление документов

После настройки таблицы добавьте документы:

```sql
INSERT INTO menohub_documents (content, metadata)
VALUES (
  'Текст документа...',
  '{"title": "Название", "category": "симптомы", "age_group": "46-50"}'::jsonb
);
```

## 🔄 Генерация embeddings

После добавления документов:

```bash
npm run vector:generate
```

Или:

```bash
node scripts/generate-embeddings.js
```

## ✅ Итоговый чеклист

- [ ] Расширение `pgvector` установлено
- [ ] Таблица `menohub_documents` создана
- [ ] Колонка `embedding vector(1536)` существует
- [ ] Функция `match_menohub_documents` создана
- [ ] Индекс для векторного поиска создан
- [ ] Документы добавлены в таблицу
- [ ] Embeddings сгенерированы для всех документов
- [ ] Проверка работы: `npm run vector:check` проходит успешно

## 🆘 Если что-то не работает

1. **Проверьте логи** в Supabase Dashboard
2. **Проверьте переменные окружения** в `.env.local`
3. **Убедитесь, что используете Service Role Key** для векторного поиска
4. **Проверьте документацию**: `docs/VECTOR_STORE_SETUP.md`
