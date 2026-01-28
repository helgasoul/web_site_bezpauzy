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
 * 2. Сохраняем запрос в menohub_queries с source='website'
 * 3. Обрабатываем через единый обработчик (processMessage)
 * 4. Генерируем ответ через Claude API с RAG контекстом
 * 5. Сохраняем ответ в menohub_queries
 * 6. Возвращаем ответ пользователю
 * 
 * Синхронизация: Все сообщения сохраняются в единую таблицу menohub_queries,
 * что позволяет видеть историю и в Telegram, и на сайте.
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
        source: 'website', // Указываем источник для синхронизации
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

    try {
      // Используем единый обработчик сообщений
      // Это обеспечивает одинаковую логику для Telegram и сайта
      const { processMessage } = await import('@/lib/ai/message-processor')
      
      const response = await processMessage({
        userId: user.id,
        message: sanitizedMessage,
        source: 'website',
        queryId: queryRecord.id,
      })

      // Обновляем запрос с ответом
      await supabase
        .from('menohub_queries')
        .update({
          query_status: 'completed',
          response_text: response,
          updated_at: new Date().toISOString(),
        })
        .eq('id', queryRecord.id)

      return NextResponse.json({
        success: true,
        response: response,
        messageId: queryRecord.id,
      })
    } catch (error) {
      console.error('Error processing message:', error)

      // Обновляем статус на ошибку
      await supabase
        .from('menohub_queries')
        .update({
          query_status: 'failed',
          response_text: 'Произошла ошибка при обработке запроса.',
        })
        .eq('id', queryRecord.id)

      return NextResponse.json(
        { error: 'Произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте еще раз.' },
        { status: 500 }
      )
    }
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





