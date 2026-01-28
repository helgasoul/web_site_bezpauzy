# Исправление результатов квизов с NULL user_id

## Проблема обнаружена

Результаты квизов были сохранены с `user_id = NULL` вместо реального ID пользователя. Это происходит, когда:
- Пользователь проходил квиз до авторизации
- Или при сохранении не был правильно определен user_id из сессии

## Решение: Обновить user_id по email

### Шаг 1: Найти все результаты с NULL user_id и их email

```sql
SELECT 
    qr.id as quiz_result_id,
    qr.email,
    qr.test_type,
    qr.created_at,
    u.id as user_id_from_users,
    u.username
FROM menohub_quiz_results qr
LEFT JOIN menohub_users u ON LOWER(TRIM(qr.email)) = LOWER(TRIM(u.email))
WHERE qr.user_id IS NULL
  AND qr.email IS NOT NULL
ORDER BY qr.created_at DESC;
```

### Шаг 2: Найти пользователя по email

Если в таблице `menohub_users` нет колонки `email`, нужно найти пользователя другим способом.

**Вариант A: Если знаете ваш username или telegram_id:**

```sql
-- Найти ваш user_id
SELECT id, username, telegram_id, email
FROM menohub_users
WHERE username = 'helgasoul'  -- замените на ваш username
   OR telegram_id = 374683580; -- замените на ваш telegram_id
```

**Вариант B: Если есть email в menohub_users:**

```sql
-- Найти пользователя по email
SELECT id, username, telegram_id, email
FROM menohub_users
WHERE email = 'o.s.puchkova@icloud.com';  -- замените на ваш email
```

### Шаг 3: Обновить user_id в результатах квизов

После того, как узнаете ваш `user_id`, обновите записи:

```sql
-- ВАЖНО: Замените YOUR_USER_ID на ваш реальный id из menohub_users
-- И замените YOUR_EMAIL на ваш email из результатов

UPDATE menohub_quiz_results
SET user_id = YOUR_USER_ID
WHERE user_id IS NULL
  AND email = 'YOUR_EMAIL'
  AND test_type = 'mrs';  -- или 'inflammation', или уберите это условие для всех типов
```

**Пример (замените на ваши данные):**

```sql
-- Если ваш user_id = 108 (из предыдущих логов)
UPDATE menohub_quiz_results
SET user_id = 108
WHERE user_id IS NULL
  AND email = 'o.s.puchkova@icloud.com';
```

### Шаг 4: Проверить результат

```sql
SELECT 
    qr.id,
    qr.user_id,
    qr.email,
    qr.test_type,
    qr.total_score,
    u.username,
    CASE 
        WHEN qr.user_id = u.id THEN 'MATCH ✅'
        WHEN qr.user_id IS NULL THEN 'NULL_USER_ID ❌'
        WHEN u.id IS NULL THEN 'USER_NOT_FOUND ❌'
        ELSE 'MISMATCH ❌'
    END as link_status
FROM menohub_quiz_results qr
LEFT JOIN menohub_users u ON qr.user_id = u.id
WHERE qr.email = 'o.s.puchkova@icloud.com'  -- ваш email
ORDER BY qr.created_at DESC;
```

## Безопасный способ (рекомендуется)

Если у вас несколько результатов с разными email или вы не уверены, используйте более безопасный подход:

```sql
-- 1. Сначала посмотрите, какие результаты нужно обновить
SELECT 
    qr.id,
    qr.email,
    qr.test_type,
    qr.created_at,
    u.id as suggested_user_id,
    u.username
FROM menohub_quiz_results qr
LEFT JOIN menohub_users u ON LOWER(TRIM(qr.email)) = LOWER(TRIM(u.email))
WHERE qr.user_id IS NULL
  AND qr.email IS NOT NULL
ORDER BY qr.created_at DESC;

-- 2. Если результаты правильные, обновите по одному ID
-- (замените QUIZ_RESULT_ID и USER_ID на реальные значения)
UPDATE menohub_quiz_results
SET user_id = USER_ID
WHERE id = 'QUIZ_RESULT_ID';
```

## После обновления

После обновления `user_id`:
1. ✅ Результаты будут связаны с вашим пользователем
2. ✅ Они появятся в личном кабинете
3. ✅ Статистика в дашборде будет корректной

