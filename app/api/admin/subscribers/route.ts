import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/auth'
import { createServiceRoleClient } from '@/lib/supabase/service-role-client'

// GET /api/admin/subscribers - List subscribers with pagination and filters
export async function GET(request: NextRequest) {
  try {
    // Требуем авторизацию: super_admin, support_manager
    await requireAdmin(request, ['super_admin', 'support_manager'])

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const source = searchParams.get('source') || ''
    const sortBy = searchParams.get('sortBy') || 'subscribed_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const offset = (page - 1) * limit

    const supabase = createServiceRoleClient()

    // Строим запрос
    let query = supabase
      .from('menohub_newsletter_subscribers')
      .select('id, email, name, subscribed_at, source, status, confirmed_at, unsubscribed_at, welcome_email_sent, created_at', { count: 'exact' })

    // Поиск по email и name
    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`)
    }

    // Фильтр по статусу
    if (status) {
      query = query.eq('status', status)
    }

    // Фильтр по источнику
    if (source) {
      query = query.eq('source', source)
    }

    // Сортировка
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Пагинация
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('❌ [Admin Subscribers] Query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch subscribers' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      subscribers: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error: any) {
    console.error('❌ [Admin Subscribers] Error:', error)

    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
