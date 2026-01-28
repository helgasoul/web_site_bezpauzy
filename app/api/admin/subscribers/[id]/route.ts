import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/middleware'
import { createServiceRoleClient } from '@/lib/supabase/server'

// GET /api/admin/subscribers/[id] - Get subscriber details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { admin, error: authError } = await requireAdmin(request)
    if (!admin || authError) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 })
    }

    if (admin.role !== 'super_admin' && admin.role !== 'support_manager' && admin.role !== 'content_manager') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = createServiceRoleClient()

    const { data: subscriber, error: queryError } = await supabase
      .from('menohub_newsletter_subscribers')
      .select('*')
      .eq('id', params.id)
      .single()

    if (queryError) {
      console.error('❌ [Admin Subscribers] Query error:', queryError)
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ subscriber })
  } catch (error) {
    console.error('❌ [Admin Subscribers] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/subscribers/[id] - Update subscriber
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { admin, error: authError } = await requireAdmin(request)
    if (!admin || authError) {
      return NextResponse.json({ error: authError || 'Unauthorized' }, { status: 401 })
    }

    if (admin.role !== 'super_admin' && admin.role !== 'support_manager' && admin.role !== 'content_manager') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { status } = body

    if (!status || !['pending', 'active', 'unsubscribed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Получаем текущего подписчика
    const { data: currentSubscriber, error: fetchError } = await supabase
      .from('menohub_newsletter_subscribers')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !currentSubscriber) {
      return NextResponse.json(
        { error: 'Subscriber not found' },
        { status: 404 }
      )
    }

    // Подготавливаем обновление
    const updates: any = { status }

    // Автоматически устанавливаем временные метки
    if (status === 'active' && currentSubscriber.status !== 'active' && !currentSubscriber.confirmed_at) {
      updates.confirmed_at = new Date().toISOString()
    }

    if (status === 'unsubscribed' && currentSubscriber.status !== 'unsubscribed') {
      updates.unsubscribed_at = new Date().toISOString()
    }

    // Обновляем подписчика
    const { data: updatedSubscriber, error: updateError } = await supabase
      .from('menohub_newsletter_subscribers')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ [Admin Subscribers] Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update subscriber' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      subscriber: updatedSubscriber,
    })
  } catch (error) {
    console.error('❌ [Admin Subscribers] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/subscribers/[id] - Delete subscriber
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
      .from('menohub_newsletter_subscribers')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('❌ [Admin Subscribers] Delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete subscriber' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ [Admin Subscribers] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
