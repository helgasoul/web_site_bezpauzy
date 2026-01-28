# Шаг 2: Проверка типа menohub_quiz_results.user_id

## Результат шага 1:
✅ `menohub_users.id` = **bigint** (precision: 64, scale: 0, nullable: NO)

## Шаг 2: Проверьте тип menohub_quiz_results.user_id

Выполните следующий SQL запрос в Supabase SQL Editor:

```sql
SELECT
    column_name,
    data_type,
    numeric_precision,
    numeric_scale,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'menohub_quiz_results'
  AND column_name = 'user_id';
```

## Ожидаемый результат

Если проблема в несоответствии типов (как мы подозреваем), то:
- `data_type` будет `integer` (а не `bigint`)
- Это и есть причина проблемы!

## Что делать дальше

После получения результата:
1. Если `user_id` = `integer` → нужно создать миграцию для изменения на `bigint`
2. Если `user_id` = `bigint` → проблема в другом месте, проверим дальше

