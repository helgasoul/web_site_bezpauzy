import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/middleware'
import { createServiceRoleClient } from '@/lib/supabase/server'

// GET /api/admin/contact - List support requests with pagination and filters
export async function GET(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const { admin, error: authError } = await requireAdmin(request)
    if (!admin || authError) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 })
    }

    // Проверяем роль: super_admin или support_manager
    if (admin.role !== 'super_admin' && admin.role !== 'support_manager') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const offset = (page - 1) * limit

    const supabase = createServiceRoleClient()

    // Строим запрос
    let query = supabase
      .from('menohub_support_requests')
      .select('id, name, email, phone, subject, message, status, user_id, page_url, telegram_message_id, created_at, resolved_at, updated_at', { count: 'exact' })

    // Поиск по email, name, subject, message, phone
    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%,subject.ilike.%${search}%,message.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    // Фильтр по статусу
    if (status) {
      query = query.eq('status', status)
    }

    // Сортировка
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Пагинация
    query = query.range(offset, offset + limit - 1)

    const { data, error: queryError, count } = await query

    if (queryError) {
      console.error('❌ [Admin Contact] Query error:', queryError)
      return NextResponse.json(
        { error: 'Failed to fetch support requests' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      submissions: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('❌ [Admin Contact] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
