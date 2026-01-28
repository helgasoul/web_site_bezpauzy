# План решения проблемы: Результаты квизов не отображаются в личном кабинете

## Проблема
Результаты квиза MRS не подтягиваются в личный кабинет, хотя пользователь проходил квиз. Это указывает на проблему со связью между таблицами и запросами данных.

## Анализ текущей ситуации

### 1. Структура таблиц

**menohub_users:**
- `id`: BIGINT (согласно миграции 013)
- `telegram_id`: BIGINT
- `username`: TEXT
- `email`: может отсутствовать

**menohub_quiz_results:**
- `id`: UUID
- `user_id`: INTEGER (согласно миграции 011) - **НЕСООТВЕТСТВИЕ ТИПОВ!**
- `email`: TEXT (nullable)
- `test_type`: TEXT ('mrs', 'inflammation', 'menopause_stage')
- `total_score`: INTEGER
- `severity`: TEXT
- `created_at`: TIMESTAMPTZ

**Проблема:** `menohub_users.id` это BIGINT, а `menohub_quiz_results.user_id` это INTEGER. Это может вызывать проблемы при связывании.

### 2. Процесс сохранения результатов

**Файл:** `app/api/quiz/save-results/route.ts`
- Получает `userId` из сессии (`telegram_session` cookie)
- Преобразует `userId` в `number` (INTEGER)
- Сохраняет в `menohub_quiz_results` с `user_id: userId`
- **Проблема:** Если `userId` из сессии это BIGINT, а мы сохраняем как INTEGER, может быть потеря данных или несоответствие

### 3. Процесс получения результатов

**Файл:** `app/api/quiz/get-results/route.ts`
- Получает `userId` из сессии
- Ищет результаты по `user_id.eq.${userId}`
- **Проблема:** Если типы не совпадают, запрос может не найти результаты

**Файл:** `app/api/quiz/history/route.ts`
- Получает `userId` из сессии
- Преобразует в `number` (INTEGER)
- Ищет по `user_id.eq.${userId}`
- **Проблема:** Та же проблема с типами

### 4. Отображение в личном кабинете

**Файл:** `components/account/AccountDashboard.tsx`
- Вызывает `/api/quiz/get-results` для получения статистики
- Отображает количество результатов

**Файл:** `components/account/QuizResultsHistory.tsx`
- Вызывает `/api/quiz/get-results` для получения всех результатов
- Отображает детальную информацию

## План решения

### Этап 1: Диагностика (ПРИОРИТЕТ: ВЫСОКИЙ)

1. **Проверить фактическую структуру таблиц в Supabase**
   ```sql
   -- Проверить тип menohub_users.id
   SELECT column_name, data_type, numeric_precision 
   FROM information_schema.columns 
   WHERE table_name = 'menohub_users' AND column_name = 'id';
   
   -- Проверить тип menohub_quiz_results.user_id
   SELECT column_name, data_type, numeric_precision 
   FROM information_schema.columns 
   WHERE table_name = 'menohub_quiz_results' AND column_name = 'user_id';
   ```

2. **Проверить существующие записи**
   ```sql
   -- Проверить, есть ли результаты для пользователя
   SELECT qr.*, u.id as user_id_from_users, u.username
   FROM menohub_quiz_results qr
   LEFT JOIN menohub_users u ON qr.user_id = u.id
   ORDER BY qr.created_at DESC
   LIMIT 10;
   
   -- Проверить, есть ли пользователь в menohub_users
   SELECT id, username, telegram_id, created_at
   FROM menohub_users
   ORDER BY created_at DESC
   LIMIT 10;
   ```

3. **Проверить сессию пользователя**
   - Добавить логирование в `app/api/quiz/get-results/route.ts`
   - Проверить, какой `userId` приходит из сессии
   - Проверить, есть ли этот `userId` в `menohub_users`

### Этап 2: Исправление несоответствия типов (ПРИОРИТЕТ: КРИТИЧЕСКИЙ)

1. **Создать миграцию для исправления типа `user_id`**
   ```sql
   -- Файл: supabase/migrations/014_fix_quiz_results_user_id_bigint.sql
   -- Изменить user_id с INTEGER на BIGINT для соответствия menohub_users.id
   
   -- 1. Удалить foreign key constraint
   ALTER TABLE menohub_quiz_results 
   DROP CONSTRAINT IF EXISTS menohub_quiz_results_user_id_fkey;
   
   -- 2. Изменить тип колонки
   ALTER TABLE menohub_quiz_results 
   ALTER COLUMN user_id TYPE BIGINT USING user_id::BIGINT;
   
   -- 3. Восстановить foreign key constraint
   ALTER TABLE menohub_quiz_results 
   ADD CONSTRAINT menohub_quiz_results_user_id_fkey 
   FOREIGN KEY (user_id) REFERENCES menohub_users(id) ON DELETE CASCADE;
   
   -- 4. Пересоздать индекс
   DROP INDEX IF EXISTS idx_menohub_quiz_results_user_id;
   CREATE INDEX IF NOT EXISTS idx_menohub_quiz_results_user_id 
   ON menohub_quiz_results(user_id);
   ```

### Этап 3: Исправление кода сохранения (ПРИОРИТЕТ: ВЫСОКИЙ)

1. **Обновить `app/api/quiz/save-results/route.ts`**
   - Убедиться, что `userId` преобразуется в правильный тип (BIGINT)
   - Добавить проверку существования пользователя перед сохранением
   - Добавить логирование для отладки

2. **Обновить `app/api/quiz/get-results/route.ts`**
   - Убедиться, что `userId` правильно преобразуется
   - Добавить fallback поиск по `email`, если `user_id` не найден
   - Улучшить логирование

3. **Обновить `app/api/quiz/history/route.ts`**
   - Убедиться, что `userId` правильно преобразуется
   - Добавить логирование

### Этап 4: Исправление миграций (ПРИОРИТЕТ: СРЕДНИЙ)

1. **Обновить `supabase/migrations/011_fix_quiz_results_user_id_type.sql`**
   - Изменить `INTEGER` на `BIGINT` для соответствия `menohub_users.id`

### Этап 5: Добавление валидации и логирования (ПРИОРИТЕТ: СРЕДНИЙ)

1. **Добавить валидацию в API endpoints**
   - Проверять существование пользователя перед сохранением/получением
   - Валидировать типы данных
   - Добавить подробное логирование ошибок

2. **Добавить диагностические endpoints**
   - `/api/debug/user-info` - информация о текущем пользователе
   - `/api/debug/quiz-results` - все результаты для текущего пользователя

### Этап 6: Тестирование (ПРИОРИТЕТ: ВЫСОКИЙ)

1. **Тестирование сохранения**
   - Сохранить новый результат квиза
   - Проверить, что `user_id` сохранен правильно
   - Проверить связь с `menohub_users`

2. **Тестирование получения**
   - Получить результаты через API
   - Проверить отображение в личном кабинете
   - Проверить статистику в дашборде

3. **Тестирование миграции**
   - Применить миграцию на тестовой базе
   - Проверить, что существующие данные не потеряны
   - Проверить, что новые данные сохраняются правильно

## Порядок выполнения

1. **Сначала:** Диагностика (Этап 1) - понять текущее состояние
2. **Затем:** Исправление типов (Этап 2) - критическая проблема
3. **Параллельно:** Исправление кода (Этап 3) - высокий приоритет
4. **После:** Обновление миграций (Этап 4) - для будущих развертываний
5. **В конце:** Валидация и тестирование (Этапы 5-6)

## Дополнительные рекомендации

1. **Добавить мониторинг**
   - Логировать все операции с результатами квизов
   - Отслеживать ошибки связывания пользователей

2. **Добавить индексы**
   - Убедиться, что есть индекс на `menohub_quiz_results.user_id`
   - Убедиться, что есть индекс на `menohub_quiz_results.test_type`

3. **Добавить constraints**
   - Убедиться, что `user_id` не может быть NULL для авторизованных пользователей
   - Добавить проверку, что `test_type` соответствует допустимым значениям

## Риски

1. **Потеря данных при миграции**
   - Митигация: Сделать backup перед миграцией
   - Проверить, что миграция безопасна для существующих данных

2. **Проблемы с производительностью**
   - Митигация: Добавить индексы
   - Оптимизировать запросы

3. **Проблемы с обратной совместимостью**
   - Митигация: Сохранить поддержку поиска по `email` как fallback

