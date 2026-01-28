# Исправление: Ошибка duplicate key value violates unique constraint

## Проблема

**Ошибка**: `duplicate key value violates unique constraint 'users_mvp_telegram_id_key'`

**Причина**: `telegram_id: 374683580` уже существует в таблице `menohub_users` (в записи id: 110), и попытка обновить запись id: 111 этим же значением нарушает уникальное ограничение.

## Ситуация

В таблице `menohub_users` есть две записи:
1. **id: 110** - `telegram_id: 374683580` (создана при согласии в боте)
2. **id: 111** - `telegram_id: 0` (создана при привязке через код)

Попытка обновить id: 111 с `telegram_id: 374683580` не проходит, потому что это значение уже занято.

## Решения

### Решение 1: Проверить существование пользователя перед обновлением

**Добавить узел "Check if user exists with telegram_id"** перед "Update user telegram_id":

**Тип**: Supabase  
**Операция**: get  
**Таблица**: menohub_users  
**Фильтр**:
```json
{
  "keyName": "telegram_id",
  "condition": "eq",
  "keyValue": "=={{ $('Extract link code').item.json.telegram_id }}"
}
```

**Добавить узел "IF user already exists"**:

**Тип**: IF  
**Условие**:
```json
{
  "leftValue": "=={{ $json.id }}",
  "rightValue": "",
  "operator": {
    "type": "string",
    "operation": "exists",
    "singleValue": true
  }
}
```

**Логика**:
- Если пользователь найден (уже имеет этот `telegram_id`) → обновить существующую запись или пропустить
- Если не найден → обновить запись по `website_user_id`

### Решение 2: Обновить существующую запись вместо создания новой

**Изменить логику**: Вместо обновления записи id: 111, обновить запись id: 110 (которая уже имеет `telegram_id: 374683580`).

**Проблема**: Но `website_user_id = 111`, что указывает на запись id: 111.

**Решение**: Использовать `telegram_id` для поиска существующей записи:

```json
{
  "keyName": "telegram_id",
  "condition": "eq",
  "keyValue": "=={{ $('Extract link code').item.json.telegram_id }}"
}
```

Если запись найдена → обновить её. Если не найдена → обновить по `website_user_id`.

### Решение 3: Объединить записи перед обновлением

**Добавить узел "Merge users"** перед "Update user telegram_id":

**Тип**: Code  
**Код**:
```javascript
const telegramId = $('Extract link code').first().json.telegram_id;
const websiteUserId = $json.website_user_id;

// Проверяем, существует ли пользователь с таким telegram_id
const existingUser = $('Check if user exists with telegram_id').first().json;

if (existingUser && existingUser.id) {
  // Пользователь уже существует с этим telegram_id
  console.log('User already exists with telegram_id:', existingUser.id);
  
  // Если это другая запись, нужно объединить данные
  if (existingUser.id !== websiteUserId) {
    console.log('Different user IDs - need to merge');
    // Здесь можно добавить логику объединения данных
  }
  
  return [{
    json: {
      user_id_to_update: existingUser.id, // Обновить существующую запись
      telegram_id: telegramId,
      website_user_id: websiteUserId
    }
  }];
} else {
  // Пользователь не найден, обновляем по website_user_id
  return [{
    json: {
      user_id_to_update: websiteUserId,
      telegram_id: telegramId
    }
  }];
}
```

Затем в узле "Update user telegram_id" использовать `user_id_to_update`.

### Решение 4: Удалить дубликат перед обновлением (не рекомендуется)

**ВНИМАНИЕ**: Это может привести к потере данных!

```sql
-- Удалить запись id: 111, если она дубликат
DELETE FROM menohub_users WHERE id = 111;
```

Но это не рекомендуется, так как может быть потеря данных.

## Рекомендуемое решение

**Использовать Решение 1 + Решение 2**:

1. **Проверить существование пользователя** с таким `telegram_id`
2. **Если найден** → обновить существующую запись
3. **Если не найден** → обновить запись по `website_user_id`

### Обновленная структура workflow:

```
Extract link code
  ↓
Get link code from DB
  ↓
Update code with telegram_id
  ↓
Check if user exists with telegram_id (НОВЫЙ УЗЕЛ)
  ↓
IF user already exists (НОВЫЙ УЗЕЛ)
  ├─ (true) → Update existing user (обновить существующую запись)
  └─ (false) → Update user by website_user_id (обновить по website_user_id)
```

## Временное решение для тестирования

Если нужно быстро протестировать, можно временно удалить дубликат:

```sql
-- Проверьте данные перед удалением!
SELECT * FROM menohub_users WHERE id IN (110, 111);

-- Удалите дубликат (id: 111)
DELETE FROM menohub_users WHERE id = 111;
```

**ВНИМАНИЕ**: Убедитесь, что в записи id: 111 нет важных данных, которых нет в id: 110!

## Проверка дубликатов

```sql
-- Найти все дубликаты по telegram_id
SELECT 
  telegram_id,
  COUNT(*) as count,
  array_agg(id) as user_ids,
  array_agg(created_at) as created_dates
FROM menohub_users
WHERE telegram_id != 0
GROUP BY telegram_id
HAVING COUNT(*) > 1;
```

## Итог

Проблема в том, что создаются две записи пользователя:
- id: 110 - создана при согласии
- id: 111 - создана при привязке через код

Нужно:
1. Проверять существование пользователя перед созданием/обновлением
2. Обновлять существующую запись, а не создавать новую
3. Объединить дубликаты вручную или автоматически


