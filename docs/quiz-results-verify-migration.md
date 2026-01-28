# Проверка применения миграции

## ✅ Foreign key constraint существует

Из вашего запроса видно, что foreign key constraint создан:
- `constraint_name`: `menohub_quiz_results_user_id_fkey`
- `table_name`: `menohub_quiz_results`
- `column_name`: `user_id`
- `foreign_table_name`: `menohub_users`
- `foreign_column_name`: `id`

## 🔍 Теперь нужно проверить тип данных

Выполните этот запрос, чтобы проверить, был ли применен тип BIGINT:

```sql
SELECT
    column_name,
    data_type,
    numeric_precision,
    numeric_scale
FROM information_schema.columns
WHERE table_name = 'menohub_quiz_results'
  AND column_name = 'user_id';
```

## Ожидаемый результат после миграции:

- `data_type` = `bigint` ✅
- `numeric_precision` = `64` ✅

## Если тип все еще INTEGER:

Если результат показывает `integer` (precision: 32), значит миграция еще не применена.

**Нужно применить миграцию:**
1. Откройте файл `supabase/migrations/014_fix_quiz_results_user_id_bigint.sql`
2. Скопируйте SQL код
3. Выполните в Supabase SQL Editor

## После применения миграции:

1. ✅ Тип изменится на `bigint`
2. ✅ Foreign key constraint будет пересоздан с правильным типом
3. ✅ Результаты квизов должны отображаться в личном кабинете

