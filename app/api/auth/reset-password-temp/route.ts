import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

/**
 * ВРЕМЕННЫЙ endpoint для сброса пароля
 * TODO: Удалить после решения проблемы!
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, newPassword, secret } = body

    // Проверка секрета
    const DEBUG_SECRET = process.env.DEBUG_SECRET || 'dev-secret-123'
    if (secret !== DEBUG_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!username || !newPassword) {
      return NextResponse.json({
        error: 'Username and newPassword required'
      }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({
        error: 'Password must be at least 6 characters'
      }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    // Находим пользователя
    const { data: user, error: findError } = await supabase
      .from('menohub_users')
      .select('id, username')
      .ilike('username', username.toLowerCase().trim())
      .maybeSingle()

    if (findError || !user) {
      return NextResponse.json({
        error: 'User not found',
        details: findError?.message
      }, { status: 404 })
    }

    // Хешируем новый пароль
    const passwordHash = await bcrypt.hash(newPassword, 10)

    // Обновляем пароль
    const { error: updateError } = await supabase
      .from('menohub_users')
      .update({ password_hash: passwordHash })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json({
        error: 'Failed to update password',
        details: updateError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Password updated for user: ${user.username}`,
      userId: user.id,
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Internal error',
      details: error.message,
    }, { status: 500 })
  }
}

export const dynamic = 'force-dynamic'
