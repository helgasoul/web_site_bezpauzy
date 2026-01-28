# Исправление: Узел "Check if user exists" не возвращает output

## 🔴 Проблема

Узел "Check if user exists with telegram_id" не возвращает output, потому что:

1. **Неправильный фильтр**: Ищет по `telegram_id`, но нужно искать по `website_user_id`
2. **Неправильное название таблицы**: `mammohub_users` вместо `menohub_users`
3. **Логическая ошибка**: Пользователь приходит с сайта, у него еще нет `telegram_id` (или он равен 0)

## 📊 Текущая ситуация

**INPUT данных**:
```json
{
  "code": "8LI3AB",
  "telegram_id": 374683580,
  "website_user_id": 111,  // ← Это ID пользователя на сайте!
  "user_id": null
}
```

**Текущий фильтр узла**:
- Таблица: `mammohub_users` ❌ (должно быть `menohub_users`)
- Фильтр: `telegram_id = 374683580` ❌ (неправильно!)

**Проблема**: Пользователь с `id = 111` на сайте еще не имеет `telegram_id = 374683580` в базе данных. Нужно найти его по `id`, а не по `telegram_id`.

## ✅ Решение

### Шаг 1: Исправить название таблицы

**Было**: `mammohub_users`  
**Должно быть**: `menohub_users`

### Шаг 2: Изменить фильтр

**Было**:
```
Field: telegram_id
Condition: Equals
Value: {{ $('Extract link code').item.json.telegram_id }}
```

**Должно быть**:
```
Field: id
Condition: Equals
Value: {{ $('Get link code from DB').item.json.website_user_id }}
```

**Важно**: Используйте данные из узла "Get link code from DB", а не из "Extract link code", потому что в "Get link code from DB" есть `website_user_id`.

### Шаг 3: Настройки узла

**Параметры**:
- **Table Name or ID**: `menohub_users` ✅
- **Operation**: `Get Many` (или `Get` для одной записи)
- **Return All**: `off`
- **Limit**: `1` (достаточно одной записи)
- **Filter**: `Build Manually`
- **Must Match**: `All Filters`

**Фильтр**:
```
Field Name or ID: id - (bigint)
Condition: Equals
Field Value: {{ $('Get link code from DB').item.json.website_user_id }}
```

### Шаг 4: Настройка "Return Empty Results"

**Важно**: Включите опцию "Return Empty Results" в настройках узла, чтобы workflow не останавливался, если пользователь не найден.

**Как включить**:
1. Откройте настройки узла
2. Найдите опцию "Return Empty Results" или "Always Output Data"
3. Включите её (toggle в положение "on")

Или в настройках n8n:
- Settings → "Always Output Data" → включить

## 🔄 Правильный flow

```
1. Extract link code
   → Извлекает код из сообщения
   ↓
2. Get link code from DB
   → Находит код в базе
   → Получает website_user_id = 111
   ↓
3. Check if user exists (по website_user_id) ✅
   → Ищет пользователя: id = 111
   → Находит пользователя с id = 111
   → Возвращает данные пользователя
   ↓
4. Update user telegram_id and consent
   → Обновляет: telegram_id = 374683580
   → Устанавливает: consent_granted = true
```

## 📝 Пример правильной конфигурации узла

**Узел**: "Check if user exists by website_user_id"

**Тип**: Supabase  
**Operation**: Get Many  
**Table Name or ID**: `menohub_users`  
**Return All**: `off`  
**Limit**: `1`  
**Filter**: Build Manually  
**Must Match**: All Filters

**Filters**:
```
Field Name or ID: id - (bigint)
Condition: Equals
Field Value: {{ $('Get link code from DB').item.json.website_user_id }}
```

**Настройки**:
- Return Empty Results: `on` (или Always Output Data в настройках n8n)

## ✅ Ожидаемый результат

После исправления:

**INPUT**:
```json
{
  "website_user_id": 111
}
```

**OUTPUT** (если пользователь найден):
```json
[
  {
    "id": 111,
    "username": "helgasoul",
    "telegram_id": 0,
    "consent_granted": true,
    "created_at": "2025-12-21T...",
    ...
  }
]
```

**OUTPUT** (если пользователь не найден):
```json
[]
```

## 🔍 Проверка

После исправления проверьте:

1. ✅ Таблица: `menohub_users` (не `mammohub_users`)
2. ✅ Фильтр: `id = website_user_id` (не `telegram_id`)
3. ✅ Источник данных: из узла "Get link code from DB"
4. ✅ Return Empty Results: включено
5. ✅ Узел возвращает данные пользователя или пустой массив

## 📁 Связанные документы

- `docs/n8n-fix-consent-on-link-code.md` - общая логика обработки link_CODE
- `docs/n8n-fix-duplicate-users.md` - решение проблемы дубликатов

