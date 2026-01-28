# Инструкция по применению миграции 058

## ⚠️ ВАЖНО

Эта миграция обновляет существующие поля подписки в таблице `menohub_users`.

## 🔍 Что делает миграция

### Существующие поля (обновляются):
- ✅ `subscription_plan` (text) - добавляется CHECK constraint
- ✅ `payment_status` (text) - добавляется CHECK constraint  
- ⚠️ `data_subscription_end` → **переименовывается** в `subscription_end_date`
- ⚠️ `subscription_end_date` - **тип изменяется** с TEXT на TIMESTAMPTZ

### Новые поля (создаются):
- ➕ `subscription_status` (text) - новое поле для статуса подписки
- ➕ `last_payment_date` (timestamptz) - дата последнего платежа

### Индексы:
- ➕ `idx_menohub_users_subscription_status`
- ➕ `idx_menohub_users_subscription_end_date`

## 📋 Перед применением

### 1. Создайте резервную копию

```sql
-- В Supabase Dashboard → SQL Editor
-- Экспортируйте данные пользователей с подписками
SELECT * FROM menohub_users 
WHERE subscription_plan IS NOT NULL 
   OR payment_status IS NOT NULL 
   OR data_subscription_end IS NOT NULL;
```

Сохраните результат в CSV на всякий случай.

### 2. Проверьте данные в data_subscription_end

```sql
-- Проверьте, есть ли значения в data_subscription_end
SELECT 
  id,
  subscription_plan,
  data_subscription_end,
  -- Попробуем конвертировать в дату
  CASE 
    WHEN data_subscription_end IS NULL OR data_subscription_end = '' THEN NULL
    ELSE data_subscription_end::TIMESTAMPTZ
  END as converted_date
FROM menohub_users 
WHERE data_subscription_end IS NOT NULL 
  AND data_subscription_end != ''
LIMIT 10;
```

Если видите ошибку конвертации - сообщите мне!

## 🚀 Применение миграции

### Способ 1: Через Supabase Dashboard (рекомендуется)

1. Откройте Supabase Dashboard
2. Перейдите в **SQL Editor**
3. Скопируйте весь текст из файла:
   ```
   supabase/migrations/058_add_subscription_fields.sql
   ```
4. Вставьте в редактор
5. Нажмите **Run** (Ctrl+Enter)

### Способ 2: Через Supabase CLI

```bash
# В корне проекта
supabase db push
```

## ✅ После применения

### 1. Проверьте структуру таблицы

```sql
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'menohub_users'
  AND column_name IN (
    'subscription_status',
    'subscription_plan', 
    'payment_status',
    'subscription_end_date',
    'last_payment_date'
  )
ORDER BY column_name;
```

Ожидаемый результат:
```
last_payment_date      | timestamp with time zone | NULL | YES
payment_status         | text                     | NULL | YES
subscription_end_date  | timestamp with time zone | NULL | YES
subscription_plan      | text                     | NULL | YES
subscription_status    | text                     | 'inactive' | YES
```

### 2. Проверьте CHECK constraints

```sql
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'menohub_users'::regclass
  AND contype = 'c'
  AND conname LIKE '%subscription%' OR conname LIKE '%payment%';
```

### 3. Проверьте индексы

```sql
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'menohub_users'
  AND indexname LIKE '%subscription%';
```

### 4. Проверьте данные пользователей

```sql
-- Все пользователи должны иметь subscription_status = 'inactive' по умолчанию
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE subscription_status = 'inactive') as inactive,
  COUNT(*) FILTER (WHERE subscription_status IS NULL) as null_status
FROM menohub_users;
```

## 🐛 Возможные проблемы

### Проблема 1: Ошибка конвертации data_subscription_end

**Ошибка:**
```
ERROR: invalid input syntax for type timestamp with time zone
```

**Решение:**
Выполните вручную:
```sql
-- Очистите невалидные значения
UPDATE menohub_users 
SET data_subscription_end = NULL
WHERE data_subscription_end IS NOT NULL 
  AND data_subscription_end != ''
  AND data_subscription_end !~ '^\d{4}-\d{2}-\d{2}';

-- Затем примените миграцию снова
```

### Проблема 2: Constraint уже существует

**Ошибка:**
```
ERROR: constraint "menohub_users_subscription_plan_check" already exists
```

**Решение:**
Миграция уже содержит `DROP CONSTRAINT IF EXISTS`, но если ошибка всё равно возникает:
```sql
ALTER TABLE menohub_users 
DROP CONSTRAINT IF EXISTS menohub_users_subscription_plan_check CASCADE;

ALTER TABLE menohub_users 
DROP CONSTRAINT IF EXISTS menohub_users_payment_status_check CASCADE;
```

Затем примените миграцию снова.

## 📊 Статистика после миграции

```sql
-- Общая статистика подписок
SELECT 
  subscription_status,
  subscription_plan,
  COUNT(*) as user_count
FROM menohub_users
GROUP BY subscription_status, subscription_plan
ORDER BY subscription_status, subscription_plan;
```

Ожидаемый результат (для новой БД):
```
inactive | Free    | <все пользователи>
inactive | NULL    | 0
```

---

**Если возникли проблемы** - остановитесь и сообщите мне, я помогу!
