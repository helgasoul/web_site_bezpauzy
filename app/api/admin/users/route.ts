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

    // Проверяем доступ к разделу пользователей
    if (admin.role !== 'super_admin' && admin.role !== 'support_manager') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    let supabase
    try {
      supabase = createServiceRoleClient()
    } catch (e) {
      return NextResponse.json(
        { error: 'Database configuration error' },
        { status: 500 }
      )
    }

    // Получаем query параметры
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const subscriptionFilter = searchParams.get('subscription') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const offset = (page - 1) * limit

    // Строим запрос
    let query = supabase
      .from('menohub_users')
      .select('id, telegram_id, username, is_subscribed, subscription_plan, payment_status, created_at, last_activity_at, query_count_total, age_range, city', { count: 'exact' })

    // Поиск
    if (search) {
      query = query.or(`username.ilike.%${search}%,telegram_id.eq.${search}`)
    }

    // Фильтр по подписке
    if (subscriptionFilter) {
      query = query.eq('subscription_plan', subscriptionFilter)
    }

    // Сортировка
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    const { data: users, error: queryError, count } = await query

    if (queryError) {
      console.error('❌ [Admin Users] Query error:', queryError)
      return NextResponse.json(
        { error: 'Database query failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      users: users || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('❌ [Admin Users] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
