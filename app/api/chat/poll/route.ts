import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// Явно указываем, что этот route динамический (использует searchParams и cookies)
export const dynamic = 'force-dynamic'

/**
 * Polling endpoint для проверки новых ответов на запросы
 * Используется для обновления интерфейса чата в реальном времени
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lastQueryId = searchParams.get('lastQueryId')
    const lastTimestamp = searchParams.get('lastTimestamp')

    if (!lastQueryId) {
      return NextResponse.json(
        { error: 'lastQueryId обязателен' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Получаем информацию о пользователе из сессии
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('telegram_session')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    let userTelegramId: number | null = null
    let dbUserId: string | null = null

    try {
      const sessionData = JSON.parse(
        Buffer.from(sessionToken, 'base64').toString()
      )
      userTelegramId = sessionData.telegramId
      dbUserId = sessionData.userId
    } catch (e) {
      return NextResponse.json(
        { error: 'Невалидная сессия' },
        { status: 401 }
      )
    }

    // Находим пользователя
    const { data: user, error: userError } = await supabase
      .from('menohub_users')
      .select('id')
      .eq('telegram_id', userTelegramId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    // Проверяем, обновился ли запрос
    const { data: query, error: queryError } = await supabase
      .from('menohub_queries')
      .select('id, response_text, query_status, updated_at')
      .eq('id', lastQueryId)
      .eq('user_id', user.id)
      .single()

    if (queryError || !query) {
      return NextResponse.json({
        success: true,
        hasUpdate: false,
      })
    }

    // Проверяем, изменился ли ответ
    const hasUpdate =
      query.query_status === 'completed' &&
      query.response_text &&
      query.response_text !== 'processing' &&
      (!lastTimestamp || new Date(query.updated_at) > new Date(lastTimestamp))

    return NextResponse.json({
      success: true,
      hasUpdate,
      response: hasUpdate ? query.response_text : null,
      status: query.query_status,
      updatedAt: query.updated_at,
    })
  } catch (error) {
    console.error('Error in poll API:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}





