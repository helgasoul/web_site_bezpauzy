import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/middleware'
import { createServiceRoleClient } from '@/lib/supabase/server'

// GET /api/admin/analytics/overview - Get overview analytics
export async function GET(request: NextRequest) {
  try {
    // Доступ для всех ролей
    const { admin, error } = await requireAdmin(request)
    if (!admin || error) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate') // YYYY-MM-DD
    const endDate = searchParams.get('endDate') // YYYY-MM-DD

    const supabase = createServiceRoleClient()

    // Если даты не указаны, берём последние 30 дней
    const end = endDate ? new Date(endDate) : new Date()
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    // Форматируем даты для SQL
    const startISO = start.toISOString()
    const endISO = end.toISOString()

    // 1. Новые пользователи за период
    const { count: newUsers } = await supabase
      .from('menohub_users')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startISO)
      .lte('created_at', endISO)

    // 2. Запросы в AI-чат за период
    const { count: chatQueries } = await supabase
      .from('menohub_queries')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startISO)
      .lte('created_at', endISO)

    // 3. Новые подписчики за период
    const { count: newSubscribers } = await supabase
      .from('menohub_newsletter_subscribers')
      .select('id', { count: 'exact', head: true })
      .gte('subscribed_at', startISO)
      .lte('subscribed_at', endISO)

    // 4. Заказы книг за период
    const { count: bookOrders } = await supabase
      .from('menohub_book_orders')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startISO)
      .lte('created_at', endISO)

    // 5. Выручка за период (только оплаченные заказы)
    const { data: paidOrders } = await supabase
      .from('menohub_book_orders')
      .select('amount_kopecks')
      .eq('status', 'paid')
      .gte('paid_at', startISO)
      .lte('paid_at', endISO)

    const revenue = paidOrders?.reduce((sum, order) => sum + (order.amount_kopecks || 0), 0) || 0

    // 6. Обращения в поддержку за период
    const { count: supportRequests } = await supabase
      .from('menohub_support_requests')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startISO)
      .lte('created_at', endISO)

    // 7. Пройдено тестов за период
    const { count: testsCompleted } = await supabase
      .from('menohub_quiz_results')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startISO)
      .lte('created_at', endISO)

    // 8. Всего в системе (для сравнения)
    const { count: totalUsers } = await supabase
      .from('menohub_users')
      .select('id', { count: 'exact', head: true })

    const { count: totalSubscribers } = await supabase
      .from('menohub_newsletter_subscribers')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')

    const { count: totalOrders } = await supabase
      .from('menohub_book_orders')
      .select('id', { count: 'exact', head: true })

    // 9. Активные пользователи (последние 7 дней)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { count: activeUsers } = await supabase
      .from('menohub_queries')
      .select('user_id', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo)

    return NextResponse.json({
      period: {
        start: startISO,
        end: endISO,
      },
      metrics: {
        newUsers: newUsers || 0,
        chatQueries: chatQueries || 0,
        newSubscribers: newSubscribers || 0,
        bookOrders: bookOrders || 0,
        revenue: revenue,
        supportRequests: supportRequests || 0,
        testsCompleted: testsCompleted || 0,
      },
      totals: {
        totalUsers: totalUsers || 0,
        totalSubscribers: totalSubscribers || 0,
        totalOrders: totalOrders || 0,
        activeUsers: activeUsers || 0,
      },
    })
  } catch (error: any) {
    console.error('❌ [Admin Analytics] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
