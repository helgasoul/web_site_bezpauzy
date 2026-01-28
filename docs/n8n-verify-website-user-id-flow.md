# Проверка: Почему user_id null при создании кода

## Текущая ситуация

Код создается через API, и в узле "Extract link code" `user_id: null` - это **нормально**.

**Почему `user_id: null` в "Extract link code"?**
- Узел "Extract link code" только извлекает код из сообщения Telegram
- Он не знает, какой пользователь создал этот код
- `user_id` должен браться из узла "Get link code from DB"

## Правильный flow

```
1. API создает код → сохраняет website_user_id в menohub_telegram_auth_codes
   ↓
2. Пользователь отправляет link_КОД в бот
   ↓
3. Extract link code → извлекает код, user_id: null (это нормально!)
   ↓
4. Get link code from DB → находит запись, возвращает website_user_id ✅
   ↓
5. Update user telegram_id → использует website_user_id из шага 4
```

## Что проверить

### 1. Проверьте, что API сохраняет `website_user_id`

**В API роуте** `/api/auth/link-telegram/generate-code/route.ts` код должен сохранять `website_user_id`:

```typescript
const { data: authCode, error: codeError } = await supabase
  .from('menohub_telegram_auth_codes')
  .insert({
    code,
    telegram_id: 0,
    user_id: null, // Legacy UUID field
    website_user_id: user.id, // ✅ Это должно быть заполнено!
    expires_at: expiresAt.toISOString(),
    used: false,
  })
```

**Проверьте в базе данных**:
```sql
SELECT code, website_user_id, user_id, created_at, expires_at, used
FROM menohub_telegram_auth_codes
WHERE code = '2VPM8A'
ORDER BY created_at DESC
LIMIT 1;
```

**Ожидаемый результат**: `website_user_id` должен быть заполнен (не `null`).

### 2. Проверьте, что узел "Get link code from DB" возвращает `website_user_id`

**В узле "Get link code from DB"** должны быть выбраны поля:
- `code`
- `website_user_id` ✅ (важно!)
- `id`
- `used`
- `expires_at`

**Проверьте настройки узла**:
- Убедитесь, что в Supabase узле выбраны нужные поля
- Или используйте `select: '*'` чтобы получить все поля

**Добавьте узел "Log DB result"** после "Get link code from DB":

```javascript
const inputData = $input.all();

console.log('=== Get link code from DB result ===');
inputData.forEach((item, index) => {
  console.log(`Item ${index + 1}:`, JSON.stringify(item.json, null, 2));
  console.log('website_user_id:', item.json.website_user_id);
  console.log('user_id:', item.json.user_id);
});

return inputData;
```

### 3. Проверьте, что узел "Update user telegram_id" использует правильное поле

**Текущий фильтр** (неправильный):
```json
{
  "keyName": "id",
  "condition": "eq",
  "keyValue": "=={{ $json.user_id }}"
}
```

**Исправленный фильтр**:
```json
{
  "keyName": "id",
  "condition": "eq",
  "keyValue": "=={{ $('Get link code from DB').item.json.website_user_id }}"
}
```

## Пошаговая диагностика

### Шаг 1: Проверьте создание кода в API

1. Откройте консоль браузера (F12)
2. Нажмите "Привязать Telegram"
3. Проверьте ответ API - должен быть `code` и `deepLink`
4. Проверьте логи сервера - должен быть `website_user_id`

### Шаг 2: Проверьте базу данных

```sql
-- Проверьте последний созданный код
SELECT 
  code,
  website_user_id,
  user_id,
  telegram_id,
  used,
  expires_at,
  created_at,
  NOW() as current_time,
  expires_at > NOW() as is_valid
FROM menohub_telegram_auth_codes
WHERE code = '2VPM8A'
ORDER BY created_at DESC
LIMIT 1;
```

**Ожидаемый результат**:
- `website_user_id` должен быть заполнен (ID пользователя из `menohub_users`)
- `user_id` может быть `null` (legacy поле)
- `used = false`
- `is_valid = true`

### Шаг 3: Проверьте узел "Get link code from DB"

1. Откройте узел "Get link code from DB" в n8n
2. Убедитесь, что выбраны все нужные поля (или используйте `*`)
3. Добавьте узел "Log DB result" после него
4. Запустите workflow
5. Проверьте логи - должен быть `website_user_id`

### Шаг 4: Исправьте узел "Update user telegram_id"

Измените фильтр на использование `website_user_id` из узла "Get link code from DB".

## Если `website_user_id` все еще `null`

### Возможные причины:

1. **Миграция не выполнена** - поле `website_user_id` не существует
   - **Решение**: Выполните миграцию `013_fix_telegram_auth_codes_user_id.sql`

2. **API не сохраняет `website_user_id`** - код создается без этого поля
   - **Решение**: Проверьте код API, убедитесь, что `website_user_id: user.id` добавляется

3. **Fallback логика сработала** - API создал код без `website_user_id` (старая запись)
   - **Решение**: Проверьте логи API, возможно сработал retry без `website_user_id`

## Проверка миграции

```sql
-- Проверьте, существует ли поле website_user_id
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'menohub_telegram_auth_codes'
AND column_name = 'website_user_id';
```

Если поле не существует, выполните:
```sql
-- Из файла: supabase/migrations/013_fix_telegram_auth_codes_user_id.sql
ALTER TABLE menohub_telegram_auth_codes 
ADD COLUMN IF NOT EXISTS website_user_id BIGINT;
```

## Итог

`user_id: null` в узле "Extract link code" - это **нормально**. Важно, чтобы:
1. ✅ API сохранял `website_user_id` при создании кода
2. ✅ Узел "Get link code from DB" возвращал `website_user_id`
3. ✅ Узел "Update user telegram_id" использовал `website_user_id` из БД


