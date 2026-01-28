# Исправление: Выражение возвращает undefined в узле "Update user telegram_id"

## Проблема

**Ошибка**: `invalid input syntax for type bigint: "="`

**Причина**: Выражение `{{ $('Get link code from DB').item.json.website_user_id }}` возвращает `[undefined]`, потому что:
- Узел "Update user telegram_id" подключен к "Update code with telegram_id", а не к "Get link code from DB"
- Выражение пытается получить данные из узла, который не в цепочке перед этим узлом

**В INPUT узла уже есть данные**:
```json
{
  "website_user_id": 111,
  "code": "2VPM8A",
  ...
}
```

## Решение

### Использовать данные из текущего INPUT

**Текущее выражение** (неправильное):
```json
{
  "keyValue": "=={{ $('Get link code from DB').item.json.website_user_id }}"
}
```

**Исправленное выражение**:
```json
{
  "keyValue": "=={{ $json.website_user_id }}"
}
```

Или:
```json
{
  "keyValue": "={{ $json.website_user_id }}"
}
```

## Структура workflow

```
Get link code from DB → возвращает { id, code, website_user_id, ... }
  ↓
Update code with telegram_id → обновляет запись, возвращает обновленную запись
  ↓
Update user telegram_id → получает данные из "Update code with telegram_id"
```

**Важно**: "Update user telegram_id" получает данные из "Update code with telegram_id", где уже есть `website_user_id`.

## Исправление в n8n

### Шаг 1: Изменить выражение в фильтре

В узле "Update user telegram_id":

1. Откройте узел "Update user telegram_id"
2. В разделе "Select Conditions" → "Field Value" измените:
   - **Было**: `{{ $('Get link code from DB').item.json.website_user_id }}`
   - **Должно быть**: `{{ $json.website_user_id }}`

### Шаг 2: Проверьте, что данные содержат website_user_id

**Добавьте узел "Log before update user"** перед "Update user telegram_id":

```javascript
const inputData = $input.all();

console.log('=== Before Update user telegram_id ===');
inputData.forEach((item, index) => {
  console.log(`Item ${index + 1}:`, JSON.stringify(item.json, null, 2));
  console.log('website_user_id:', item.json.website_user_id);
  console.log('website_user_id type:', typeof item.json.website_user_id);
});

return inputData;
```

Это покажет, есть ли `website_user_id` в данных.

## Альтернативное решение: Использовать данные из "Get link code from DB"

Если нужно использовать данные напрямую из "Get link code from DB", измените соединения:

**Текущая структура**:
```
Get link code from DB
  ↓
If code found
  ↓
Update code with telegram_id
  ↓
Update user telegram_id
```

**Альтернативная структура**:
```
Get link code from DB
  ↓
If code found
  ├─ → Update code with telegram_id
  └─ → Update user telegram_id (параллельно, используя данные из "Get link code from DB")
```

Но это сложнее и требует дублирования данных.

## Рекомендуемое решение

**Использовать `$json.website_user_id`** из текущего INPUT:

1. **Проще** - не требует изменения соединений
2. **Надежнее** - данные уже есть в INPUT
3. **Правильнее** - использует данные из предыдущего узла в цепочке

## Полная настройка узла "Update user telegram_id"

```json
{
  "operation": "update",
  "tableId": "menohub_users",
  "matchType": "allFilters",
  "filters": {
    "conditions": [
      {
        "keyName": "id",
        "condition": "eq",
        "keyValue": "=={{ $json.website_user_id }}"
      }
    ]
  },
  "fieldsUi": {
    "fieldValues": [
      {
        "fieldId": "telegram_id",
        "fieldValue": "=={{ $('Extract link code').item.json.telegram_id }}"
      }
    ]
  }
}
```

## Проверка

После исправления:
1. Выражение должно вернуть `111` (или другое значение `website_user_id`)
2. Узел должен выполниться без ошибок
3. Запись в `menohub_users` должна обновиться:
   - `telegram_id` = 374683580
   - Для пользователя с `id = 111` (или другим `website_user_id`)

## Важно

- `$json` - это данные из текущего INPUT узла
- `$('Node Name')` - это данные из другого узла (должен быть выполнен ранее)
- В данном случае нужно использовать `$json.website_user_id`, так как данные уже есть в INPUT

