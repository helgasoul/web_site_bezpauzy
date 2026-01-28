import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/middleware'
import { createServiceRoleClient } from '@/lib/supabase/server'

// GET /api/admin/resources/[id] - Получение ресурса по ID
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

    const resourceId = params.id

    // Получаем ресурс
    const { data: resource, error } = await supabase
      .from('menohub_resources')
      .select('*')
      .eq('id', resourceId)
      .single()

    if (error) {
      console.error('Error fetching resource:', error)
      return NextResponse.json(
        { error: 'Ресурс не найден' },
        { status: 404 }
      )
    }

    return NextResponse.json({ resource })
  } catch (error) {
    console.error('❌ [Admin Resources] GET Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/resources/[id] - Обновление ресурса
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

    const resourceId = params.id
    const body = await request.json()

    // Получаем текущий ресурс
    const { data: currentResource, error: fetchError } = await supabase
      .from('menohub_resources')
      .select('*')
      .eq('id', resourceId)
      .single()

    if (fetchError || !currentResource) {
      return NextResponse.json(
        { error: 'Ресурс не найден' },
        { status: 404 }
      )
    }

    // Проверка уникальности slug если он изменился
    if (body.slug && body.slug !== currentResource.slug) {
      const { data: existingResource } = await supabase
        .from('menohub_resources')
        .select('id')
        .eq('slug', body.slug)
        .single()

      if (existingResource) {
        return NextResponse.json(
          { error: 'Ресурс с таким slug уже существует' },
          { status: 400 }
        )
      }
    }

    // Подготовка обновлений
    const updates: any = {
      ...body,
      updated_at: new Date().toISOString(),
    }

    // Если публикуем ресурс впервые
    if (body.published && !currentResource.published && !currentResource.published_at) {
      updates.published_at = new Date().toISOString()
    }

    // Если снимаем публикацию
    if (body.published === false && currentResource.published) {
      updates.published_at = null
    }

    // Обновляем ресурс
    const { data: updatedResource, error: updateError } = await supabase
      .from('menohub_resources')
      .update(updates)
      .eq('id', resourceId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating resource:', updateError)
      return NextResponse.json(
        { error: 'Ошибка обновления ресурса' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      resource: updatedResource,
    })
  } catch (error) {
    console.error('❌ [Admin Resources] PATCH Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/resources/[id] - Удаление ресурса
export async function DELETE(
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

    // Проверка прав доступа (только super_admin может удалять)
    if (admin.role !== 'super_admin') {
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

    const resourceId = params.id

    // Удаляем ресурс
    const { error: deleteError } = await supabase
      .from('menohub_resources')
      .delete()
      .eq('id', resourceId)

    if (deleteError) {
      console.error('Error deleting resource:', deleteError)
      return NextResponse.json(
        { error: 'Ошибка удаления ресурса' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Ресурс успешно удален',
    })
  } catch (error) {
    console.error('❌ [Admin Resources] DELETE Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
