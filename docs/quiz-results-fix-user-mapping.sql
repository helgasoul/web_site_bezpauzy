-- Определение правильного пользователя и обновление результата квиза

-- Шаг 1: Посмотреть подробную информацию о пользователях
SELECT 
    id,
    username,
    telegram_id,
    email,
    created_at,
    last_activity_at
FROM menohub_users
WHERE id IN (110, 111)
ORDER BY created_at;

-- Шаг 2: Проверить, какой пользователь используется в сессии
-- (Это можно проверить через диагностический endpoint /api/debug/quiz-results)

-- Шаг 3: Обновить результат квиза, связав с правильным пользователем
-- Вариант A: Если правильный пользователь - id: 111 (helgasoul)
UPDATE menohub_quiz_results
SET user_id = 111
WHERE id = 'd6c2df50-1f99-44d3-abc1-fcb78aa1fd52'
  AND user_id IS NULL;

-- Вариант B: Если правильный пользователь - id: 110 (telegram_id: 374683580)
-- UPDATE menohub_quiz_results
-- SET user_id = 110
-- WHERE id = 'd6c2df50-1f99-44d3-abc1-fcb78aa1fd52'
--   AND user_id IS NULL;

-- Шаг 4: Проверить результат обновления
SELECT 
    qr.id,
    qr.user_id,
    qr.email,
    qr.test_type,
    qr.total_score,
    qr.severity,
    u.id as user_id_from_users,
    u.username,
    u.telegram_id,
    CASE 
        WHEN qr.user_id = u.id THEN 'MATCH ✅'
        WHEN qr.user_id IS NULL THEN 'NULL_USER_ID ❌'
        WHEN u.id IS NULL THEN 'USER_NOT_FOUND ❌'
        ELSE 'MISMATCH ❌'
    END as link_status
FROM menohub_quiz_results qr
LEFT JOIN menohub_users u ON qr.user_id = u.id
WHERE qr.id = 'd6c2df50-1f99-44d3-abc1-fcb78aa1fd52';

-- Шаг 5: Обновить все результаты с NULL user_id по email (если нужно)
-- UPDATE menohub_quiz_results
-- SET user_id = 111  -- или 110, в зависимости от правильного пользователя
-- WHERE user_id IS NULL
--   AND email = 'o.s.puchkova@icloud.com';

-- Шаг 6: Проверить, что пользователь теперь имеет результаты
SELECT 
    u.id,
    u.username,
    u.telegram_id,
    COUNT(qr.id) as quiz_count
FROM menohub_users u
LEFT JOIN menohub_quiz_results qr ON u.id = qr.user_id
WHERE u.id IN (110, 111)
GROUP BY u.id, u.username, u.telegram_id;

