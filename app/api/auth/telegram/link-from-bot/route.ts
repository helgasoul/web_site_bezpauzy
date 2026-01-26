import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { setSessionCookie } from '@/lib/auth/session'

// Явно указываем, что этот route динамический (использует request.url)
export const dynamic = 'force-dynamic'

/**
 * Обработка deep link из бота для автоматического входа
 * 
 * Flow:
 * 1. Пользователь переходит по ссылке из бота: ?tg_id=123&token=abc
 * 2. Проверяем токен (если есть) или просто telegram_id
 * 3. Находим пользователя по telegram_id
 * 4. Если у пользователя есть логин/пароль - автоматически входим
 * 5. Если нет - пользователь может свободно читать, но для сохранения нужна регистрация
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const telegramId = searchParams.get('tg_id')
    const token = searchParams.get('token')

    if (!telegramId) {
      return NextResponse.json(
        { error: 'Не указан Telegram ID' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Ищем пользователя по telegram_id
    const { data: user, error: userError } = await supabase
      .from('menohub_users')
      .select('*')
      .eq('telegram_id', parseInt(telegramId))
      .single()

    if (userError || !user) {
      // Пользователь не найден - это нормально, он может быть новым
      return NextResponse.json({
        success: true,
        found: false,
        message: 'Пользователь не найден. Вы можете зарегистрироваться на сайте.',
      })
    }

    // Проверяем, есть ли у пользователя логин/пароль
    const hasWebsiteAuth = !!(user.username && user.password_hash)

    if (hasWebsiteAuth) {
      // Автоматически входим с безопасной JWT сессией
      const response = NextResponse.json({
        success: true,
        found: true,
        authenticated: true,
        user: {
          id: user.id,
          username: user.username,
          telegramId: user.telegram_id,
          email: user.email,
          subscriptionStatus: user.subscription_status,
          subscriptionPlan: user.subscription_plan,
        },
        message: 'Автоматический вход выполнен',
      })

      setSessionCookie({
        userId: user.id,
        username: user.username,
        telegramId: user.telegram_id,
      }, response)

      return response
    } else {
      // У пользователя нет логина/пароля
      // Он может читать сайт, но для сохранения данных нужна регистрация
      return NextResponse.json({
        success: true,
        found: true,
        authenticated: false,
        needsRegistration: true,
        message: 'Для сохранения данных создайте аккаунт на сайте',
      })
    }
  } catch (error) {
    console.error('Error in link-from-bot API:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

