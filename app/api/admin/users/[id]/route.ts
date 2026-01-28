import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/middleware'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const userId = parseInt(params.id)
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      )
    }

    const { data: user, error: queryError } = await supabase
      .from('menohub_users')
      .select('id, telegram_id, username, is_subscribed, subscription_plan, payment_status, created_at, last_activity_at, query_count_total, query_count_daily, age_range, city')
      .eq('id', userId)
      .single()

    if (queryError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('❌ [Admin User Detail] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
