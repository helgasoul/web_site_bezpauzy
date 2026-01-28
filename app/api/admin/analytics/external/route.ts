import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/middleware'
import { getYandexMetricaData, formatDateForYM } from '@/lib/analytics/yandex-metrica'

/**
 * GET /api/admin/analytics/external - Get external analytics data
 * Получает данные из Google Analytics 4 и Yandex.Metrica
 */
export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await requireAdmin(request)
    if (!admin || error) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate') || formatDateForYM(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    const endDate = searchParams.get('endDate') || formatDateForYM(new Date())

    const response: any = {
      period: {
        start: startDate,
        end: endDate,
      },
      yandexMetrica: null,
      googleAnalytics: null,
    }

    // Yandex.Metrica данные
    const ymCounterId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID
    const ymOAuthToken = process.env.YANDEX_METRICA_OAUTH_TOKEN

    if (ymCounterId && ymOAuthToken) {
      try {
        // Получаем основные метрики: визиты, просмотры, пользователи
        const ymData = await getYandexMetricaData(
          ymCounterId,
          ymOAuthToken,
          startDate,
          endDate,
          ['ym:s:visits', 'ym:s:pageviews', 'ym:s:users'],
          ['ym:s:date']
        )

        if (ymData) {
          response.yandexMetrica = {
            visits: ymData.totals?.[0] || 0,
            pageviews: ymData.totals?.[1] || 0,
            users: ymData.totals?.[2] || 0,
            data: ymData.data || [],
          }
        }
      } catch (error) {
        console.error('❌ [Yandex.Metrica] Error:', error)
      }
    } else {
      response.yandexMetrica = {
        error: 'Yandex.Metrica не настроен. Добавьте NEXT_PUBLIC_YANDEX_METRIKA_ID и YANDEX_METRICA_OAUTH_TOKEN',
      }
    }

    // Google Analytics 4 данные
    const ga4Id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

    if (ga4Id) {
      // TODO: Реализовать получение данных из GA4 Data API
      // Требуется настройка Service Account или OAuth
      response.googleAnalytics = {
        error: 'Google Analytics 4 Data API пока не настроен',
      }
    } else {
      response.googleAnalytics = {
        error: 'Google Analytics не настроен. Добавьте NEXT_PUBLIC_GA_MEASUREMENT_ID',
      }
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('❌ [Admin Analytics External] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
