# Формат Deep Link для привязки Telegram

## Формирование ссылки

В API роуте `/api/auth/link-telegram/generate-code/route.ts` deep link формируется так:

```typescript
const deepLink = `https://t.me/bezpauzy_bot?start=link_${code}`
```

**Пример**: `https://t.me/bezpauzy_bot?start=link_ABC123`

## Как Telegram обрабатывает deep link

Когда пользователь переходит по ссылке `https://t.me/bezpauzy_bot?start=link_ABC123`:

1. Telegram открывает бота
2. Автоматически отправляет команду: `/start link_ABC123`
3. Бот получает сообщение с текстом: `/start link_ABC123` (с пробелом между `/start` и `link_`)

## Обработка в n8n

### Узел "Extract link code"

Текущий код в узле:
```javascript
const linkMatch = messageText.match(/\/start\s+link_([A-Z0-9]{6})/i);
```

**Анализ регулярного выражения**:
- `/\/start\s+link_([A-Z0-9]{6})/i`
  - `\/start` - ищет `/start`
  - `\s+` - один или более пробелов (важно!)
  - `link_` - буквально `link_`
  - `([A-Z0-9]{6})` - захватывает 6 символов (буквы и цифры)
  - `i` - регистронезависимый поиск

**Это должно работать правильно**, так как Telegram отправляет `/start link_КОД` с пробелом.

### Альтернативные форматы (на случай проблем)

Если по какой-то причине Telegram отправляет без пробела (`/startlink_КОД`), можно использовать более гибкое регулярное выражение:

```javascript
// Более гибкое регулярное выражение
const linkMatch = messageText.match(/\/start\s*link_([A-Z0-9]{6})/i);
// \s* означает ноль или более пробелов
```

Или еще более универсальное:
```javascript
// Ищет link_ после /start, независимо от пробелов
const linkMatch = messageText.match(/\/start.*?link_([A-Z0-9]{6})/i);
```

## Проверка формата кода

Код генерируется так:
```typescript
const code = Math.random().toString(36).substring(2, 8).toUpperCase()
```

**Формат**: 6 символов, буквы и цифры (A-Z, 0-9), всегда в верхнем регистре.

**Примеры**: `ABC123`, `XYZ789`, `A1B2C3`

## Рекомендации для n8n workflow

1. **Текущее регулярное выражение должно работать**, так как Telegram всегда добавляет пробел между `/start` и параметрами.

2. **Если возникают проблемы**, можно добавить логирование в узел "Extract link code":
   ```javascript
   const messageText = $('Telegram Trigger').first().json.message.text || '';
   console.log('Received message:', messageText);
   
   const linkMatch = messageText.match(/\/start\s+link_([A-Z0-9]{6})/i);
   console.log('Link match:', linkMatch);
   
   if (!linkMatch || !linkMatch[1]) {
     // Логируем для отладки
     console.error('Failed to extract code from:', messageText);
     return [{
       json: {
         error: 'Invalid link code format',
         message_text: messageText
       }
     }];
   }
   ```

3. **Проверка длины кода**: Убедитесь, что код всегда 6 символов. Если код короче (например, из-за особенностей `Math.random().toString(36)`), можно добавить проверку:
   ```javascript
   const code = linkMatch[1].toUpperCase();
   if (code.length !== 6) {
     return [{
       json: {
         error: 'Invalid code length',
         code: code,
         length: code.length
       }
     }];
   }
   ```

## Тестирование

Для тестирования deep link:

1. **Сгенерируйте код** через API: `POST /api/auth/link-telegram/generate-code`
2. **Сформируйте ссылку**: `https://t.me/bezpauzy_bot?start=link_КОД`
3. **Откройте ссылку** в Telegram
4. **Проверьте**, что бот получил правильную команду `/start link_КОД`
5. **Проверьте**, что код правильно извлечен в n8n

## Возможные проблемы

1. **Код не извлекается**: Проверьте формат сообщения в логах n8n
2. **Код не найден в БД**: Убедитесь, что код сохранен в таблице `menohub_telegram_auth_codes`
3. **Код истек**: Код действителен 10 минут, проверьте `expires_at`
4. **Код уже использован**: Проверьте поле `used` в таблице

