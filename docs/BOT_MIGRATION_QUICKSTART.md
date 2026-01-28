# Быстрый старт: Миграция бота из n8n

## ✅ Что уже готово

1. ✅ Webhook endpoint: `app/api/telegram/webhook/route.ts`
2. ✅ Обработчик webhook: `lib/telegram/webhook-handler.ts`
3. ✅ Обработка команд: `lib/telegram/commands.ts`
4. ✅ Документация: `docs/BOT_MIGRATION_FROM_N8N.md`

## 🚀 Следующие шаги

### 1. Установите зависимости

```bash
npm install @anthropic-ai/sdk @langchain/anthropic @langchain/core
```

### 2. Добавьте переменные окружения в `.env.local`

```env
# Claude API
ANTHROPIC_API_KEY=sk-ant-...

# Lakera AI (защита от промпт-инжекции)
LAKERA_API_KEY=03cfefe9b3d7bf4768971d846d863d779272e71b74eeb2ed2f5acd290cabd470

# Telegram Webhook Secret (опционально)
TELEGRAM_WEBHOOK_SECRET=your-secret-here
```

### 3. Создайте недостающие файлы

Нужно создать:
- `lib/telegram/message-handler.ts` - обработка обычных сообщений
- `lib/telegram/callbacks.ts` - обработка callback_query
- `lib/ai/claude.ts` - интеграция с Claude API
- `lib/ai/lakera.ts` - защита от промпт-инжекции
- `lib/ai/rag.ts` - RAG система

### 4. Настройте webhook в Telegram

После деплоя на production:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/api/telegram/webhook"}'
```

Для локального тестирования используйте ngrok:

```bash
# Установите ngrok: https://ngrok.com/
ngrok http 3000

# Используйте полученный URL для webhook
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-ngrok-url.ngrok.io/api/telegram/webhook"}'
```

## 📋 Чеклист

- [ ] Установлены зависимости
- [ ] Добавлены переменные окружения
- [ ] Создан `lib/telegram/message-handler.ts`
- [ ] Создан `lib/telegram/callbacks.ts`
- [ ] Создан `lib/ai/claude.ts`
- [ ] Создан `lib/ai/lakera.ts`
- [ ] Создан `lib/ai/rag.ts`
- [ ] Настроен webhook в Telegram
- [ ] Протестированы команды (/start, /export, /delete)
- [ ] Протестирована обработка сообщений
- [ ] Протестированы callback_query

## 🔍 Проверка работы

1. Отправьте `/start` боту в Telegram
2. Проверьте, что приходит сообщение с кнопками согласия
3. Нажмите "Согласен" - проверьте обработку callback
4. Отправьте текстовое сообщение - проверьте обработку

## 📚 Подробная документация

См. `docs/BOT_MIGRATION_FROM_N8N.md` для полного плана миграции.
