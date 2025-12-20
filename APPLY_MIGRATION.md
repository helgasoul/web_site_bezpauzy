# Как применить миграцию для таблицы menohub_telegram_auth_codes

## Проблема
Таблица `menohub_telegram_auth_codes` не видна в Supabase, потому что миграция не была применена.

## Решение

### Вариант 1: Через Supabase Dashboard (рекомендуется)

1. **Откройте Supabase Dashboard:**
   - Перейдите на https://supabase.com/dashboard
   - Выберите ваш проект

2. **Откройте SQL Editor:**
   - В левом меню нажмите **"SQL Editor"**
   - Нажмите **"New query"**

3. **Скопируйте и выполните миграцию:**
   - Откройте файл `supabase/migrations/004_create_telegram_auth_codes.sql`
   - Скопируйте весь его содержимое
   - Вставьте в SQL Editor
   - Нажмите **"Run"** (или `Cmd+Enter` / `Ctrl+Enter`)

4. **Проверьте результат:**
   - В левом меню откройте **"Table Editor"**
   - Должна появиться таблица `menohub_telegram_auth_codes`

---

### Вариант 2: Через Supabase CLI (если установлен)

```bash
# Убедитесь, что вы в корне проекта
cd /Users/olgapuchkova/Documents/Документы\ —\ MacBook\ Air\ —\ Olga/PERSONAL/МОИ\ ПРОЕКТЫ/ПЛАТФОРМА\ ЖЕНСКОГО\ ЗДОРОВЬЯ/Проект\ Без\ \|\ паузы/Бот\ Без\|паузы/САЙТ

# Применить все миграции
supabase db push

# Или применить конкретную миграцию
supabase migration up
```

---

## Структура таблицы (для справки)

После применения миграции таблица будет иметь следующую структуру:

```sql
menohub_telegram_auth_codes
├── id (UUID, PRIMARY KEY)
├── code (TEXT, UNIQUE, NOT NULL) - код для привязки
├── telegram_id (BIGINT, DEFAULT 0) - Telegram ID (0 = не активирован)
├── user_id (UUID, NULLABLE) - ссылка на menohub_users.id
├── expires_at (TIMESTAMPTZ, NOT NULL) - время истечения
├── used (BOOLEAN, DEFAULT FALSE) - использован ли код
└── created_at (TIMESTAMPTZ, DEFAULT NOW()) - время создания
```

**Индексы:**
- `idx_menohub_telegram_auth_codes_code` - для быстрого поиска по коду
- `idx_menohub_telegram_auth_codes_telegram_id` - для поиска по Telegram ID
- `idx_menohub_telegram_auth_codes_expires_at` - для очистки истекших кодов
- `idx_menohub_telegram_auth_codes_used` - для фильтрации использованных

---

## Проверка после применения

После применения миграции проверьте:

1. **Таблица создана:**
   ```sql
   SELECT * FROM menohub_telegram_auth_codes LIMIT 1;
   ```
   Должно вернуться пустой результат (таблица пустая, но существует)

2. **Индексы созданы:**
   ```sql
   SELECT indexname FROM pg_indexes 
   WHERE tablename = 'menohub_telegram_auth_codes';
   ```
   Должно вернуться 4 индекса

3. **RLS включен:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename = 'menohub_telegram_auth_codes';
   ```
   `rowsecurity` должно быть `true`

---

## Если возникли ошибки

### Ошибка: "relation menohub_users does not exist"
Это означает, что таблица `menohub_users` еще не создана. В этом случае:
1. Сначала создайте таблицу `menohub_users` (если она создается ботом/n8n, убедитесь, что она существует)
2. Или временно уберите `user_id UUID` из миграции и добавьте его позже

### Ошибка: "table already exists"
Таблица уже существует. Это нормально, миграция использует `CREATE TABLE IF NOT EXISTS`.

### Ошибка: "permission denied"
Убедитесь, что вы используете правильные credentials в Supabase Dashboard или что у вашего пользователя есть права на создание таблиц.

---

## После успешного применения

После применения миграции:
1. Таблица `menohub_telegram_auth_codes` будет доступна в n8n
2. API endpoint `/api/auth/link-telegram/generate-code` сможет создавать коды
3. Бот сможет обновлять `telegram_id` в этой таблице

