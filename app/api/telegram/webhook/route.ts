import { NextRequest, NextResponse } from 'next/server'
import { handleTelegramWebhook } from '@/lib/telegram/webhook-handler'

/**
 * Telegram Bot Webhook Endpoint
 * 
 * Этот endpoint получает события от Telegram Bot API:
 * - Новые сообщения
 * - Callback queries (нажатия кнопок)
 * - Команды (/start, /export и т.д.)
 * 
 * После миграции из n8n, весь бот будет работать через этот endpoint.
 * 
 * Настройка webhook в Telegram:
 * curl -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
 *   -H "Content-Type: application/json" \
 *   -d '{"url": "https://your-domain.com/api/telegram/webhook"}'
 */
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Опциональная верификация webhook secret (если настроен)
    const webhookSecret = request.headers.get('x-telegram-bot-api-secret-token')
    if (process.env.TELEGRAM_WEBHOOK_SECRET) {
      if (webhookSecret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
        console.warn('⚠️ [Telegram Webhook] Invalid webhook secret')
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }
    
    // Обрабатываем webhook событие
    await handleTelegramWebhook(body)
    
    // Telegram требует быстрый ответ (в течение 60 секунд)
    // Долгая обработка должна быть асинхронной
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('❌ [Telegram Webhook] Error:', error)
    
    // Всегда возвращаем успешный ответ Telegram,
    // чтобы не было повторных попыток
    // Ошибки логируем, но не прерываем работу
    return NextResponse.json({ ok: true })
  }
}

/**
 * GET endpoint для проверки статуса webhook
 * Полезно для мониторинга и отладки
 */
export async function GET() {
  return NextResponse.json({
    status: 'active',
    message: 'Telegram webhook endpoint is running',
    timestamp: new Date().toISOString(),
  })
}
