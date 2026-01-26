import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { setSessionCookie } from '@/lib/auth/session'

/**
 * Вход по email
 * Находит пользователя по email и проверяет, что у него есть telegram_id
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Неверный формат email' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Ищем пользователя по email
    const { data: user, error: userError } = await supabase
      .from('menohub_users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Пользователь с таким email не найден. Убедитесь, что вы зарегистрированы в боте.' },
        { status: 404 }
      )
    }

    // Проверяем, что у пользователя есть telegram_id (зарегистрирован в боте)
    if (!user.telegram_id || user.telegram_id === 0) {
      return NextResponse.json(
        { error: 'Пользователь не зарегистрирован в Telegram боте. Пожалуйста, сначала зарегистрируйтесь в боте.' },
        { status: 400 }
      )
    }

    // Создаем безопасную JWT сессию
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        telegramId: user.telegram_id,
        email: user.email,
        ageRange: user.age_range,
        city: user.city,
        subscriptionStatus: user.subscription_status,
        subscriptionPlan: user.subscription_plan,
      },
    })

    setSessionCookie({
      userId: user.id,
      telegramId: user.telegram_id,
      email: user.email || null,
      ageRange: user.age_range || null,
    }, response)

    return response
  } catch (error) {
    console.error('Error in email login API:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}


