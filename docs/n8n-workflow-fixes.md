# Исправления для n8n workflow: Обработка /start и привязка Telegram

## Проблемы в текущем workflow

1. **Показ согласия для уже привязанных пользователей**: При `/start` без `link_` всегда показывается согласие, даже если пользователь уже привязан.
2. **Неправильное обновление `telegram_id`**: Узел "Update user telegram_id" использует `user_id` из кода, но он `null`. Нужно использовать `website_user_id`.

## Исправления

### 1. Добавить проверку существования пользователя перед показом согласия

**Место**: После узла "If" (проверка `/start`), перед узлом "IF Link_?"

**Новый узел**: "Check if user exists"

```javascript
// Тип: Code
// Позиция: между "If" и "IF Link_?"

const telegramId = $('Telegram Trigger').first().json.message.from.id;

// Проверяем, существует ли пользователь с таким telegram_id
// Если существует, значит уже привязан - не показываем согласие
return [{
  json: {
    telegram_id: telegramId,
    check_user: true
  }
}];
```

**Следующий узел**: "Get user from DB" (Supabase)

```json
{
  "operation": "getAll",
  "tableId": "menohub_users",
  "limit": 1,
  "matchType": "allFilters",
  "filters": {
    "conditions": [
      {
        "keyName": "telegram_id",
        "condition": "eq",
        "keyValue": "={{ $('Telegram Trigger').item.json.message.from.id }}"
      }
    ]
  }
}
```

**Узел "IF User exists"**: Проверка, найден ли пользователь

```json
{
  "conditions": {
    "conditions": [
      {
        "leftValue": "={{ $json.id }}",
        "rightValue": "",
        "operator": {
          "type": "string",
          "operation": "exists",
          "singleValue": true
        }
      }
    ],
    "combinator": "and"
  }
}
```

**Логика**:
- Если пользователь найден (уже привязан) → НЕ показывать согласие, перейти к обычному диалогу
- Если пользователь НЕ найден → проверить `link_` и показать согласие или обработать привязку

### 2. Исправить обновление `telegram_id` пользователя

**Узел**: "Update user telegram_id"

**Исправление**: Использовать `website_user_id` из найденного кода вместо `user_id`

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
        "keyValue": "={{ $('Get link code from DB').item.json.website_user_id }}"
      }
    ]
  },
  "fieldsUi": {
    "fieldValues": [
      {
        "fieldId": "telegram_id",
        "fieldValue": "={{ $('Extract link code').item.json.telegram_id }}"
      }
    ]
  }
}
```

**Важно**: Если `website_user_id` равен `null` (старая запись без этого поля), нужно обработать это отдельно или использовать альтернативный способ связи.

### 3. Обновленная структура workflow

```
Telegram Trigger
  ↓
If (содержит "/start")
  ↓ (true)
Check if user exists (Code)
  ↓
Get user from DB (Supabase)
  ↓
IF User exists
  ├─ (true) → Обычный диалог / приветствие (если уже привязан)
  └─ (false) → IF Link_?
                ├─ (true) → Extract link code → Get link code from DB → ...
                └─ (false) → Send a text message (согласие)
```

### 4. Альтернативное решение (если нет `website_user_id`)

Если в таблице `menohub_telegram_auth_codes` нет записи с `website_user_id` (старая запись), можно:

1. **Вариант A**: Использовать код для поиска пользователя через другой механизм
2. **Вариант B**: Сохранять `user_id` как TEXT (строковое представление BIGINT) в отдельном поле
3. **Вариант C**: Использовать только код для связи - бот находит код, обновляет `telegram_id` в коде, а затем ищет пользователя по другим признакам

### 5. Проверка кода перед обновлением

**Добавить проверку**: Убедиться, что `website_user_id` не `null` перед обновлением

**Новый узел**: "IF website_user_id exists" (после "Get link code from DB")

```json
{
  "conditions": {
    "conditions": [
      {
        "leftValue": "={{ $json.website_user_id }}",
        "rightValue": "",
        "operator": {
          "type": "string",
          "operation": "exists",
          "singleValue": true
        }
      }
    ],
    "combinator": "and"
  }
}
```

**Логика**:
- Если `website_user_id` существует → обновить пользователя
- Если `website_user_id` = `null` → показать сообщение об ошибке или использовать альтернативный способ

## Рекомендуемый порядок действий

1. **Выполнить миграцию** `013_fix_telegram_auth_codes_user_id.sql` в Supabase
2. **Обновить workflow** согласно исправлениям выше
3. **Протестировать**:
   - `/start` для нового пользователя (должно показать согласие)
   - `/start` для привязанного пользователя (НЕ должно показывать согласие)
   - `/start link_КОД` для привязки (должно обработать привязку)

## Дополнительные улучшения

1. **Логирование**: Добавить логирование всех шагов для отладки
2. **Обработка ошибок**: Добавить обработку случаев, когда код не найден, истек или уже использован
3. **Валидация**: Проверить формат кода перед поиском в БД

