import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/middleware'
import { createServiceRoleClient } from '@/lib/supabase/server'

// GET /api/admin/experts/[id] - Получение эксперта по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { admin, error: authError } = await requireAdmin(request)
    if (!admin || authError) {
      return NextResponse.json(
        { error: authError || 'Unauthorized' },
        { status: 401 }
      )
    }

    // Проверка прав доступа
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
      return NextResponse.json(
        { error: 'Supabase service role not configured' },
        { status: 500 }
      )
    }

    const expertId = params.id

    // Получаем эксперта
    const { data: expert, error } = await supabase
      .from('menohub_experts')
      .select('*')
      .eq('id', expertId)
      .single()

    if (error) {
      console.error('Error fetching expert:', error)
      return NextResponse.json(
        { error: 'Эксперт не найден' },
        { status: 404 }
      )
    }

    return NextResponse.json({ expert })
  } catch (error) {
    console.error('❌ [Admin Experts] GET Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/experts/[id] - Обновление эксперта
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { admin, error: authError } = await requireAdmin(request)
    if (!admin || authError) {
      return NextResponse.json(
        { error: authError || 'Unauthorized' },
        { status: 401 }
      )
    }

    // Проверка прав доступа
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
      return NextResponse.json(
        { error: 'Supabase service role not configured' },
        { status: 500 }
      )
    }

    const expertId = params.id
    const body = await request.json()

    // Получаем текущего эксперта
    const { data: currentExpert, error: fetchError } = await supabase
      .from('menohub_experts')
      .select('*')
      .eq('id', expertId)
      .single()

    if (fetchError || !currentExpert) {
      return NextResponse.json(
        { error: 'Эксперт не найден' },
        { status: 404 }
      )
    }

    // Подготовка обновлений
    const updates: any = {
      ...body,
      updated_at: new Date().toISOString(),
    }

    // Обновляем эксперта
    const { data: updatedExpert, error: updateError } = await supabase
      .from('menohub_experts')
      .update(updates)
      .eq('id', expertId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating expert:', updateError)
      return NextResponse.json(
        { error: 'Ошибка обновления эксперта' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      expert: updatedExpert,
    })
  } catch (error) {
    console.error('❌ [Admin Experts] PATCH Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
