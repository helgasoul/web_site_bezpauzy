import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/middleware'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await requireAdmin(request)
    if (!admin || error) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      )
    }

    let supabase
    try {
      supabase = createServiceRoleClient()
    } catch (e) {
      console.warn('Admin charts: Supabase service role not configured')
      return NextResponse.json({
        userGrowth: [],
        orderStatuses: [],
        weeklyActivity: [],
      })
    }

    // 1. Рост пользователей за последние 30 дней
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    thirtyDaysAgo.setHours(0, 0, 0, 0)

    const { data: usersData, error: usersError } = await supabase
      .from('menohub_users')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true })

    // Группируем пользователей по дням
    const userGrowthMap = new Map<string, number>()
    if (usersData && !usersError) {
      usersData.forEach((user) => {
        const date = new Date(user.created_at)
        const dateStr = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}`
        userGrowthMap.set(dateStr, (userGrowthMap.get(dateStr) || 0) + 1)
      })
    }

    const userGrowth = Array.from(userGrowthMap.entries()).map(([date, users]) => ({
      date,
      users,
    }))

    // 2. Статусы заказов (за весь период)
    const { data: ordersData, error: ordersError } = await supabase
      .from('menohub_book_orders')
      .select('status')

    const orderStatusMap = new Map<string, number>()
    if (ordersData && !ordersError) {
      ordersData.forEach((order) => {
        const status = order.status || 'pending'
        orderStatusMap.set(status, (orderStatusMap.get(status) || 0) + 1)
      })
    }

    const statusColors: Record<string, string> = {
      pending: '#fb923c', // orange
      paid: '#22c55e',    // green
      shipped: '#06b6d4', // cyan
      cancelled: '#6b7280', // gray
      refunded: '#ef4444', // red
    }

    const statusNames: Record<string, string> = {
      pending: 'Ожидает оплаты',
      paid: 'Оплачен',
      shipped: 'Отправлен',
      cancelled: 'Отменен',
      refunded: 'Возврат',
    }

    const orderStatuses = Array.from(orderStatusMap.entries()).map(([status, count]) => ({
      name: statusNames[status] || status,
      value: count,
      color: statusColors[status] || '#6b7280',
    }))

    // 3. Активность за неделю (пользователи и заказы)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const { data: weekUsers, error: weekUsersError } = await supabase
      .from('menohub_users')
      .select('created_at')
      .gte('created_at', sevenDaysAgo.toISOString())

    const { data: weekOrders, error: weekOrdersError } = await supabase
      .from('menohub_book_orders')
      .select('created_at')
      .gte('created_at', sevenDaysAgo.toISOString())

    // Группируем по дням недели
    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
    const activityMap = new Map<number, { users: number; orders: number }>()

    // Инициализируем все дни недели
    for (let i = 0; i < 7; i++) {
      activityMap.set(i, { users: 0, orders: 0 })
    }

    if (weekUsers && !weekUsersError) {
      weekUsers.forEach((user) => {
        const dayNum = new Date(user.created_at).getDay()
        const current = activityMap.get(dayNum)!
        activityMap.set(dayNum, { ...current, users: current.users + 1 })
      })
    }

    if (weekOrders && !weekOrdersError) {
      weekOrders.forEach((order) => {
        const dayNum = new Date(order.created_at).getDay()
        const current = activityMap.get(dayNum)!
        activityMap.set(dayNum, { ...current, orders: current.orders + 1 })
      })
    }

    const weeklyActivity = Array.from(activityMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([dayNum, data]) => ({
        day: dayNames[dayNum],
        users: data.users,
        orders: data.orders,
      }))

    return NextResponse.json({
      userGrowth,
      orderStatuses,
      weeklyActivity,
    })
  } catch (error) {
    console.error('❌ [Admin Charts] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
