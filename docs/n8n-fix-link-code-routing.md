# Исправление: Сообщения с link_ не доходят до узла "IF Link_?"

## Проблема

Когда пользователь отправляет просто `link_КОД` (без `/start`), сообщение не доходит до узла "IF Link_?", потому что:

1. Узел "If" проверяет, содержит ли сообщение `/start`
2. Если ДА → идет в "IF Link_?"
3. Если НЕТ → идет в "If3" (другая ветка)

**Результат**: Сообщения с `link_КОД` без `/start` идут в неправильную ветку.

## Текущая структура

```
Telegram Trigger
  ↓
If1 (была нажата кнопка?)
  ↓ (false - это текстовое сообщение)
If (содержит "/start"?)
  ├─ (true) → IF Link_? (содержит "link_"?)
  │            ├─ (true) → Extract link code → ...
  │            └─ (false) → Send a text message (согласие)
  └─ (false) → If3 (другая логика) ❌ ПРОБЛЕМА: link_КОД идет сюда!
```

## Решение 1: Добавить отдельную ветку для `link_` без `/start`

**Добавить новый узел** после "If1" (перед "If"):

### Новый узел: "IF message starts with link_"

**Тип**: IF  
**Позиция**: После "If1", параллельно с "If"

**Условие**:
```json
{
  "leftValue": "={{ $('Telegram Trigger').item.json.message.text }}",
  "rightValue": "link_",
  "operator": {
    "type": "string",
    "operation": "startsWith"
  }
}
```

**Соединения**:
- `true` → "Extract link code" (использовать существующий узел)
- `false` → Существующий узел "If" (проверка `/start`)

### Обновленная структура:

```
Telegram Trigger
  ↓
If1 (была нажата кнопка?)
  ↓ (false - это текстовое сообщение)
IF message starts with link_ (НОВЫЙ УЗЕЛ)
  ├─ (true) → Extract link code → Get link code from DB → ...
  └─ (false) → If (содержит "/start"?)
                ├─ (true) → IF Link_? → ...
                └─ (false) → If3
```

## Решение 2: Обновить узел "Extract link code" для обработки обоих форматов

**Текущий код** (обрабатывает только `/start link_КОД`):
```javascript
const linkMatch = messageText.match(/\/start\s+link_([A-Z0-9]{6})/i);
```

**Обновленный код** (обрабатывает оба формата):
```javascript
const messageText = $('Telegram Trigger').first().json.message.text || '';
const telegramId = $('Telegram Trigger').first().json.message.from.id;

console.log('=== Extract link code ===');
console.log('Message text:', messageText);

let code = null;

// Вариант 1: /start link_КОД (из deep link)
const startMatch = messageText.match(/\/start\s*link_([A-Z0-9]{6})/i);
if (startMatch && startMatch[1]) {
  code = startMatch[1].toUpperCase();
  console.log('Found code in /start command:', code);
}

// Вариант 2: link_КОД (пользователь отправил вручную, без /start)
if (!code) {
  const linkMatch = messageText.match(/^link_([A-Z0-9]{6})$/i);
  if (linkMatch && linkMatch[1]) {
    code = linkMatch[1].toUpperCase();
    console.log('Found code as standalone message:', code);
  }
}

if (!code || code.length !== 6) {
  console.error('Failed to extract code from:', messageText);
  return [{
    json: {
      error: 'Invalid link code format',
      telegram_id: telegramId,
      message_text: messageText
    }
  }];
}

console.log('Code extracted:', code);

return [{
  json: {
    code: code,
    telegram_id: telegramId,
    user_id: null // Будет заполнено из БД
  }
}];
```

## Решение 3: Изменить порядок проверок (рекомендуется)

**Изменить структуру workflow** так, чтобы сначала проверялось наличие `link_`, а потом `/start`:

### Новая структура:

```
Telegram Trigger
  ↓
If1 (была нажата кнопка?)
  ↓ (false - это текстовое сообщение)
IF message contains "link_" (ПЕРВАЯ ПРОВЕРКА)
  ├─ (true) → Extract link code → Get link code from DB → ...
  └─ (false) → If (содержит "/start"?)
                ├─ (true) → Send a text message (согласие)
                └─ (false) → If3 (другая логика)
```

**Преимущества**:
- Обрабатывает `link_КОД` в любом формате
- Не требует дублирования логики
- Проще в поддержке

## Рекомендуемый порядок действий

1. **Использовать Решение 3** (изменить порядок проверок)
2. **Обновить узел "Extract link code"** согласно Решению 2
3. **Протестировать**:
   - `/start link_ABC123` → должно работать
   - `link_ABC123` → должно работать
   - `/start` → должно показать согласие

## Как применить в n8n

1. Откройте workflow в n8n
2. Найдите узел "If" (проверка `/start`)
3. Перед ним добавьте новый узел "IF message contains link_"
4. Настройте соединения:
   - `true` → "Extract link code"
   - `false` → "If" (существующий узел)
5. Обновите узел "Extract link code" для обработки обоих форматов

## Альтернатива: Использовать Switch узел

Можно использовать Switch узел для более гибкой маршрутизации:

```
Telegram Trigger
  ↓
Switch (по типу сообщения)
  ├─ Route 1: содержит "link_" → Extract link code
  ├─ Route 2: содержит "/start" → Send согласие
  └─ Route 3: другое → If3
```

Это более гибкое решение, но требует больше настроек.

