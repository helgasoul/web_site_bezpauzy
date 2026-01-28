# Настройка автоматической публикации контента

## Обзор

Система автоматически публикует новый контент (статьи, видео, гайды) в:
1. **Telegram канал** "Без |Паузы"
2. **Telegram бот** "Без |Паузы" (ассистент Ева)
3. **Email рассылку** всем подписчикам

## Архитектура

```
Новый контент в БД
    ↓
Database Trigger (Supabase)
    ↓
Таблица очереди (menohub_content_publish_queue)
    ↓
API /api/content/publish/queue/process (периодический вызов)
    ↓
API /api/content/publish
    ↓
┌─────────────┬──────────────┬─────────────┐
│  Telegram   │  Telegram    │    Email    │
│   Channel   │     Bot      │  Newsletter │
└─────────────┴──────────────┴─────────────┘
```

## Настройка

### 1. Переменные окружения

Добавьте в `.env.local`:

```env
# Telegram
TELEGRAM_BOT_TOKEN=ваш_токен_бота
TELEGRAM_CHANNEL=@bezpauzy_channel  # или chat_id канала

# Email (Resend)
RESEND_API_KEY=ваш_resend_api_key
EMAIL_FROM=noreply@bezpauzy.com
EMAIL_FROM_NAME=Без |Паузы

# Site URL
NEXT_PUBLIC_SITE_URL=https://bezpauzy.com
```

### 2. Получение токена Telegram бота

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/newbot` и следуйте инструкциям
3. Скопируйте токен бота
4. Добавьте бота администратором в канал (если публикуете в канал)

### 3. Настройка Telegram канала

1. Создайте канал в Telegram
2. Добавьте бота как администратора канала
3. Убедитесь, что бот имеет права на публикацию сообщений
4. Укажите username канала в `TELEGRAM_CHANNEL` (например, `@bezpauzy_channel`)

### 4. Настройка Resend (Email)

1. Зарегистрируйтесь на [resend.com](https://resend.com)
2. Создайте API ключ
3. Добавьте домен и настройте DNS записи
4. Добавьте API ключ в `.env.local`

### 5. Выполнение миграции

Выполните SQL миграцию в Supabase:

```sql
-- Файл: supabase/migrations/031_create_content_publish_triggers.sql
```

Это создаст:
- Таблицу очереди публикаций
- Триггеры для автоматического создания задач при публикации контента

### 6. Настройка обработки очереди

#### Вариант 1: Cron Job (рекомендуется)

Создайте cron job, который будет вызывать API каждые 5 минут:

```bash
# Добавьте в crontab
*/5 * * * * curl -X POST https://bezpauzy.com/api/content/publish/queue/process
```

#### Вариант 2: Vercel Cron (если используете Vercel)

Создайте файл `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/content/publish/queue/process",
    "schedule": "*/5 * * * *"
  }]
}
```

#### Вариант 3: Ручной вызов

Можно вызывать вручную через API или создать админ-панель.

## Использование

### Автоматическая публикация

Когда вы публикуете контент в Supabase (устанавливаете `published = true`), система автоматически:

1. Создает задачу в очереди
2. При следующем вызове `/api/content/publish/queue/process`:
   - Публикует в Telegram канал
   - Отправляет email рассылку
   - Обновляет статус задачи

### Ручная публикация

Вы можете вызвать API напрямую:

```bash
curl -X POST https://bezpauzy.com/api/content/publish \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "blog",
    "contentId": "uuid-статьи",
    "skipTelegram": false,
    "skipEmail": false
  }'
```

### Просмотр очереди

```bash
curl https://bezpauzy.com/api/content/publish/queue?status=pending&limit=10
```

## Форматирование сообщений

### Telegram

Сообщения форматируются автоматически с:
- Эмодзи для типа контента
- Заголовком и описанием
- Ссылками на сайт и бота
- Информацией об авторе и категории

### Email

Email рассылки содержат:
- Красивый HTML шаблон
- Изображение контента (если есть)
- Кнопки для перехода на сайт и в бот
- Текстовую версию для старых клиентов

## Отладка

### Проверка логов

Все операции логируются в консоль сервера:
- `✅` - успешные операции
- `❌` - ошибки
- `⚠️` - предупреждения

### Проверка очереди

```sql
SELECT * FROM menohub_content_publish_queue 
WHERE status = 'pending' 
ORDER BY created_at DESC;
```

### Проверка ошибок

```sql
SELECT * FROM menohub_content_publish_queue 
WHERE status = 'failed' 
ORDER BY created_at DESC;
```

## Безопасность

1. **API защита**: Добавьте проверку авторизации в `/api/content/publish`
2. **Rate limiting**: Ограничьте частоту вызовов API
3. **Валидация**: Проверяйте входные данные
4. **Логирование**: Ведите логи всех операций

## Расширение функциональности

### Добавление новых типов контента

1. Обновите `formatTelegramMessage` и `formatEmailHTML` в `lib/content/formatter.ts`
2. Добавьте обработку в `app/api/content/publish/route.ts`
3. Добавьте триггер в миграцию

### Кастомизация сообщений

Измените функции форматирования в `lib/content/formatter.ts` для изменения стиля сообщений.

### Интеграция с другими сервисами

Добавьте новые функции в соответствующие библиотеки:
- `lib/telegram/` - для Telegram
- `lib/email/` - для email
- `lib/content/` - для форматирования

## Troubleshooting

### Telegram: "Chat not found"
- Убедитесь, что бот добавлен в канал как администратор
- Проверьте правильность username канала

### Email: "Invalid API key"
- Проверьте правильность `RESEND_API_KEY`
- Убедитесь, что домен настроен в Resend

### Очередь не обрабатывается
- Проверьте, что cron job настроен правильно
- Проверьте логи сервера на ошибки
- Убедитесь, что миграция выполнена

