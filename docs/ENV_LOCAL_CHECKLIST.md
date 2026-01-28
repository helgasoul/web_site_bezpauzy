# Чеклист переменных для .env.local

## ✅ ОБЯЗАТЕЛЬНЫЕ (для работы бота и синхронизации)

```env
# ============================================
# SUPABASE
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ============================================
# TELEGRAM BOT
# ============================================
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_USERNAME=bezpauzy_bot

# ============================================
# AI - OPENAI (для агента)
# ============================================
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# ============================================
# AI - LAKERA (защита)
# ============================================
LAKERA_API_KEY=03cfefe9b3d7bf4768971d846d863d779272e71b74eeb2ed2f5acd290cabd470

# ============================================
# JWT
# ============================================
JWT_SECRET=your-jwt-secret-key-here-minimum-32-characters

# ============================================
# SITE URL
# ============================================
NEXT_PUBLIC_SITE_URL=https://bezpauzy.ru
```

## 📋 Где получить ключи

1. **Supabase**: Dashboard → Settings → API
2. **Telegram Bot Token**: @BotFather в Telegram
3. **OpenAI API Key**: https://platform.openai.com/api-keys
4. **Lakera API Key**: Уже есть в n8n workflow (используйте тот же)
5. **JWT_SECRET**: Сгенерируйте: `openssl rand -base64 32`

## ⚠️ Важно

- Все переменные без `NEXT_PUBLIC_` доступны только на сервере
- Никогда не коммитьте `.env.local` в Git
- После добавления переменных перезапустите сервер: `npm run dev`
