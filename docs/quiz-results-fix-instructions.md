# Инструкции по исправлению проблемы с отображением результатов квизов

## Проблема подтверждена ✅

**Диагностика показала:**
- `menohub_users.id` = `bigint` (precision: 64)
- `menohub_quiz_results.user_id` = `integer` (precision: 32)

**Это несоответствие типов** и есть причина, почему результаты не отображаются в личном кабинете.

## Решение: Применить миграцию

### Шаг 1: Применить миграцию в Supabase

1. Откройте **Supabase Dashboard**
2. Перейдите в **SQL Editor**
3. Скопируйте содержимое файла `supabase/migrations/014_fix_quiz_results_user_id_bigint.sql`
4. Вставьте в SQL Editor
5. Нажмите **Run** (или Ctrl+Enter)

### Шаг 2: Проверить результат

После выполнения миграции, проверьте, что тип изменился:

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

**Ожидаемый результат:**
- `data_type` = `bigint`
- `numeric_precision` = `64`

### Шаг 3: Проверить связь таблиц

Проверьте, что foreign key constraint создан:

```sql
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'menohub_quiz_results'
  AND kcu.column_name = 'user_id';
```

### Шаг 4: Проверить результаты в личном кабинете

1. Обновите страницу личного кабинета
2. Проверьте, отображаются ли результаты квизов
3. Если нет, проверьте логи браузера (F12 → Console)

## Что делает миграция

1. **Удаляет foreign key constraint** (временно, чтобы можно было изменить тип)
2. **Изменяет тип колонки** с `INTEGER` на `BIGINT`
3. **Восстанавливает foreign key constraint** с правильным типом
4. **Пересоздает индекс** для оптимизации запросов

## Безопасность миграции

✅ Миграция безопасна:
- Использует `USING user_id::BIGINT` для безопасного преобразования значений
- Не удаляет данные
- Не изменяет структуру других колонок
- Сохраняет все существующие записи

## Если миграция не работает

Если возникнут ошибки при выполнении миграции:

1. **Проверьте, нет ли активных соединений** к таблице
2. **Проверьте, нет ли блокировок** на таблице
3. **Попробуйте выполнить команды по одной** (разделите миграцию на части)

## После применения миграции

После успешного применения миграции:

1. ✅ Типы данных будут совпадать
2. ✅ Foreign key constraint будет работать правильно
3. ✅ Результаты квизов должны отображаться в личном кабинете

## Дополнительная проверка

Если после миграции результаты все еще не отображаются:

1. Проверьте, есть ли результаты в базе для вашего пользователя:
```sql
SELECT qr.*, u.username
FROM menohub_quiz_results qr
JOIN menohub_users u ON qr.user_id = u.id
WHERE u.username = 'helgasoul'  -- замените на ваш username
ORDER BY qr.created_at DESC;
```

2. Проверьте сессию через диагностический endpoint:
   - Откройте `/api/debug/quiz-results` в браузере
   - Проверьте, какой `userId` в сессии

3. Проверьте логи API:
   - Откройте Network tab в браузере (F12)
   - Найдите запрос к `/api/quiz/get-results`
   - Проверьте ответ и статус

