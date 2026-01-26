import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'

// Явно указываем, что этот route динамический (использует request.url)
export const dynamic = 'force-dynamic'

/**
 * GET /api/quiz/history
 * Получает историю результатов квизов для текущего пользователя
 * Query params:
 *   - testType: 'mrs' | 'inflammation' (опционально, для фильтрации)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const testType = searchParams.get('testType') // 'mrs' или 'inflammation'

    // Проверяем сессию пользователя через безопасную JWT проверку
    const sessionData = await getSession()

    if (!sessionData) {
      // Если пользователь не авторизован, возвращаем пустой массив
      return NextResponse.json({ results: [] })
    }

    const userId: number = sessionData.userId

    if (!userId || userId <= 0) {
      return NextResponse.json({ results: [] })
    }

    // Строим запрос
    let query = supabase
      .from('menohub_quiz_results')
      .select('id, test_type, total_score, severity, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Фильтруем по типу теста, если указан
    if (testType && (testType === 'mrs' || testType === 'inflammation')) {
      query = query.eq('test_type', testType)
    }

    const { data, error } = await query

    if (error) {
      // Логируем только в development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching quiz history:', error)
      }
      return NextResponse.json(
        {
          error: 'Не удалось получить историю результатов',
          ...(process.env.NODE_ENV === 'development' && { details: error.message }),
        },
        { status: 500 }
      )
    }

    // Форматируем результаты для клиента
    const formattedResults = (data || []).map((result) => ({
      id: result.id,
      testType: result.test_type,
      totalScore: result.total_score,
      severity: result.severity,
      createdAt: result.created_at,
      updatedAt: result.updated_at,
      // Форматируем дату для отображения
      formattedDate: new Date(result.created_at).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    }))

    return NextResponse.json({ results: formattedResults })
  } catch (error) {
    console.error('Error in quiz history API:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

