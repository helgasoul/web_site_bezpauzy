import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/middleware'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { admin, error: authError } = await requireAdmin(request)
    if (!admin || authError) {
      return NextResponse.json(
        { error: authError || 'Unauthorized' },
        { status: 401 }
      )
    }

    // Проверка прав доступа (super_admin и order_manager)
    if (admin.role !== 'super_admin' && admin.role !== 'order_manager') {
      return NextResponse.json(
        { error: 'Недостаточно прав доступа' },
        { status: 403 }
      )
    }

    let supabase
    try {
      supabase = createServiceRoleClient()
    } catch (e) {
      console.warn('Admin orders: Supabase service role not configured')
      return NextResponse.json({
        orders: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      })
    }

    // Получение query параметров
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const bookType = searchParams.get('bookType') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Вычисляем offset
    const offset = (page - 1) * limit

    // Базовый запрос
    let query = supabase
      .from('menohub_book_orders')
      .select(
        'id, order_number, email, name, phone, book_type, amount_kopecks, status, created_at, paid_at, shipped_at',
        { count: 'exact' }
      )

    // Поиск
    if (search) {
      query = query.or(
        `order_number.ilike.%${search}%,email.ilike.%${search}%,name.ilike.%${search}%,phone.ilike.%${search}%`
      )
    }

    // Фильтры
    if (status) {
      query = query.eq('status', status)
    }

    if (bookType) {
      query = query.eq('book_type', bookType)
    }

    // Сортировка
    const ascending = sortOrder === 'asc'
    query = query.order(sortBy, { ascending })

    // Пагинация
    query = query.range(offset, offset + limit - 1)

    const { data: orders, error, count } = await query

    if (error) {
      console.error('Error fetching orders:', error)
      return NextResponse.json(
        { error: 'Ошибка загрузки заказов' },
        { status: 500 }
      )
    }

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      orders: orders || [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  } catch (error) {
    console.error('❌ [Admin Orders] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
