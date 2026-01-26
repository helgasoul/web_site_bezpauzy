import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

/**
 * Временный диагностический endpoint для проверки результатов квизов
 * GET /api/debug/quiz-results
 * 
 * Возвращает:
 * - Информацию о текущем пользователе
 * - Все результаты квизов для этого пользователя
 * - Статистику по результатам
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Получаем информацию о сессии
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('telegram_session')?.value

    let sessionData = null
    let userId: number | null = null

    if (sessionToken) {
      try {
        sessionData = JSON.parse(
          Buffer.from(sessionToken, 'base64').toString()
        )
        
        // Преобразуем userId в number
        if (typeof sessionData.userId === 'string') {
          userId = parseInt(sessionData.userId, 10)
        } else if (typeof sessionData.userId === 'number') {
          userId = sessionData.userId
        }
      } catch (parseError) {
        console.error('Error parsing session:', parseError)
      }
    }

    // Получаем информацию о пользователе
    let userInfo = null
    if (userId) {
      const { data: user, error: userError } = await supabase
        .from('menohub_users')
        .select('id, username, telegram_id, created_at')
        .eq('id', userId)
        .single()

      if (!userError && user) {
        userInfo = user
      }
    }

    // Получаем все результаты квизов для пользователя
    type QuizResult = {
      id: string
      user_id: number | null
      email: string | null
      test_type: string
      total_score: number | null
      severity: string | null
      created_at: string
    }
    
    let quizResults: QuizResult[] = []
    let quizResultsError: string | null = null

    if (userId) {
      // Пробуем найти по user_id
      const { data: results, error: resultsError } = await supabase
        .from('menohub_quiz_results')
        .select('id, user_id, email, test_type, total_score, severity, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (!resultsError) {
        quizResults = (results || []) as QuizResult[]
      } else {
        quizResultsError = resultsError.message
      }
    }

    // Получаем общую статистику
    let allResultsCount = 0
    let resultsWithNullUserId = 0
    let resultsWithInvalidUserId = 0

    try {
      // Общее количество результатов
      const { count: totalCount } = await supabase
        .from('menohub_quiz_results')
        .select('*', { count: 'exact', head: true })

      allResultsCount = totalCount || 0

      // Результаты с NULL user_id
      const { count: nullCount } = await supabase
        .from('menohub_quiz_results')
        .select('*', { count: 'exact', head: true })
        .is('user_id', null)

      resultsWithNullUserId = nullCount || 0

      // Результаты с user_id, которого нет в menohub_users
      // Это сложнее проверить через Supabase, пропустим пока
    } catch (statsError) {
      console.error('Error getting statistics:', statsError)
    }

    // Проверяем структуру таблиц (типы данных)
    // Это требует прямого SQL запроса, который может не работать через Supabase client
    // Пропустим пока

    return NextResponse.json({
      success: true,
      session: {
        hasSession: !!sessionToken,
        userId: userId,
        userIdType: typeof userId,
        sessionData: sessionData ? {
          userId: sessionData.userId,
          userIdType: typeof sessionData.userId,
        } : null,
      },
      user: userInfo,
      quizResults: {
        count: quizResults.length,
        results: quizResults,
        error: quizResultsError,
      },
      statistics: {
        totalResultsInDatabase: allResultsCount,
        resultsWithNullUserId: resultsWithNullUserId,
        resultsWithInvalidUserId: resultsWithInvalidUserId,
      },
      diagnostics: {
        message: userId 
          ? `Найдено ${quizResults.length} результатов для user_id=${userId}` 
          : 'Не удалось определить user_id из сессии',
        recommendations: userId && quizResults.length === 0
          ? 'Пользователь найден, но результатов нет. Возможно, результаты сохранены с другим user_id или NULL.'
          : userId === null
          ? 'Не удалось определить user_id. Проверьте сессию.'
          : 'Все в порядке',
      },
    })
  } catch (error: any) {
    // Debug endpoint - логируем всегда, но детали только в development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in debug endpoint:', error)
    }
    return NextResponse.json(
      {
        success: false,
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      },
      { status: 500 }
    )
  }
}

