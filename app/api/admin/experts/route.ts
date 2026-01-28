import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/middleware'
import { createServiceRoleClient } from '@/lib/supabase/server'

// GET /api/admin/experts - Получение списка экспертов
export async function GET(request: NextRequest) {
  try {
    const { admin, error: authError } = await requireAdmin(request)
    if (!admin || authError) {
      return NextResponse.json(
        { error: authError || 'Unauthorized' },
        { status: 401 }
      )
    }

    // Проверка прав доступа (super_admin и content_manager)
    if (admin.role !== 'super_admin' && admin.role !== 'content_manager') {
      return NextResponse.json(
        { error: 'Недостаточно прав доступа' },
        { status: 403 }
      )
    }

    let supabase
    try {
      supabase = createServiceRoleClient()
    } catch (e) {
      console.warn('Admin experts: Supabase service role not configured')
      return NextResponse.json({ experts: [] })
    }

    // Получаем всех экспертов (их всего 3, пагинация не нужна)
    const { data: experts, error } = await supabase
      .from('menohub_experts')
      .select('*')
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching experts:', error)
      return NextResponse.json(
        { error: 'Ошибка загрузки экспертов' },
        { status: 500 }
      )
    }

    return NextResponse.json({ experts: experts || [] })
  } catch (error) {
    console.error('❌ [Admin Experts] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
