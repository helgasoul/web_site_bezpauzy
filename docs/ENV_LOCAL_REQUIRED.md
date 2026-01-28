# Переменные окружения для .env.local

## 📋 Полный список переменных для работы бота и синхронизации чата

### ✅ ОБЯЗАТЕЛЬНЫЕ (уже должны быть)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# URL сайта
NEXT_PUBLIC_SITE_URL=https://bezpauzy.ru

# Telegram Bot
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_USERNAME=bezpauzy_bot

# JWT для сессий
JWT_SECRET=your-jwt-secret-key-here-minimum-32-characters
```

### ⚠️ НОВЫЕ - для работы AI агента и синхронизации

```env
# OpenAI (для агента, как в n8n)
OPENAI_API_KEY=sk-...

# ИЛИ Anthropic Claude (альтернатива OpenAI)
ANTHROPIC_API_KEY=sk-ant-...

# Lakera AI (защита от промпт-инжекции)
LAKERA_API_KEY=03cfefe9b3d7bf4768971d846d863d779272e71b74eeb2ed2f5acd290cabd470

# Telegram Webhook Secret (опционально, для безопасности)
TELEGRAM_WEBHOOK_SECRET=your-webhook-secret-here
```

### 📝 ОПЦИОНАЛЬНЫЕ (для дополнительных функций)

```env
# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=Без |Паузы <noreply@bezpauzy.ru>

# YooKassa (платежи)
YOOKASSA_SHOP_ID=your-shop-id
YOOKASSA_SECRET_KEY=your-secret-key

# Upstash Redis (rate limiting)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token-here

# Telegram канал и админ
TELEGRAM_CHANNEL=@bezpauzy_channel
TELEGRAM_ADMIN_CHAT_ID=123456789

# Аналитика
NEXT_PUBLIC_YANDEX_METRIKA_ID=12345678
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## 🎯 Минимальный набор для работы бота

Если хотите только базовую функциональность бота:

```env
# Supabase (обязательно)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Telegram (обязательно)
TELEGRAM_BOT_TOKEN=...

# AI (выберите один)
OPENAI_API_KEY=...  # ИЛИ
ANTHROPIC_API_KEY=...

# Безопасность (рекомендуется)
LAKERA_API_KEY=...

# JWT (обязательно)
JWT_SECRET=...
```

## 📌 Примечания

1. **OpenAI ИЛИ Anthropic**: Можно использовать оба, но для агента нужен один основной
2. **Lakera API Key**: Уже есть в n8n workflow, используйте тот же
3. **TELEGRAM_WEBHOOK_SECRET**: Опционально, но рекомендуется для безопасности
4. **JWT_SECRET**: Сгенерируйте случайную строку минимум 32 символа

## 🔐 Генерация JWT_SECRET

```bash
# В терминале:
openssl rand -base64 32
```

## ✅ Проверка

После добавления переменных перезапустите dev сервер:
```bash
npm run dev
```
