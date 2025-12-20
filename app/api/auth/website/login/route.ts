import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

/**
 * Вход на сайт по логину и паролю
 * 
 * Flow:
 * 1. Пользователь вводит логин и пароль
 * 2. Проверяем учетные данные
 * 3. Создаем сессию
 */
export async function POST(request: NextRequest) {
  try {
    // Безопасный парсинг JSON
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('Error parsing request body:', parseError)
      return NextResponse.json(
        { error: 'Неверный формат запроса' },
        { status: 400 }
      )
    }

    const { username, password } = body

    // Валидация входных данных
    if (typeof username !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Логин и пароль должны быть строками' },
        { status: 400 }
      )
    }

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Введите логин и пароль' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Ищем пользователя по логину
    const { data: user, error: userError } = await supabase
      .from('menohub_users')
      .select('*')
      .eq('username', username.toLowerCase().trim())
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Неверный логин или пароль' },
        { status: 401 }
      )
    }

    // Проверяем, что у пользователя есть пароль
    if (!user.password_hash) {
      return NextResponse.json(
        { error: 'Для этого аккаунта не установлен пароль. Используйте вход через Telegram.' },
        { status: 400 }
      )
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Неверный логин или пароль' },
        { status: 401 }
      )
    }

    // Создаем сессию
    const sessionToken = Buffer.from(JSON.stringify({
      userId: user.id,
      username: user.username,
      telegramId: user.telegram_id || null,
    })).toString('base64')

    // Создаем response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        telegramId: user.telegram_id,
        email: user.email,
        subscriptionStatus: user.subscription_status,
        subscriptionPlan: user.subscription_plan,
        hasTelegramId: !!user.telegram_id,
      },
    })

    // Устанавливаем cookie в response
    // Важно: устанавливаем cookie ДО возврата response
    const cookieOptions: any = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 30, // 30 дней
      path: '/',
    }
    
    // Не указываем domain для localhost (браузер сам установит правильный domain)
    if (process.env.NODE_ENV === 'production') {
      // В production можно указать domain, если нужно
      // cookieOptions.domain = '.yourdomain.com'
    }
    
    response.cookies.set('telegram_session', sessionToken, cookieOptions)

    console.log('login: cookie set', { 
      userId: user.id, 
      username: user.username,
      cookieLength: sessionToken.length,
      cookieValue: sessionToken.substring(0, 20) + '...' // Первые 20 символов для отладки
    })
    
    // Логируем заголовки response для отладки
    console.log('login: response headers', {
      hasSetCookie: response.headers.get('Set-Cookie') ? true : false
    })

    return response
  } catch (error) {
    console.error('Error in website/login API:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

