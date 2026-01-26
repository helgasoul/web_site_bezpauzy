import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'
import { sanitizeInput } from '@/lib/utils/sanitize'
import { z } from 'zod'

const sendMessageSchema = z.object({
  message: z.string().min(1).max(4000, 'Сообщение не может быть длиннее 4000 символов'),
  userId: z.number().int().positive().optional(),
  telegramId: z.number().int().positive().optional(),
})

/**
 * Отправляет сообщение боту и получает ответ
 * 
 * Flow:
 * 1. Получаем сообщение от пользователя
 * 2. Сохраняем запрос в menohub_queries
 * 3. Отправляем запрос в n8n webhook или напрямую в Telegram Bot API
 * 4. Получаем ответ и сохраняем в menohub_queries
 * 5. Возвращаем ответ пользователю
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Валидация входных данных с помощью Zod
    const validationResult = sendMessageSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Неверные данные запроса',
          ...(process.env.NODE_ENV === 'development' && {
            details: validationResult.error.errors.map((err) => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          }),
        },
        { status: 400 }
      )
    }

    const { message, userId: paramUserId, telegramId: paramTelegramId } = validationResult.data

    const supabase = await createClient()

    // Получаем информацию о пользователе из сессии или параметров
    let userTelegramId = paramTelegramId || null
    let dbUserId = paramUserId || null

    if (!dbUserId) {
      // Пытаемся получить из безопасной JWT сессии
      const sessionData = await getSession()
      if (sessionData) {
        userTelegramId = sessionData.telegramId || null
        dbUserId = sessionData.userId
      }
    }

    if (!dbUserId) {
      return NextResponse.json(
        { error: 'Необходима авторизация. Пожалуйста, войдите в аккаунт.' },
        { status: 401 }
      )
    }

    // Находим пользователя в БД по user_id (работает и без telegram_id)
    const { data: user, error: userError } = await supabase
      .from('menohub_users')
      .select('id, telegram_id, subscription_status')
      .eq('id', dbUserId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Пользователь не найден. Пожалуйста, зарегистрируйтесь.' },
        { status: 404 }
      )
    }

    // Проверяем подписку (если требуется)
    if (user.subscription_status !== 'active') {
      return NextResponse.json(
        { error: 'Для общения с Евой необходима активная подписка.' },
        { status: 403 }
      )
    }

    // Санитизация сообщения перед сохранением
    const sanitizedMessage = sanitizeInput(message, 4000)

    // Сохраняем запрос в БД
    const { data: queryRecord, error: queryError } = await supabase
      .from('menohub_queries')
      .insert({
        user_id: user.id,
        query_text: sanitizedMessage,
        query_status: 'processing',
        response_text: 'processing',
      })
      .select()
      .single()

    if (queryError || !queryRecord) {
      console.error('Error saving query:', queryError)
      return NextResponse.json(
        { error: 'Не удалось сохранить запрос' },
        { status: 500 }
      )
    }

    // Отправляем запрос в n8n webhook или Telegram Bot API
    // Вариант 1: Через n8n webhook (если настроен и есть telegram_id)
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL

    if (n8nWebhookUrl && user.telegram_id) {
      try {
        const webhookResponse = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: sanitizedMessage,
            telegram_id: user.telegram_id,
            user_id: user.id,
            query_id: queryRecord.id,
            source: 'website',
          }),
        })

        if (webhookResponse.ok) {
          const webhookData = await webhookResponse.json()
          
          // Обновляем запрос с ответом
          await supabase
            .from('menohub_queries')
            .update({
              query_status: 'completed',
              response_text: webhookData.response || webhookData.message || 'Ответ получен',
            })
            .eq('id', queryRecord.id)

          return NextResponse.json({
            success: true,
            response: webhookData.response || webhookData.message || 'Ответ получен',
            messageId: queryRecord.id,
          })
        }
      } catch (webhookError) {
        console.error('Webhook error:', webhookError)
        // Продолжаем к альтернативному методу
      }
    }

    // Вариант 2: Прямой запрос к Telegram Bot API (если бот может обрабатывать через polling)
    // Или просто сохраняем и возвращаем сообщение о том, что запрос обрабатывается
    // В реальности, лучше использовать n8n webhook или polling из БД

    // Временное решение: возвращаем сообщение о том, что запрос сохранен
    // В production нужно настроить webhook или polling
    await supabase
      .from('menohub_queries')
      .update({
        query_status: 'pending',
        response_text: 'Ваш запрос получен и будет обработан в ближайшее время. Пожалуйста, проверьте ответ в Telegram боте.',
      })
      .eq('id', queryRecord.id)

    return NextResponse.json({
      success: true,
      response: 'Ваш запрос получен и будет обработан в ближайшее время. Пожалуйста, проверьте ответ в Telegram боте или обновите страницу через несколько секунд.',
      messageId: queryRecord.id,
      note: 'Для полной функциональности настройте n8n webhook или используйте polling из БД',
    })
  } catch (error) {
    // Логируем только в development
    if (process.env.NODE_ENV === 'development') {
      if (error instanceof z.ZodError) {
        console.error('Validation error in send-message API:', error.errors)
      } else {
        console.error('Error in send-message API:', error)
      }
    }
    
    // Если это ошибка валидации, возвращаем 400
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Неверные данные запроса',
          ...(process.env.NODE_ENV === 'development' && {
            details: error.errors.map((err) => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          }),
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}





