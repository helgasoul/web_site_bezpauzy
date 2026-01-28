# Исправление: user_id равен null в узле "Update user telegram_id"

## Проблема

В узле "Update user telegram_id" используется `user_id` из узла "Extract link code", где он установлен в `null` с комментарием "Будет заполнено из БД".

**Текущая логика**:
```
Extract link code → user_id: null
  ↓
Get link code from DB → возвращает website_user_id из БД
  ↓
Update user telegram_id → использует user_id из "Extract link code" (null) ❌
```

## Причина

Узел "Extract link code" извлекает только код из сообщения и не знает, какой `user_id` связан с этим кодом. `user_id` должен браться из узла "Get link code from DB", который возвращает запись из таблицы `menohub_telegram_auth_codes` с полем `website_user_id`.

## Решение

### Вариант 1: Использовать `website_user_id` из узла "Get link code from DB"

**Текущий фильтр** в узле "Update user telegram_id":
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

**Важно**: Если `website_user_id` может быть `null` (старые записи), нужно добавить проверку.

### Вариант 2: Добавить узел для объединения данных

**Добавить узел "Combine data"** между "Get link code from DB" и "Update user telegram_id":

**Тип**: Code  
**Код**:
```javascript
const linkCodeData = $('Extract link code').first().json;
const dbCodeData = $('Get link code from DB').first().json;

console.log('=== Combine data ===');
console.log('Link code data:', JSON.stringify(linkCodeData, null, 2));
console.log('DB code data:', JSON.stringify(dbCodeData, null, 2));
console.log('website_user_id from DB:', dbCodeData.website_user_id);

return [{
  json: {
    code: linkCodeData.code,
    telegram_id: linkCodeData.telegram_id,
    user_id: dbCodeData.website_user_id, // Берем из БД!
    code_id: dbCodeData.id // ID записи кода для обновления
  }
}];
```

Затем в узле "Update user telegram_id" использовать:
```json
{
  "keyName": "id",
  "condition": "eq",
  "keyValue": "=={{ $json.user_id }}"
}
```

### Вариант 3: Добавить проверку на null

**Добавить узел "IF website_user_id exists"** перед "Update user telegram_id":

**Тип**: IF  
**Условие**:
```json
{
  "leftValue": "=={{ $('Get link code from DB').item.json.website_user_id }}",
  "rightValue": "",
  "operator": {
    "type": "string",
    "operation": "exists",
    "singleValue": true
  }
}
```

**Соединения**:
- `true` → "Update user telegram_id" (используя `website_user_id`)
- `false` → Сообщение об ошибке (код без привязки к пользователю)

## Рекомендуемое решение

**Использовать Вариант 1** + **Вариант 3** (добавить проверку):

1. **Изменить фильтр** в узле "Update user telegram_id":
   ```json
   {
     "keyName": "id",
     "condition": "eq",
     "keyValue": "=={{ $('Get link code from DB').item.json.website_user_id }}"
   }
   ```

2. **Добавить узел "IF website_user_id exists"** перед "Update user telegram_id"

3. **Обновить узел "Extract link code"** - можно оставить `user_id: null`, так как он не используется

## Проверка

После исправления:
1. Узел "Get link code from DB" должен возвращать `website_user_id`
2. Узел "Update user telegram_id" должен использовать `website_user_id` из БД
3. Если `website_user_id` = `null`, должна быть обработка ошибки

## Важно

- `user_id` в узле "Extract link code" может оставаться `null` - он не используется
- Реальный `user_id` берется из таблицы `menohub_telegram_auth_codes`, поле `website_user_id`
- Если миграция `013_fix_telegram_auth_codes_user_id.sql` не выполнена, поле `website_user_id` может не существовать

## SQL для проверки

Проверьте, что в таблице есть поле `website_user_id`:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'menohub_telegram_auth_codes' 
AND column_name IN ('user_id', 'website_user_id');
```

Если поля `website_user_id` нет, выполните миграцию:
```sql
-- Запустите: supabase/migrations/013_fix_telegram_auth_codes_user_id.sql
```


