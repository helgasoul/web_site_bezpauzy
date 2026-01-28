# Исправление: Ошибка "invalid input syntax for type uuid" в узле "Update code with telegram_id"

## Проблема

**Ошибка**: `invalid input syntax for type uuid: "2VPM8A"`

**Причина**: В узле "Update code with telegram_id" используется неправильный фильтр:
- **Field**: `id` (тип UUID)
- **Value**: `{{ $('Extract link code').item.json.code }}` (значение "2VPM8A" - это код, а не UUID!)

## Решение

### Вариант 1: Использовать `code` для фильтра (рекомендуется)

**Текущий фильтр** (неправильный):
```json
{
  "keyName": "id",
  "condition": "eq",
  "keyValue": "=={{ $('Extract link code').item.json.code }}"
}
```

**Исправленный фильтр**:
```json
{
  "keyName": "code",
  "condition": "eq",
  "keyValue": "=={{ $('Extract link code').item.json.code }}"
}
```

**Преимущества**:
- Проще и понятнее
- Не требует данных из узла "Get link code from DB"
- Работает напрямую с кодом

### Вариант 2: Использовать `id` из узла "Get link code from DB"

Если нужно использовать `id` (UUID), то нужно брать его из результата узла "Get link code from DB":

**Исправленный фильтр**:
```json
{
  "keyName": "id",
  "condition": "eq",
  "keyValue": "=={{ $('Get link code from DB').item.json.id }}"
}
```

**Важно**: Этот вариант требует, чтобы узел "Get link code from DB" был выполнен перед "Update code with telegram_id" и вернул результат с полем `id`.

## Текущая структура workflow

```
Extract link code → code: "2VPM8A"
  ↓
Get link code from DB → возвращает id (UUID), code, website_user_id
  ↓
Update code with telegram_id → должен использовать id из "Get link code from DB"
```

## Исправление в n8n

### Шаг 1: Изменить фильтр в узле "Update code with telegram_id"

**Вариант A** (использовать `code`):
1. Откройте узел "Update code with telegram_id"
2. В разделе "Select Conditions" измените:
   - **Field Name or ID**: `code` (вместо `id`)
   - **Field Value**: `=={{ $('Extract link code').item.json.code }}`

**Вариант B** (использовать `id` из БД):
1. Откройте узел "Update code with telegram_id"
2. В разделе "Select Conditions" измените:
   - **Field Name or ID**: `id` (оставить)
   - **Field Value**: `=={{ $('Get link code from DB').item.json.id }}`

### Шаг 2: Убедитесь, что данные идут из правильного узла

**Текущая проблема**: Узел "Update code with telegram_id" подключен к "Extract link code", но должен использовать данные из "Get link code from DB".

**Проверьте соединения**:
- "Get link code from DB" должен быть подключен к "Update code with telegram_id"
- Или используйте вариант A (фильтр по `code`)

## Рекомендуемое решение

**Использовать вариант A** (фильтр по `code`):

1. **Проще** - не требует данных из "Get link code from DB"
2. **Надежнее** - работает даже если "Get link code from DB" не вернул `id`
3. **Понятнее** - явно использует код для поиска записи

**Настройки узла "Update code with telegram_id"**:

```json
{
  "operation": "update",
  "tableId": "menohub_telegram_auth_codes",
  "matchType": "allFilters",
  "filters": {
    "conditions": [
      {
        "keyName": "code",
        "condition": "eq",
        "keyValue": "=={{ $('Extract link code').item.json.code }}"
      }
    ]
  },
  "fieldsUi": {
    "fieldValues": [
      {
        "fieldId": "telegram_id",
        "fieldValue": "=={{ $('Extract link code').item.json.telegram_id }}"
      },
      {
        "fieldId": "used",
        "fieldValue": "true"
      }
    ]
  }
}
```

## Проверка

После исправления:
1. Узел должен выполниться без ошибок
2. Запись в `menohub_telegram_auth_codes` должна обновиться:
   - `telegram_id` = 374683580
   - `used` = true

## Важно

- Поле `id` в таблице `menohub_telegram_auth_codes` имеет тип UUID
- Код `"2VPM8A"` - это строка, не UUID
- Для фильтра по коду используйте поле `code`, а не `id`


