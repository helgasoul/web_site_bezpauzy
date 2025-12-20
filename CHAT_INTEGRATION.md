# Интеграция чата с ботом Ева

## Обзор

Интерфейс чата позволяет пользователям общаться с ботом Ева напрямую на сайте. Сообщения сохраняются в таблице `menohub_queries` и могут обрабатываться через n8n webhook или напрямую через Telegram Bot API.

## Структура

### Компоненты

- **`ChatInterface`** (`components/chat/ChatInterface.tsx`) - основной компонент чата
- **`/chat`** (`app/chat/page.tsx`) - страница с чатом

### API Endpoints

- **`POST /api/chat/send-message`** - отправка сообщения боту
- **`GET /api/chat/history`** - получение истории сообщений

## Как это работает

1. **Пользователь отправляет сообщение** через интерфейс чата
2. **Сообщение сохраняется** в таблицу `menohub_queries` со статусом `processing`
3. **Запрос отправляется** в n8n webhook (если настроен) или обрабатывается другим способом
4. **Ответ сохраняется** в ту же запись в `menohub_queries`
5. **Интерфейс обновляется** с ответом бота

## Настройка n8n Webhook

### Вариант 1: Webhook для обработки сообщений с сайта

Создайте новый workflow в n8n:

1. **Webhook Trigger** - принимает POST запросы
2. **Parse JSON** - извлекает данные:
   - `message` - текст сообщения
   - `telegram_id` - ID пользователя в Telegram
   - `user_id` - ID пользователя в БД
   - `query_id` - ID запроса в menohub_queries
   - `source` - "website"

3. **Get User from Supabase** - получает информацию о пользователе
4. **AI Agent** - обрабатывает запрос (используйте тот же AI Agent, что и для Telegram)
5. **Update Query in Supabase** - обновляет запись с ответом:
   ```sql
   UPDATE menohub_queries
   SET response_text = {{ $json.output }},
       query_status = 'completed'
   WHERE id = {{ $json.query_id }}
   ```

6. **HTTP Request** (опционально) - отправляет ответ обратно на сайт через Server-Sent Events или WebSocket

### Вариант 2: Polling из БД

Если webhook не подходит, можно использовать polling:

1. Создайте API endpoint `/api/chat/poll` который проверяет новые ответы
2. Frontend периодически (каждые 2-3 секунды) запрашивает новые ответы
3. Обновляет интерфейс при получении ответа

## Переменные окружения

Добавьте в `.env.local`:

```env
N8N_WEBHOOK_URL=https://ваш-n8n.com/webhook/chat
```

## Структура таблицы menohub_queries

Таблица должна содержать следующие поля (создается ботом):

```sql
CREATE TABLE menohub_queries (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES menohub_users(id),
    query_text TEXT NOT NULL,
    response_text TEXT,
    query_status TEXT DEFAULT 'processing', -- 'processing', 'completed', 'pending'
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Пример запроса к n8n Webhook

```typescript
POST https://ваш-n8n.com/webhook/chat
Content-Type: application/json

{
  "message": "Что такое приливы?",
  "telegram_id": 123456789,
  "user_id": "uuid-пользователя",
  "query_id": "uuid-запроса",
  "source": "website"
}
```

## Пример ответа от n8n

```json
{
  "success": true,
  "response": "Приливы — это внезапные волны жара...",
  "query_id": "uuid-запроса"
}
```

## Улучшения для production

1. **WebSocket или Server-Sent Events** - для real-time обновлений
2. **Rate limiting** - ограничение количества запросов
3. **Очередь сообщений** - для обработки большого количества запросов
4. **Кэширование** - для часто задаваемых вопросов
5. **Типизация сообщений** - для разных типов ответов (текст, кнопки, картинки)

## Безопасность

1. Проверка авторизации перед отправкой сообщений
2. Валидация входных данных
3. Rate limiting на уровне API
4. Санитизация HTML в ответах бота


