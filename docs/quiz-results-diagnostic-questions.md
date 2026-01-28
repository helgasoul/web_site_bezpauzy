# Вопросы для диагностики проблемы с отображением результатов квизов

## Критически важная информация

### 1. Фактическая структура таблиц в Supabase

**Нужно проверить:**
```sql
-- 1.1. Тип данных menohub_users.id
SELECT 
    column_name, 
    data_type, 
    numeric_precision,
    numeric_scale,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'menohub_users' 
  AND column_name = 'id';

-- 1.2. Тип данных menohub_quiz_results.user_id
SELECT 
    column_name, 
    data_type, 
    numeric_precision,
    numeric_scale,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'menohub_quiz_results' 
  AND column_name = 'user_id';

-- 1.3. Foreign key constraints
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

**Вопросы:**
- Какой фактический тип у `menohub_users.id`? (BIGINT, INTEGER, SERIAL?)
- Какой фактический тип у `menohub_quiz_results.user_id`? (BIGINT, INTEGER?)
- Есть ли foreign key constraint между таблицами?
- Может ли `user_id` быть NULL в `menohub_quiz_results`?

### 2. Существующие данные и их связи

**Нужно проверить:**
```sql
-- 2.1. Все результаты квизов с информацией о пользователях
SELECT 
    qr.id as quiz_result_id,
    qr.user_id as quiz_user_id,
    qr.email as quiz_email,
    qr.test_type,
    qr.total_score,
    qr.created_at as quiz_created_at,
    u.id as user_id_from_users,
    u.username,
    u.telegram_id,
    CASE 
        WHEN qr.user_id = u.id THEN 'MATCH'
        WHEN qr.user_id IS NULL THEN 'NULL_USER_ID'
        WHEN u.id IS NULL THEN 'USER_NOT_FOUND'
        ELSE 'MISMATCH'
    END as link_status
FROM menohub_quiz_results qr
LEFT JOIN menohub_users u ON qr.user_id = u.id
ORDER BY qr.created_at DESC
LIMIT 20;

-- 2.2. Результаты без связанного пользователя
SELECT 
    qr.*,
    'NO_USER' as issue
FROM menohub_quiz_results qr
LEFT JOIN menohub_users u ON qr.user_id = u.id
WHERE u.id IS NULL
ORDER BY qr.created_at DESC;

-- 2.3. Пользователи без результатов
SELECT 
    u.id,
    u.username,
    u.telegram_id,
    COUNT(qr.id) as quiz_count
FROM menohub_users u
LEFT JOIN menohub_quiz_results qr ON u.id = qr.user_id
GROUP BY u.id, u.username, u.telegram_id
HAVING COUNT(qr.id) = 0
ORDER BY u.created_at DESC
LIMIT 10;
```

**Вопросы:**
- Сколько всего записей в `menohub_quiz_results`?
- Сколько записей имеют `user_id = NULL`?
- Сколько записей имеют `user_id`, который не существует в `menohub_users`?
- Есть ли записи с `email`, но без `user_id`?

### 3. Информация о текущем пользователе

**Нужно проверить:**
```sql
-- 3.1. Найти пользователя по username (если известен)
SELECT 
    id,
    username,
    telegram_id,
    email,
    created_at,
    last_activity_at
FROM menohub_users
WHERE username = 'helgasoul'  -- заменить на реальный username
   OR telegram_id = 374683580; -- заменить на реальный telegram_id

-- 3.2. Все результаты для конкретного пользователя
SELECT 
    qr.*,
    u.username,
    u.telegram_id
FROM menohub_quiz_results qr
JOIN menohub_users u ON qr.user_id = u.id
WHERE u.username = 'helgasoul'  -- заменить на реальный username
   OR u.telegram_id = 374683580  -- заменить на реальный telegram_id
ORDER BY qr.created_at DESC;
```

**Вопросы:**
- Какой `id` у пользователя в таблице `menohub_users`?
- Какой `telegram_id` у пользователя?
- Какой `username` у пользователя?
- Есть ли записи в `menohub_quiz_results` с `user_id`, равным `id` пользователя?
- Если есть, почему они не отображаются?

### 4. Сессия и аутентификация

**Нужно проверить в коде:**
- Какой `userId` хранится в cookie `telegram_session`?
- Правильно ли декодируется сессия?
- Соответствует ли `userId` из сессии `id` в таблице `menohub_users`?

**Вопросы:**
- Какой формат `userId` в сессии? (строка, число?)
- Какой тип данных ожидается в API endpoints?
- Есть ли преобразование типов при сохранении/получении?

### 5. Row Level Security (RLS) политики

**Нужно проверить:**
```sql
-- 5.1. RLS политики для menohub_quiz_results
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'menohub_quiz_results';

-- 5.2. RLS политики для menohub_users
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'menohub_users';

-- 5.3. Включен ли RLS
SELECT 
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename IN ('menohub_quiz_results', 'menohub_users');
```

**Вопросы:**
- Включен ли RLS для `menohub_quiz_results`?
- Какие политики существуют?
- Могут ли политики блокировать запросы?
- Какой `role` используется при запросах из API? (authenticated, anon, service_role?)

### 6. Индексы и производительность

**Нужно проверить:**
```sql
-- 6.1. Индексы на menohub_quiz_results
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'menohub_quiz_results';

-- 6.2. Статистика использования индексов
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE tablename = 'menohub_quiz_results';
```

**Вопросы:**
- Есть ли индекс на `user_id`?
- Есть ли индекс на `test_type`?
- Используются ли индексы при запросах?

### 7. Логи и ошибки

**Нужно проверить:**
- Логи сервера при сохранении результатов квиза
- Логи сервера при получении результатов
- Ошибки в консоли браузера
- Ошибки в Network tab браузера

**Вопросы:**
- Есть ли ошибки при сохранении результатов?
- Есть ли ошибки при получении результатов?
- Какие HTTP статусы возвращаются?
- Есть ли ошибки в консоли браузера?

### 8. Процесс сохранения результатов

**Нужно проверить:**
- Когда был пройден квиз MRS?
- Была ли попытка сохранить результаты?
- Успешно ли прошло сохранение?
- Какой `user_id` был использован при сохранении?

**Вопросы:**
- Проходил ли пользователь квиз будучи авторизованным?
- Сохранялись ли результаты автоматически или вручную?
- Есть ли записи в `menohub_quiz_results` с `test_type = 'mrs'`?
- Если есть, какой у них `user_id`?

## Приоритет проверки

### Критический приоритет (сделать первым):
1. ✅ Фактическая структура таблиц (типы данных)
2. ✅ Существующие данные и их связи
3. ✅ Информация о текущем пользователе
4. ✅ Сессия и аутентификация

### Высокий приоритет:
5. ✅ RLS политики
6. ✅ Логи и ошибки

### Средний приоритет:
7. ✅ Индексы и производительность
8. ✅ Процесс сохранения результатов

## Как получить эту информацию

### Вариант 1: Через Supabase Dashboard
1. Открыть Supabase Dashboard
2. Перейти в SQL Editor
3. Выполнить SQL запросы из раздела выше
4. Скопировать результаты

### Вариант 2: Через API (если есть доступ)
- Создать временный endpoint для диагностики
- Выполнить запросы через API

### Вариант 3: Через логи приложения
- Включить подробное логирование в API endpoints
- Проверить логи при сохранении/получении результатов

## Что делать с полученной информацией

1. **Если типы данных не совпадают:**
   - Создать миграцию для исправления типов
   - Применить миграцию

2. **Если данные не связаны:**
   - Найти записи без связи
   - Исправить `user_id` в существующих записях
   - Или создать скрипт для миграции данных

3. **Если RLS блокирует запросы:**
   - Проверить политики
   - Обновить политики для правильной работы

4. **Если сессия не работает:**
   - Проверить формат сессии
   - Исправить декодирование сессии
   - Обновить код для правильной работы с типами

