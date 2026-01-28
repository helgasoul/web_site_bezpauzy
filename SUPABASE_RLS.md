# Supabase Row Level Security (RLS)

Руководство по настройке и использованию Row Level Security в Supabase для защиты данных.

## Обзор

Row Level Security (RLS) - это механизм PostgreSQL, который позволяет контролировать доступ к строкам таблицы на уровне базы данных. В Supabase RLS обеспечивает дополнительный уровень безопасности поверх проверок на уровне приложения.

## Архитектура безопасности

Наш проект использует **двухуровневую защиту**:

1. **API Level** - проверка JWT сессий в API routes (`lib/auth/session.ts`)
2. **Database Level** - RLS политики в Supabase (дополнительная защита)

### Почему два уровня?

- **API Level** - основная проверка доступа через JWT сессии
- **RLS Level** - защита от прямого доступа к БД, ошибок в API, и будущей миграции на Supabase Auth

## Текущая конфигурация

### Таблицы с RLS

Все таблицы проекта имеют включенный RLS:

**Таблицы с префиксом `menohub_`:**

- ✅ `menohub_users` - пользователи
- ✅ `menohub_quiz_results` - результаты тестов
- ✅ `menohub_user_saved_content` - сохраненный контент
- ✅ `menohub_telegram_auth_codes` - коды аутентификации
- ✅ `menohub_forum_*` - форум (topics, replies, categories)
- ✅ `menohub_blog_posts` - статьи блога
- ✅ `menohub_video_content` - видео контент
- ✅ `menohub_community_members` - участники сообщества
- ✅ `feature_votes` - голосования за функции
- ✅ `platform_events` - события платформы

**Таблицы без префикса:**
- ✅ `feature_votes` - голосования за функции
- ✅ `platform_events` - события платформы

### Типы политик

#### 1. Service Role Only (Строгие)

Для чувствительных данных доступ разрешен только через service role (API):

```sql
CREATE POLICY "Service role can manage table_name"
    ON table_name
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
```

**Применяется к:**
- `menohub_quiz_results` - результаты тестов
- `menohub_user_saved_content` - сохраненный контент
- `menohub_telegram_auth_codes` - коды аутентификации
- `menohub_users` - пользователи

#### 2. Public Read, Service Write (Публичное чтение)

Публичное чтение, запись только через service role:

```sql
-- Чтение для всех
CREATE POLICY "Anyone can read table_name"
    ON table_name
    FOR SELECT
    USING (true);

-- Запись только через service role
CREATE POLICY "Service role can insert table_name"
    ON table_name
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');
```

**Применяется к:**
- `menohub_blog_posts` - статьи блога (только опубликованные)
- `menohub_video_content` - видео контент (только опубликованный)
- `menohub_forum_*` - форум (чтение для всех, запись через API)

#### 3. User-Specific (Будущее)

Политики для пользовательских данных (если перейдем на Supabase Auth):

```sql
CREATE POLICY "Users can manage their own data"
    ON table_name
    FOR ALL
    USING (
        auth.uid()::bigint = user_id
        OR auth.role() = 'service_role'
    );
```

## Проверка RLS статуса

### Использование helper функции

```sql
SELECT * FROM check_rls_status();
```

**Вывод:**
```
table_name                    | rls_enabled | policy_count
------------------------------+-------------+-------------
menohub_quiz_results          | true        | 2
menohub_user_saved_content   | true        | 2
menohub_users                 | true        | 3
...
```

### Ручная проверка

```sql
-- Проверить, включен ли RLS на всех таблицах проекта
SELECT tablename, relrowsecurity 
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public' 
  AND (
    tablename LIKE 'menohub_%'
    OR tablename IN ('feature_votes', 'platform_events')
  );

-- Проверить политики для таблицы
SELECT * FROM pg_policies 
WHERE tablename = 'menohub_quiz_results';
```

## Миграции

### Применение миграций

```bash
# Через Supabase CLI
supabase db push

# Или через Supabase Dashboard
# SQL Editor → Вставить SQL из миграции → Run
```

### Последняя миграция RLS

`supabase/migrations/022_improve_rls_policies.sql`

**Что делает:**
- Улучшает политики для `menohub_quiz_results`
- Улучшает политики для `menohub_user_saved_content`
- Улучшает политики для `menohub_telegram_auth_codes`
- Улучшает политики для forum таблиц
- Создает helper функцию `check_rls_status()`

## Best Practices

### 1. Всегда включайте RLS на пользовательских данных

```sql
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;
```

### 2. Используйте service role для API

Все API routes используют service role через `lib/supabase/server.ts`, который использует `SUPABASE_SERVICE_ROLE_KEY` (не `ANON_KEY`).

### 3. Проверяйте доступ на уровне API

RLS - это дополнительная защита. Основная проверка доступа должна быть в API routes через JWT сессии.

### 4. Документируйте политики

Используйте `COMMENT ON POLICY` для документирования:

```sql
COMMENT ON POLICY "Service role can manage quiz results" ON menohub_quiz_results IS 
    'Only service role (API) can manage quiz results. Access control is enforced at API level.';
```

### 5. Регулярно проверяйте RLS статус

```sql
-- Добавьте в регулярные проверки безопасности
SELECT * FROM check_rls_status();
```

## Миграция на Supabase Auth (будущее)

Если в будущем перейдем на Supabase Auth, политики можно улучшить:

```sql
-- Пример: пользователи могут читать только свои результаты
CREATE POLICY "Users can read their own quiz results"
    ON menohub_quiz_results
    FOR SELECT
    USING (
        auth.uid()::text = user_id::text
        OR auth.role() = 'service_role'
    );
```

Текущие политики уже подготовлены для такой миграции.

## Troubleshooting

### Проблема: "permission denied for table"

**Причина:** RLS блокирует доступ.

**Решение:**
1. Проверьте, что используете service role key в API
2. Проверьте политики: `SELECT * FROM pg_policies WHERE tablename = 'your_table'`
3. Убедитесь, что RLS включен: `SELECT relrowsecurity FROM pg_class WHERE relname = 'your_table'`

### Проблема: API не может вставить данные

**Причина:** Политика не разрешает INSERT.

**Решение:**
1. Проверьте политику INSERT: `SELECT * FROM pg_policies WHERE tablename = 'your_table' AND cmd = 'INSERT'`
2. Убедитесь, что API использует service role
3. Проверьте `WITH CHECK` условие в политике

### Проблема: Пользователи не могут читать свои данные

**Причина:** Политика не проверяет user_id.

**Решение:**
1. Если используете Supabase Auth, добавьте проверку `auth.uid()`
2. Если используете JWT сессии, убедитесь, что API проверяет доступ перед запросом

## Тестирование RLS

### Тест 1: Проверка service role доступа

```sql
-- Должно работать (service role)
SET ROLE service_role;
SELECT * FROM menohub_quiz_results LIMIT 1;
RESET ROLE;
```

### Тест 2: Проверка анонимного доступа

```sql
-- Должно быть заблокировано (если нет публичной политики)
SET ROLE anon;
SELECT * FROM menohub_quiz_results LIMIT 1;
-- Ожидается ошибка: permission denied
RESET ROLE;
```

### Тест 3: Проверка через API

```bash
# Должно работать (с валидной JWT сессией)
curl -H "Cookie: telegram_session=..." \
  http://localhost:3000/api/quiz/get-results

# Должно быть заблокировано (без сессии)
curl http://localhost:3000/api/quiz/get-results
```

## См. также

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Security Audit](../SECURITY_AUDIT.md)
- [JWT Session Setup](./JWT_SESSION_SETUP.md)

