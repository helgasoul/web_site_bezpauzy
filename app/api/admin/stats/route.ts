import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/middleware'
import { createServiceRoleClient } from '@/lib/supabase/server'

async function safeCount(
  supabase: Awaited<ReturnType<typeof createServiceRoleClient>>,
  table: string,
  column: string,
  since: string
): Promise<number> {
  try {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .gte(column, since)
    if (error) return 0
    return count ?? 0
  } catch {
    return 0
  }
}

export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await requireAdmin(request)
    if (!admin || error) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      )
    }

    let supabase
    try {
      supabase = createServiceRoleClient()
    } catch (e) {
      console.warn('Admin stats: Supabase service role not configured')
      return NextResponse.json({
        newUsersToday: 0,
        newUsersWeek: 0,
        newOrdersToday: 0,
        newOrdersWeek: 0,
        newSubscribersToday: 0,
        newSubscribersWeek: 0,
        newChatQueriesToday: 0,
        newChatQueriesWeek: 0,
      })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString()

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekStr = weekAgo.toISOString()

    const [
      newUsersToday,
      newOrdersToday,
      newSubscribersToday,
      newChatQueriesToday,
      newUsersWeek,
      newOrdersWeek,
      newSubscribersWeek,
      newChatQueriesWeek,
    ] = await Promise.all([
      safeCount(supabase, 'menohub_users', 'created_at', todayStr),
      safeCount(supabase, 'menohub_book_orders', 'created_at', todayStr),
      safeCount(supabase, 'newsletter_subscribers', 'subscribed_at', todayStr),
      safeCount(supabase, 'menohub_queries', 'created_at', todayStr),
      safeCount(supabase, 'menohub_users', 'created_at', weekStr),
      safeCount(supabase, 'menohub_book_orders', 'created_at', weekStr),
      safeCount(supabase, 'newsletter_subscribers', 'subscribed_at', weekStr),
      safeCount(supabase, 'menohub_queries', 'created_at', weekStr),
    ])

    return NextResponse.json({
      newUsersToday,
      newUsersWeek,
      newOrdersToday,
      newOrdersWeek,
      newSubscribersToday,
      newSubscribersWeek,
      newChatQueriesToday,
      newChatQueriesWeek,
    })
  } catch (error) {
    console.error('❌ [Admin Stats] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
