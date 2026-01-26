import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { setSessionCookie } from '@/lib/auth/session'

/**
 * Проверяет код аутентификации и создает сессию пользователя
 * 
 * Flow:
 * 1. Пользователь вводит код на сайте
 * 2. Этот endpoint проверяет код в БД
 * 3. Если код валиден и не использован, находим пользователя по telegram_id
 * 4. Создаем сессию (можно использовать cookies или JWT)
 */
export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code || typeof code !== 'string' || code.length !== 6) {
      return NextResponse.json(
        { error: 'Неверный формат кода' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Ищем код в БД
    const { data: authCode, error: codeError } = await supabase
      .from('menohub_telegram_auth_codes')
      .select('*')
      .eq('code', code)
      .eq('used', false)
      .single()

    if (codeError || !authCode) {
      return NextResponse.json(
        { error: 'Код не найден или уже использован' },
        { status: 404 }
      )
    }

    // Проверяем, не истек ли код
    const now = new Date()
    const expiresAt = new Date(authCode.expires_at)
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Код истек. Запросите новый код.' },
        { status: 400 }
      )
    }

    // Проверяем, что код связан с пользователем (telegram_id должен быть заполнен ботом)
    if (!authCode.telegram_id || authCode.telegram_id === 0) {
      return NextResponse.json(
        { error: 'Код еще не активирован. Запросите код в Telegram боте.' },
        { status: 400 }
      )
    }

    // Находим пользователя по telegram_id
    const { data: user, error: userError } = await supabase
      .from('menohub_users')
      .select('*')
      .eq('telegram_id', authCode.telegram_id)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Пользователь не найден. Убедитесь, что вы зарегистрированы в боте.' },
        { status: 404 }
      )
    }

    // Помечаем код как использованный
    await supabase
      .from('menohub_telegram_auth_codes')
      .update({ used: true })
      .eq('id', authCode.id)

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
    console.error('Error in verify-code API:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

