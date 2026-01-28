import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

/**
 * ВРЕМЕННЫЙ endpoint для диагностики проблем с пользователем
 * TODO: Удалить после решения проблемы!
 */
export async function GET(request: NextRequest) {
  // Только в development или с secret token
  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')
  const secret = searchParams.get('secret')

  // Проверка секрета (для безопасности в production)
  const DEBUG_SECRET = process.env.DEBUG_SECRET || 'dev-secret-123'
  if (secret !== DEBUG_SECRET && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!username) {
    return NextResponse.json({ error: 'Username required' }, { status: 400 })
  }

  try {
    const supabase = createServiceRoleClient()

    // Подсчет всех пользователей
    const { count } = await supabase
      .from('menohub_users')
      .select('*', { count: 'exact', head: true })

    // Поиск конкретного пользователя
    const { data: user, error } = await supabase
      .from('menohub_users')
      .select('id, username, email, telegram_id, password_hash, created_at')
      .ilike('username', username.toLowerCase().trim())
      .maybeSingle()

    return NextResponse.json({
      totalUsers: count,
      searchedUsername: username.toLowerCase().trim(),
      found: !!user,
      user: user ? {
        id: user.id,
        username: user.username,
        email: user.email,
        telegram_id: user.telegram_id,
        hasPassword: !!user.password_hash,
        passwordHashLength: user.password_hash?.length || 0,
        createdAt: user.created_at,
      } : null,
      error: error?.message || null,
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Internal error',
      details: error.message,
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
