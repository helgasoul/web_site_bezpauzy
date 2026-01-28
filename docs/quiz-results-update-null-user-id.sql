-- Шаг 1: Найти ваш user_id в таблице menohub_users
-- Выполните этот запрос, чтобы найти ваш ID

SELECT id, username, telegram_id, email, created_at
FROM menohub_users
WHERE username = 'helgasoul'  -- замените на ваш username
   OR telegram_id = 374683580  -- замените на ваш telegram_id
   OR email = 'o.s.puchkova@icloud.com'  -- или ваш email
ORDER BY created_at DESC;

-- Шаг 2: После того, как узнаете ваш user_id, обновите результат
-- ВАЖНО: Замените YOUR_USER_ID на реальный id из шага 1

UPDATE menohub_quiz_results
SET user_id = YOUR_USER_ID  -- замените на ваш user_id
WHERE id = 'd6c2df50-1f99-44d3-abc1-fcb78aa1fd52'  -- ID результата из запроса
  AND user_id IS NULL;

-- Шаг 3: Проверить результат обновления

SELECT 
    qr.id,
    qr.user_id,
    qr.email,
    qr.test_type,
    qr.total_score,
    qr.severity,
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

-- Альтернативный вариант: Обновить все результаты с NULL user_id по email
-- (используйте только если уверены, что все результаты с этим email принадлежат вам)

-- UPDATE menohub_quiz_results
-- SET user_id = YOUR_USER_ID  -- замените на ваш user_id
-- WHERE user_id IS NULL
--   AND email = 'o.s.puchkova@icloud.com';

