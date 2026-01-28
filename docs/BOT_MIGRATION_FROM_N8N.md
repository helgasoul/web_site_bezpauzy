# Миграция Telegram бота из n8n в Next.js проект

## 📋 Обзор

Этот документ описывает план миграции Telegram бота "Ева" из n8n workflow в Next.js проект, чтобы все было в одном месте и не требовало внешних зависимостей от n8n.

## 🔍 Анализ текущего n8n workflow

### Основные компоненты workflow:

1. **Telegram Trigger** - получение сообщений и callback_query
2. **Supabase операции** - работа с пользователями, запросами, врачами
3. **Claude API** - генерация ответов через LangChain Agent
4. **Lakera AI** - защита от промпт-инжекции
5. **YooKassa** - обработка платежей
6. **Обработка команд** - /start, /export_my_data, /delete_my_data и др.
7. **Обработка callback_query** - кнопки согласия, выбор возраста, темы и т.д.

## 🎯 Что нужно для интеграции

### 1. API ключи и токены

#### Обязательные:
- ✅ `TELEGRAM_BOT_TOKEN` - уже есть в `env.example`
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - уже есть
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - уже есть
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - уже есть

#### Нужно добавить:
- ⚠️ `ANTHROPIC_API_KEY` - для Claude API
- ⚠️ `LAKERA_API_KEY` - для защиты от промпт-инжекции (из n8n: `03cfefe9b3d7bf4768971d846d863d779272e71b74eeb2ed2f5acd290cabd470`)
- ⚠️ `YOOKASSA_SHOP_ID` - уже есть в env.example
- ⚠️ `YOOKASSA_SECRET_KEY` - уже есть в env.example

### 2. Зависимости (npm packages)

Нужно установить:

```bash
npm install @anthropic-ai/sdk          # Claude API
npm install @langchain/anthropic       # LangChain для Claude
npm install @langchain/core            # LangChain core
npm install node-telegram-bot-api      # Telegram Bot API (опционально, можно использовать fetch)
```

### 3. Структура проекта

```
app/
├── api/
│   └── telegram/
│       └── webhook/
│           └── route.ts              # Webhook для Telegram
│
lib/
├── telegram/
│   ├── bot.ts                       # Уже есть (базовая отправка)
│   ├── webhook-handler.ts           # Обработчик webhook событий
│   ├── commands.ts                  # Обработка команд (/start, /export и т.д.)
│   ├── callbacks.ts                 # Обработка callback_query
│   └── message-handler.ts           # Обработка обычных сообщений
│
├── ai/
│   ├── claude.ts                    # Интеграция с Claude API
│   ├── lakera.ts                    # Защита от промпт-инжекции
│   └── rag.ts                       # RAG система (поиск в knowledge_base)
│
└── yookassa/
    └── payment-handler.ts            # Обработка платежей YooKassa
```

## 🚀 План миграции

### Этап 1: Настройка Telegram Webhook

**Файл:** `app/api/telegram/webhook/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { handleTelegramWebhook } from '@/lib/telegram/webhook-handler'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Верификация webhook (опционально, но рекомендуется)
    // Telegram может отправлять секретный токен
    
    await handleTelegramWebhook(body)
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Настройка webhook в Telegram:**
```bash
curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/api/telegram/webhook"}'
```

### Этап 2: Обработчик команд

**Файл:** `lib/telegram/commands.ts`

Основные команды из n8n:
- `/start` - приветствие и согласие
- `/export_my_data` - экспорт данных пользователя
- `/delete_my_data` - удаление данных пользователя
- `/cancel_subscription` - отмена подписки
- `/history` - история запросов

### Этап 3: Интеграция Claude API

**Файл:** `lib/ai/claude.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function generateResponse(
  userMessage: string,
  context: {
    userId: number
    conversationHistory?: Array<{ role: 'user' | 'assistant', content: string }>
    knowledgeBaseContext?: string
  }
): Promise<string> {
  // Получаем контекст из RAG
  const ragContext = await getRAGContext(userMessage)
  
  // Формируем промпт с контекстом
  const systemPrompt = `Ты Ева - медицинский ассистент для женщин в менопаузе...`
  
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      ...(context.conversationHistory || []),
      { role: 'user', content: userMessage }
    ],
  })
  
  return message.content[0].text
}
```

### Этап 4: Защита от промпт-инжекции (Lakera)

**Файл:** `lib/ai/lakera.ts`

```typescript
export async function checkPromptSafety(
  message: string
): Promise<{ safe: boolean; flagged: boolean; reasons?: string[] }> {
  const response = await fetch('https://api.lakera.ai/v2/guard', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.LAKERA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
      project_id: 'project-9332211015',
      breakdown: true,
    }),
  })
  
  const data = await response.json()
  
  return {
    safe: !data.flagged,
    flagged: data.flagged,
    reasons: data.breakdown?.categories || [],
  }
}
```

### Этап 5: RAG система

**Файл:** `lib/ai/rag.ts`

```typescript
import { createClient } from '@/lib/supabase/server'

export async function getRAGContext(
  query: string
): Promise<string> {
  const supabase = await createClient()
  
  // Поиск в knowledge_base по релевантности
  const { data } = await supabase
    .from('knowledge_base')
    .select('content, title')
    .textSearch('content', query, {
      type: 'websearch',
      config: 'russian',
    })
    .limit(5)
  
  if (!data || data.length === 0) {
    return ''
  }
  
  // Формируем контекст из найденных документов
  return data
    .map((doc) => `[${doc.title}]\n${doc.content}`)
    .join('\n\n---\n\n')
}
```

### Этап 6: Обработка callback_query

**Файл:** `lib/telegram/callbacks.ts`

Основные callback_data из n8n:
- `consent_agree` / `consent_decline` - согласие на обработку данных
- `age_40-45`, `age_46-50`, `age_50+` - выбор возраста
- `free_topic_*` - выбор бесплатных тем
- `Thank_you` - благодарность
- `listen_podcast` - прослушивание подкаста

## 📝 Переменные окружения

Добавьте в `.env.local`:

```env
# Claude API
ANTHROPIC_API_KEY=sk-ant-...

# Lakera AI (защита от промпт-инжекции)
LAKERA_API_KEY=03cfefe9b3d7bf4768971d846d863d779272e71b74eeb2ed2f5acd290cabd470

# Telegram Webhook Secret (опционально, для безопасности)
TELEGRAM_WEBHOOK_SECRET=your-secret-here
```

## 🔄 Миграция логики из n8n

### Основной flow обработки сообщения:

1. **Получение webhook** → `app/api/telegram/webhook/route.ts`
2. **Определение типа события:**
   - `message` → обычное сообщение
   - `callback_query` → нажатие кнопки
   - `command` → команда (/start и т.д.)
3. **Обработка:**
   - Команды → `lib/telegram/commands.ts`
   - Callback → `lib/telegram/callbacks.ts`
   - Сообщения → `lib/telegram/message-handler.ts`
4. **Для сообщений:**
   - Проверка безопасности (Lakera)
   - Получение контекста (RAG)
   - Генерация ответа (Claude)
   - Сохранение в БД
   - Отправка ответа

## ⚠️ Важные моменты

### 1. Безопасность webhook

Рекомендуется добавить проверку секретного токена:

```typescript
const webhookSecret = request.headers.get('x-telegram-bot-api-secret-token')
if (webhookSecret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### 2. Rate Limiting

Используйте существующий Upstash Redis для rate limiting запросов к боту.

### 3. Обработка ошибок

Все ошибки должны логироваться и не прерывать работу бота. Пользователю всегда должен приходить ответ.

### 4. Асинхронная обработка

Для длительных операций (генерация ответа, RAG поиск) используйте:
- Queue систему (можно использовать Supabase или внешний сервис)
- Или отправляйте "typing..." статус в Telegram

## 🧪 Тестирование

1. **Локальное тестирование:**
   - Используйте ngrok для создания публичного URL
   - Настройте webhook на ngrok URL
   - Тестируйте команды и сообщения

2. **Production:**
   - Настройте webhook на production URL
   - Мониторьте логи
   - Проверьте обработку ошибок

## 📊 Мониторинг

Рекомендуется добавить:
- Логирование всех запросов
- Метрики (количество сообщений, время ответа)
- Алерты на ошибки

## ✅ Чеклист миграции

- [ ] Установить зависимости
- [ ] Добавить переменные окружения
- [ ] Создать webhook endpoint
- [ ] Реализовать обработку команд
- [ ] Реализовать обработку callback_query
- [ ] Интегрировать Claude API
- [ ] Добавить Lakera защиту
- [ ] Реализовать RAG систему
- [ ] Настроить webhook в Telegram
- [ ] Протестировать все команды
- [ ] Протестировать обработку сообщений
- [ ] Настроить мониторинг
- [ ] Отключить n8n workflow (после успешного тестирования)

## 🔗 Полезные ссылки

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Anthropic Claude API](https://docs.anthropic.com/claude/reference)
- [Lakera AI](https://platform.lakera.ai/docs)
- [LangChain](https://js.langchain.com/docs/)

## 📞 Поддержка

Если возникнут вопросы при миграции, проверьте:
1. Логи в консоли
2. Telegram Bot API ответы
3. Supabase логи
4. Vercel функции логи (если используете)
