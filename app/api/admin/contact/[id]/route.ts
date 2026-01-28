import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/middleware'
import { createServiceRoleClient } from '@/lib/supabase/server'

// GET /api/admin/contact/[id] - Get support request details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { admin, error: authError } = await requireAdmin(request)
    if (!admin || authError) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 })
    }

    if (admin.role !== 'super_admin' && admin.role !== 'support_manager') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = createServiceRoleClient()

    const { data: submission, error: queryError } = await supabase
      .from('menohub_support_requests')
      .select('*')
      .eq('id', params.id)
      .single()

    if (queryError) {
      console.error('❌ [Admin Contact] Query error:', queryError)
      return NextResponse.json(
        { error: 'Support request not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ submission })
  } catch (error) {
    console.error('❌ [Admin Contact] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/contact/[id] - Update support request status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { admin, error: authError } = await requireAdmin(request)
    if (!admin || authError) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 })
    }

    if (admin.role !== 'super_admin' && admin.role !== 'support_manager') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { status } = body

    if (!status || !['new', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Получаем текущее обращение
    const { data: currentSubmission, error: fetchError } = await supabase
      .from('menohub_support_requests')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !currentSubmission) {
      return NextResponse.json(
        { error: 'Support request not found' },
        { status: 404 }
      )
    }

    // Подготавливаем обновление
    const updates: any = { status }

    // Автоматически устанавливаем resolved_at при смене на resolved
    if (status === 'resolved' && currentSubmission.status !== 'resolved' && !currentSubmission.resolved_at) {
      updates.resolved_at = new Date().toISOString()
    }

    // Обновляем обращение
    const { data: updatedSubmission, error: updateError } = await supabase
      .from('menohub_support_requests')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ [Admin Contact] Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update support request' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      submission: updatedSubmission,
    })
  } catch (error) {
    console.error('❌ [Admin Contact] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/contact/[id] - Delete support request
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { admin, error: authError } = await requireAdmin(request)
    if (!admin || authError) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 })
    }

    if (admin.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = createServiceRoleClient()

    const { error: deleteError } = await supabase
      .from('menohub_support_requests')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('❌ [Admin Contact] Delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete support request' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ [Admin Contact] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
