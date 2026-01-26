import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Явно указываем, что этот route динамический (использует searchParams)
export const dynamic = 'force-dynamic'

/**
 * Получает опубликованные события платформы
 * GET /api/events?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fromDate = searchParams.get('from') // опциональная начальная дата
    const toDate = searchParams.get('to') // опциональная конечная дата

    const supabase = await createClient()

    let query = supabase
      .from('platform_events')
      .select('*')
      .eq('is_published', true)
      .order('event_date', { ascending: true })

    // Фильтрация по датам, если указаны
    if (fromDate) {
      query = query.gte('event_date', fromDate)
    }
    if (toDate) {
      query = query.lte('event_date', toDate)
    }

    const { data: events, error } = await query

    if (error) {
      // Если таблица не существует, возвращаем пустой массив
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return NextResponse.json({
          events: [],
          message: 'Таблица событий еще не создана'
        })
      }

      console.error('[events] Error fetching events:', error)
      return NextResponse.json(
        { error: 'Ошибка при загрузке событий' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      events: events || [],
      count: events?.length || 0
    })
  } catch (error: any) {
    console.error('[events] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

