# Упрощенные SQL запросы для диагностики

## Базовые запросы (начните с них)

### 1. Проверить структуру таблицы menohub_users
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'menohub_users';
```

### 2. Проверить структуру таблицы menohub_quiz_results
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'menohub_quiz_results';
```

### 3. Посмотреть все результаты квизов (первые 10)
```sql
SELECT id, user_id, email, test_type, total_score, created_at
FROM menohub_quiz_results
ORDER BY created_at DESC
LIMIT 10;
```

### 4. Посмотреть всех пользователей (первые 10)
```sql
SELECT id, username, telegram_id, created_at
FROM menohub_users
ORDER BY created_at DESC
LIMIT 10;
```

### 5. Найти результаты для конкретного пользователя (замените USER_ID на ваш id)
```sql
SELECT *
FROM menohub_quiz_results
WHERE user_id = USER_ID
ORDER BY created_at DESC;
```

### 6. Проверить, есть ли результаты с NULL user_id
```sql
SELECT COUNT(*) as count_with_null_user_id
FROM menohub_quiz_results
WHERE user_id IS NULL;
```

### 7. Проверить, есть ли результаты с user_id, которого нет в menohub_users
```sql
SELECT qr.id, qr.user_id, qr.test_type, qr.created_at
FROM menohub_quiz_results qr
LEFT JOIN menohub_users u ON qr.user_id = u.id
WHERE qr.user_id IS NOT NULL AND u.id IS NULL;
```

## Если запросы не работают

### Вариант 1: Проверка через Supabase Dashboard
1. Откройте **Table Editor** в Supabase Dashboard
2. Выберите таблицу `menohub_quiz_results`
3. Посмотрите структуру колонок
4. Проверьте данные

### Вариант 2: Использовать API endpoint для диагностики
Я создам временный endpoint `/api/debug/quiz-results` который безопасно вернет информацию.

