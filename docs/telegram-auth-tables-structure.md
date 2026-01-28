# Структура таблиц для привязки Telegram

## Таблицы

### 1. `menohub_users` - Пользователи

**Поля**:
- `id` (BIGINT) - **Это и есть user_id!** ✅
- `telegram_id` (BIGINT) - ID пользователя в Telegram
- `consent_granted` (BOOLEAN) - Согласие на обработку данных
- `is_subscribed` (BOOLEAN) - Подписка
- `subscription_plan` (TEXT) - Тариф
- ... другие поля

**Важно**: В этой таблице НЕТ поля `website_user_id`. Поле `id` - это и есть идентификатор пользователя на сайте.

### 2. `menohub_telegram_auth_codes` - Коды привязки

**Поля**:
- `id` (UUID) - ID записи кода
- `code` (TEXT) - Код привязки (6 символов)
- `telegram_id` (BIGINT) - ID пользователя в Telegram (0 = еще не привязан)
- `user_id` (UUID) - **Legacy поле**, может быть NULL
- `website_user_id` (BIGINT) - **Ссылка на menohub_users.id** ✅
- `expires_at` (TIMESTAMPTZ) - Срок действия кода
- `used` (BOOLEAN) - Использован ли код
- `created_at` (TIMESTAMPTZ) - Дата создания

**Важно**: `website_user_id` должен быть в этой таблице, а не в `menohub_users`!

## Связь между таблицами

```
menohub_users
  id (BIGINT) ←──┐
                 │
                 │ website_user_id ссылается на id
                 │
menohub_telegram_auth_codes
  website_user_id (BIGINT) ──┘
```

## Flow привязки

1. **Пользователь на сайте** (id: 110 в `menohub_users`, `telegram_id: 0`)
2. **Генерируется код** → создается запись в `menohub_telegram_auth_codes`:
   ```sql
   INSERT INTO menohub_telegram_auth_codes (
     code,
     telegram_id,  -- 0
     website_user_id,  -- 110 (ссылка на menohub_users.id)
     expires_at,
     used
   ) VALUES (
     '2VPM8A',
     0,
     110,  -- ← Это должно быть заполнено!
     '2025-12-21 18:50:00',
     false
   );
   ```
3. **Пользователь отправляет код в бот** → бот находит код в `menohub_telegram_auth_codes`
4. **Бот обновляет пользователя** → обновляет `menohub_users.telegram_id` по `website_user_id`:
   ```sql
   UPDATE menohub_users
   SET telegram_id = 374683580
   WHERE id = 110;  -- ← Используется website_user_id из кода
   ```

## Проверка структуры

### Проверьте таблицу `menohub_telegram_auth_codes`:

```sql
-- Проверьте структуру таблицы
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'menohub_telegram_auth_codes'
ORDER BY ordinal_position;
```

**Ожидаемые поля**:
- `id` (uuid)
- `code` (text)
- `telegram_id` (bigint)
- `user_id` (uuid) - может быть NULL
- `website_user_id` (bigint) - **должно быть!** ✅
- `expires_at` (timestamptz)
- `used` (boolean)
- `created_at` (timestamptz)

### Проверьте последний созданный код:

```sql
SELECT 
  code,
  telegram_id,
  user_id,
  website_user_id,  -- ← Это должно быть заполнено!
  expires_at,
  used,
  created_at
FROM menohub_telegram_auth_codes
WHERE code = '2VPM8A'
ORDER BY created_at DESC
LIMIT 1;
```

**Ожидаемый результат**:
- `website_user_id` должен быть заполнен (например, 110)
- `user_id` может быть NULL (legacy поле)
- `telegram_id` = 0 (еще не привязан)

## Если `website_user_id` отсутствует

### Вариант 1: Поле не существует

Выполните миграцию:
```sql
-- Запустите: supabase/migrations/013_fix_telegram_auth_codes_user_id.sql
ALTER TABLE menohub_telegram_auth_codes 
ADD COLUMN IF NOT EXISTS website_user_id BIGINT;
```

### Вариант 2: Поле существует, но не заполняется

Проверьте API `/api/auth/link-telegram/generate-code`:
- Убедитесь, что `insertData.website_user_id = user.id` установлено
- Проверьте логи API - должно быть `website_user_id` в запросе

## Итог

- ✅ `website_user_id` должен быть в таблице **`menohub_telegram_auth_codes`**
- ❌ `website_user_id` НЕ должен быть в таблице `menohub_users`
- ✅ `website_user_id` ссылается на `menohub_users.id`
- ✅ При создании кода API должен сохранять `website_user_id = user.id`


