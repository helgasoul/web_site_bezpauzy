import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/middleware'
import { createServiceRoleClient } from '@/lib/supabase/server'

// GET /api/admin/analytics/trends - Get trends data for charts
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
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const supabase = createServiceRoleClient()

    const end = endDate ? new Date(endDate) : new Date()
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const startISO = start.toISOString()
    const endISO = end.toISOString()

    // 1. Рост пользователей по дням
    const { data: usersData } = await supabase
      .from('menohub_users')
      .select('created_at')
      .gte('created_at', startISO)
      .lte('created_at', endISO)
      .order('created_at', { ascending: true })

    // 2. Запросы в чат по дням
    const { data: queriesData } = await supabase
      .from('menohub_queries')
      .select('created_at')
      .gte('created_at', startISO)
      .lte('created_at', endISO)
      .order('created_at', { ascending: true })

    // 3. Подписчики по дням
    const { data: subscribersData } = await supabase
      .from('menohub_newsletter_subscribers')
      .select('subscribed_at')
      .gte('subscribed_at', startISO)
      .lte('subscribed_at', endISO)
      .order('subscribed_at', { ascending: true })

    // 4. Заказы по дням
    const { data: ordersData } = await supabase
      .from('menohub_book_orders')
      .select('created_at, amount_kopecks, status')
      .gte('created_at', startISO)
      .lte('created_at', endISO)
      .order('created_at', { ascending: true })

    // Группируем данные по дням
    const groupByDay = (data: any[], dateField: string) => {
      const grouped: Record<string, number> = {}

      data?.forEach((item) => {
        const date = new Date(item[dateField]).toISOString().split('T')[0]
        grouped[date] = (grouped[date] || 0) + 1
      })

      return Object.entries(grouped).map(([date, count]) => ({
        date,
        count,
      }))
    }

    const usersTrend = groupByDay(usersData || [], 'created_at')
    const queriesTrend = groupByDay(queriesData || [], 'created_at')
    const subscribersTrend = groupByDay(subscribersData || [], 'subscribed_at')
    const ordersTrend = groupByDay(ordersData || [], 'created_at')

    // Выручка по дням (только оплаченные)
    const revenueByDay: Record<string, number> = {}
    ordersData?.forEach((order) => {
      if (order.status === 'paid') {
        const date = new Date(order.created_at).toISOString().split('T')[0]
        revenueByDay[date] = (revenueByDay[date] || 0) + (order.amount_kopecks || 0)
      }
    })

    const revenueTrend = Object.entries(revenueByDay).map(([date, amount]) => ({
      date,
      amount,
    }))

    // Статистика по статусам заказов
    const ordersByStatus: Record<string, number> = {}
    ordersData?.forEach((order) => {
      ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1
    })

    const ordersStatusDistribution = Object.entries(ordersByStatus).map(([status, count]) => ({
      name: status,
      value: count,
    }))

    return NextResponse.json({
      period: {
        start: startISO,
        end: endISO,
      },
      trends: {
        users: usersTrend,
        queries: queriesTrend,
        subscribers: subscribersTrend,
        orders: ordersTrend,
        revenue: revenueTrend,
      },
      distributions: {
        ordersByStatus: ordersStatusDistribution,
      },
    })
  } catch (error: any) {
    console.error('❌ [Admin Analytics Trends] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
