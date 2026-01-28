import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// Явно указываем, что этот route динамический (использует cookies)
export const dynamic = 'force-dynamic'

/**
 * Получает историю сообщений пользователя
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Получаем информацию о пользователе из сессии
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('telegram_session')?.value

    if (!sessionToken) {
      return NextResponse.json({
        success: true,
        messages: [],
      })
    }

    let dbUserId: string | null = null

    try {
      const sessionData = JSON.parse(
        Buffer.from(sessionToken, 'base64').toString()
      )
      dbUserId = sessionData.userId
    } catch (e) {
      return NextResponse.json({
        success: true,
        messages: [],
      })
    }

    if (!dbUserId) {
      return NextResponse.json({
        success: true,
        messages: [],
      })
    }

    // Находим пользователя в БД по user_id (независимо от наличия telegram_id)
    const { data: user, error: userError } = await supabase
      .from('menohub_users')
      .select('id')
      .eq('id', dbUserId)
      .single()

    if (userError || !user) {
      return NextResponse.json({
        success: true,
        messages: [],
      })
    }

    // Получаем историю запросов по user_id (работает и без telegram_id)
    // Включаем все сообщения независимо от источника (telegram или website)
    const { data: queries, error: queriesError } = await supabase
      .from('menohub_queries')
      .select('id, query_text, response_text, created_at, query_status, source')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(50) // Последние 50 сообщений

    if (queriesError) {
      console.error('Error fetching chat history:', queriesError)
      return NextResponse.json({
        success: true,
        messages: [],
      })
    }

    // Форматируем сообщения: каждому запросу соответствует ответ
    // Включаем информацию об источнике для отображения в UI
    const messages: any[] = []
    queries?.forEach((query) => {
      if (query.query_text && query.query_text !== 'processing') {
        messages.push({
          id: `${query.id}-query`,
          query_text: query.query_text,
          response_text: null,
          created_at: query.created_at,
          type: 'user',
          source: query.source || 'website', // Источник сообщения
        })
      }
      if (query.response_text && query.response_text !== 'processing' && query.query_status === 'completed') {
        messages.push({
          id: `${query.id}-response`,
          query_text: null,
          response_text: query.response_text,
          created_at: query.created_at,
          type: 'bot',
          source: query.source || 'website', // Источник ответа
        })
      }
    })

    return NextResponse.json({
      success: true,
      messages,
    })
  } catch (error) {
    console.error('Error in history API:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}





