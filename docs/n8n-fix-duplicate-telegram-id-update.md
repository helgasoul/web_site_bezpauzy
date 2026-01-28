# Исправление: Ошибка duplicate key при обновлении telegram_id

## 🔴 Проблема

**Ошибка**: `duplicate key value violates unique constraint 'users_mvp_telegram_id_key'`

**Причина**: 
- Пользователь с `id = 111` пытается обновить свой `telegram_id` на `374683580`
- Но `telegram_id = 374683580` уже существует у пользователя с `id = 110`
- База данных не позволяет иметь два пользователя с одинаковым `telegram_id`

## 📊 Текущая ситуация

В базе данных есть две записи:
1. **id: 110** - `telegram_id: 374683580` (создана при согласии в боте)
2. **id: 111** - `telegram_id: 0` (создана на сайте, `website_user_id = 111`)

## ✅ Решение: Проверить существование перед обновлением

### Шаг 1: Добавить узел "Check if user exists with telegram_id"

**Перед узлом "Update user telegram_id"** добавьте новый узел:

**Тип**: Supabase  
**Operation**: Get Many  
**Table Name or ID**: `menohub_users`  
**Return All**: `off`  
**Limit**: `1`  
**Filter**: Build Manually  
**Must Match**: All Filters

**Filters**:
```
Field Name or ID: telegram_id - (integer)
Condition: Equals
Field Value: {{ $json.from.id }}
```

**Важно**: 
- Используйте `$json.from.id` - это `telegram_id` из сообщения Telegram
- Или `{{ $('Extract link code').item.json.telegram_id }}` если используете данные из узла "Extract link code"

**Настройки**:
- Return Empty Results: `on` (чтобы workflow не останавливался)

### Шаг 2: Добавить IF узел "User already exists?"

**Тип**: IF  
**Условие**:
```
Left Value: {{ $json.id }}
Operator: Exists
```

**Соединения**:
- `true` (пользователь найден) → "Update existing user"
- `false` (пользователь не найден) → "Update user by website_user_id"

### Шаг 3: Обновить узел "Update existing user"

**Тип**: Supabase  
**Operation**: Update  
**Table Name or ID**: `menohub_users`  
**Filter**:
```
Field: id
Condition: Equals
Value: {{ $json.id }}
```
(Использует ID найденного пользователя)

**Fields to Update**:
```
telegram_id: {{ $json.from.id }}
consent_granted: true
last_activity_at: {{ $now }}
```

### Шаг 4: Обновить узел "Update user by website_user_id"

**Тип**: Supabase  
**Operation**: Update  
**Table Name or ID**: `menohub_users`  
**Filter**:
```
Field: id
Condition: Equals
Value: {{ $('Get link code from DB').item.json.website_user_id }}
```

**Fields to Update**:
```
telegram_id: {{ $json.from.id }}
consent_granted: true
last_activity_at: {{ $now }}
```

## 🔄 Полный flow после исправления

```
1. Extract link code
   → Извлекает код и telegram_id
   ↓
2. Get link code from DB
   → Получает website_user_id = 111
   ↓
3. Update code with telegram_id
   → Обновляет код в базе
   ↓
4. Check if user exists with telegram_id (НОВЫЙ)
   → Ищет пользователя с telegram_id = 374683580
   → Находит пользователя id = 110
   ↓
5. IF user already exists (НОВЫЙ)
   ├─ (true) → Update existing user
   │   → Обновляет id = 110
   │   → Устанавливает telegram_id = 374683580
   │   → Устанавливает consent_granted = true
   └─ (false) → Update user by website_user_id
       → Обновляет id = 111
       → Устанавливает telegram_id = 374683580
```

## 📝 Альтернативное решение: Объединить записи

Если нужно объединить данные из двух записей:

### Вариант A: Обновить существующую запись (id: 110)

**Логика**: Если пользователь с таким `telegram_id` уже существует, обновить его, а не создавать новую запись.

**Узел "Update existing user"**:
- Обновляет запись id: 110
- Устанавливает `consent_granted = true` (если еще не установлено)
- Обновляет `last_activity_at`

### Вариант B: Удалить дубликат (id: 111)

**ВНИМАНИЕ**: Только если в записи id: 111 нет важных данных!

**SQL**:
```sql
-- Проверьте данные перед удалением!
SELECT * FROM menohub_users WHERE id = 111;

-- Если все данные уже в id: 110, можно удалить дубликат
DELETE FROM menohub_users WHERE id = 111;
```

## 🔍 Проверка перед обновлением

Добавьте узел "Code" для логирования:

```javascript
const telegramId = $json.from.id;
const websiteUserId = $('Get link code from DB').first().json.website_user_id;
const existingUser = $('Check if user exists with telegram_id').first().json;

console.log('Telegram ID:', telegramId);
console.log('Website User ID:', websiteUserId);
console.log('Existing User:', existingUser);

return [{
  json: {
    telegram_id: telegramId,
    website_user_id: websiteUserId,
    existing_user_id: existingUser?.id || null,
    should_update_existing: !!existingUser?.id
  }
}];
```

## ✅ Итоговое решение (рекомендуется)

**Используйте проверку существования**:

1. ✅ Проверьте, существует ли пользователь с таким `telegram_id`
2. ✅ Если существует → обновите существующую запись (id: 110)
3. ✅ Если не существует → обновите запись по `website_user_id` (id: 111)
4. ✅ Установите `consent_granted = true` в обоих случаях

Это предотвратит ошибку и правильно обработает ситуацию с дубликатами.

## 🚨 Временное решение для тестирования

Если нужно быстро протестировать, можно временно удалить дубликат:

```sql
-- ВНИМАНИЕ: Проверьте данные перед удалением!
SELECT * FROM menohub_users WHERE id IN (110, 111);

-- Если id: 111 - дубликат, можно удалить
DELETE FROM menohub_users WHERE id = 111;
```

Но лучше использовать проверку существования в workflow, чтобы это не повторялось.

