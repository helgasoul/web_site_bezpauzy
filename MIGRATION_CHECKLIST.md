# Чеклист выполнения миграций для системы гайдов

## Необходимые миграции (в порядке выполнения)

### ✅ 1. `025_create_resources_table.sql`
**Что делает:** Создает базовую таблицу `menohub_resources` для чеклистов и гайдов.

**Статус:** Должна быть выполнена первой (если еще не выполнена).

**Проверка:**
```sql
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'menohub_resources'
);
```

---

### ✅ 2. `028_add_paid_fields_to_resources.sql`
**Что делает:** Добавляет поля для платных ресурсов:
- `is_paid BOOLEAN DEFAULT FALSE`
- `price_kopecks INTEGER`
- `epub_file_path TEXT`
- `download_limit INTEGER DEFAULT 1`

**Статус:** Должна быть выполнена после `025`.

**Проверка:**
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'menohub_resources' 
AND column_name IN ('is_paid', 'price_kopecks', 'epub_file_path', 'download_limit');
```

---

### ✅ 3. `027_create_resource_purchases_table.sql`
**Что делает:** Создает таблицу `menohub_resource_purchases` для покупок платных гайдов:
- Хранит информацию о покупках
- Генерирует уникальные токены для скачивания
- Отслеживает количество скачиваний (max 1 для платных)

**Статус:** Должна быть выполнена после `025` (может быть до или после `028`, не критично).

**Проверка:**
```sql
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'menohub_resource_purchases'
);
```

**Проверка полей:**
```sql
SELECT column_name, column_default
FROM information_schema.columns 
WHERE table_name = 'menohub_resource_purchases' 
AND column_name IN ('max_downloads', 'download_count', 'download_token');
```

---

### ✅ 4. `043_insert_free_epub_guides.sql`
**Что делает:** Вставляет данные:
- Бесплатный гайд: "Гайд по расширению возможностей в менопаузе"
- Платный гайд: "Антивозрастная медицина 40+" (499₽)

**Статус:** Должна быть выполнена **после всех предыдущих** (`025`, `028`, `027`).

**Проверка:**
```sql
SELECT slug, title, is_paid, price_kopecks, download_limit
FROM menohub_resources
WHERE slug IN (
    'libido-expansion-menopause-guide',
    'anti-aging-medicine-menopause-guide'
);
```

---

## Порядок выполнения

### Вариант 1: Supabase автоматически (рекомендуется)
Если используете `supabase migration up`, миграции выполнятся автоматически по номерам:
1. `025` (создание базовой таблицы)
2. `027` (создание таблицы покупок) ⚠️ *выполнится до 028*
3. `028` (добавление полей для платных)
4. `043` (вставка данных)

**Это нормально!** Миграция `027` не зависит от полей из `028`.

### Вариант 2: Ручное выполнение в SQL Editor
Если выполняете вручную, используйте такой порядок:

1. ✅ `025_create_resources_table.sql`
2. ✅ `028_add_paid_fields_to_resources.sql`
3. ✅ `027_create_resource_purchases_table.sql` (исправленная версия)
4. ✅ `043_insert_free_epub_guides.sql`

---

## Проверка после выполнения всех миграций

### 1. Проверка структуры `menohub_resources`
```sql
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'menohub_resources'
AND column_name IN ('is_paid', 'price_kopecks', 'epub_file_path', 'download_limit')
ORDER BY column_name;
```

**Ожидаемый результат:**
- `is_paid`: `boolean`, default `false`
- `price_kopecks`: `integer`, nullable
- `epub_file_path`: `text`, nullable
- `download_limit`: `integer`, default `1`

### 2. Проверка структуры `menohub_resource_purchases`
```sql
SELECT 
    column_name, 
    data_type, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'menohub_resource_purchases'
AND column_name IN ('max_downloads', 'download_count', 'download_token')
ORDER BY column_name;
```

**Ожидаемый результат:**
- `max_downloads`: `integer`, default `1`
- `download_count`: `integer`, default `0`
- `download_token`: `text`, NOT NULL, UNIQUE

### 3. Проверка данных
```sql
SELECT 
    slug,
    title,
    is_paid,
    price_kopecks,
    download_limit,
    epub_file_path
FROM menohub_resources
WHERE slug IN (
    'libido-expansion-menopause-guide',
    'anti-aging-medicine-menopause-guide'
)
ORDER BY is_paid DESC, slug;
```

**Ожидаемый результат:**
1. `anti-aging-medicine-menopause-guide`: `is_paid = true`, `price_kopecks = 49900`, `download_limit = 1`
2. `libido-expansion-menopause-guide`: `is_paid = false`, `price_kopecks = NULL`, `download_limit = 1` (или NULL)

### 4. Проверка триггера и функции
```sql
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'menohub_resource_purchases';
```

**Ожидаемый результат:**
- `update_resource_purchases_timestamps` trigger существует

```sql
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_name = 'update_resource_purchases_timestamps';
```

**Ожидаемый результат:**
- `update_resource_purchases_timestamps` function существует

### 5. Проверка RLS политик
```sql
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'menohub_resource_purchases';
```

**Ожидаемый результат:**
- 4 политики для service role (INSERT, SELECT, UPDATE, DELETE)

---

## Возможные ошибки и решения

### ❌ Ошибка: "column max_downloads does not exist"
**Причина:** Миграция `027` выполнена, но столбец не был добавлен.

**Решение:** Выполните миграцию `028` или добавьте столбец вручную:
```sql
ALTER TABLE menohub_resource_purchases 
    ADD COLUMN IF NOT EXISTS max_downloads INTEGER DEFAULT 1;
```

### ❌ Ошибка: "relation menohub_resources does not exist"
**Причина:** Миграция `025` не была выполнена.

**Решение:** Выполните миграцию `025` первой.

### ❌ Ошибка: "duplicate key value violates unique constraint"
**Причина:** Данные из `043` уже существуют в таблице.

**Решение:** Используйте `ON CONFLICT DO UPDATE` (уже есть в миграции `043`), или удалите существующие записи:
```sql
DELETE FROM menohub_resources 
WHERE slug IN ('libido-expansion-menopause-guide', 'anti-aging-medicine-menopause-guide');
```

### ❌ Ошибка: "policy already exists"
**Причина:** Политики RLS уже существуют.

**Решение:** Миграция `027` уже содержит `DROP POLICY IF EXISTS`, но если проблема сохраняется, удалите политики вручную:
```sql
DROP POLICY IF EXISTS "Service role can insert purchases" ON menohub_resource_purchases;
DROP POLICY IF EXISTS "Service role can select purchases" ON menohub_resource_purchases;
DROP POLICY IF EXISTS "Service role can update purchases" ON menohub_resource_purchases;
DROP POLICY IF EXISTS "Service role can delete purchases" ON menohub_resource_purchases;
```

---

## Итоговая проверка (все в одном запросе)

```sql
-- Проверка всех компонентов системы гайдов
SELECT 
    'Tables' as component,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_name IN ('menohub_resources', 'menohub_resource_purchases')

UNION ALL

SELECT 
    'Resources columns' as component,
    COUNT(*) as count
FROM information_schema.columns 
WHERE table_name = 'menohub_resources'
AND column_name IN ('is_paid', 'price_kopecks', 'epub_file_path', 'download_limit')

UNION ALL

SELECT 
    'Purchases columns' as component,
    COUNT(*) as count
FROM information_schema.columns 
WHERE table_name = 'menohub_resource_purchases'
AND column_name IN ('max_downloads', 'download_count', 'download_token')

UNION ALL

SELECT 
    'Guides inserted' as component,
    COUNT(*) as count
FROM menohub_resources
WHERE slug IN ('libido-expansion-menopause-guide', 'anti-aging-medicine-menopause-guide')

UNION ALL

SELECT 
    'Triggers' as component,
    COUNT(*) as count
FROM information_schema.triggers
WHERE event_object_table = 'menohub_resource_purchases'

UNION ALL

SELECT 
    'RLS Policies' as component,
    COUNT(*) as count
FROM pg_policies
WHERE tablename = 'menohub_resource_purchases';
```

**Ожидаемый результат:**
- Tables: 2
- Resources columns: 4
- Purchases columns: 3
- Guides inserted: 2
- Triggers: 1
- RLS Policies: 4

---

## Примечания

1. ✅ Миграция `027` исправлена и должна работать корректно
2. ✅ Все миграции используют `IF NOT EXISTS` и `ON CONFLICT DO UPDATE` для безопасности
3. ✅ Миграции идемпотентны (можно выполнять повторно)
4. ⚠️ Миграция `027` была исправлена для правильной работы с существующими таблицами
