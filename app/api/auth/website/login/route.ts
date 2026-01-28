import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'
import { setSessionCookie } from '@/lib/auth/session'
import { trackFailedLogin, resetFailedLoginAttempts } from '@/lib/security/monitoring'
import { logger } from '@/lib/logger'

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
      logger.error('Error parsing request body:', parseError)
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

    // Используем service role client для обхода RLS при поиске пользователя
    const supabase = createServiceRoleClient()
    const loginOrEmail = username.toLowerCase().trim()

    // Если введён адрес с @ — ищем по email, иначе по username (чтобы находить и по email, и по логину)
    const isEmail = loginOrEmail.includes('@')
    
    let user = null
    let userError = null
    
    if (isEmail) {
      // Поиск по email (с учетом возможных различий в регистре)
      const { data, error } = await supabase
        .from('menohub_users')
        .select('*')
        .ilike('email', loginOrEmail) // ilike для case-insensitive поиска
        .maybeSingle()
      user = data
      userError = error
    } else {
      // Поиск по username
      const { data, error } = await supabase
        .from('menohub_users')
        .select('*')
        .ilike('username', loginOrEmail) // ilike для case-insensitive поиска
        .maybeSingle()
      user = data
      userError = error
    }

    // Логируем для отладки (только в development)
    if (process.env.NODE_ENV === 'development') {
      logger.info('Login attempt:', { loginOrEmail, isEmail, found: !!user, error: userError?.message })
    }

    if (userError) {
      logger.error('Error searching for user:', userError)
      const clientIP = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
      const shouldBlock = trackFailedLogin(clientIP, username)
      if (shouldBlock) {
        return NextResponse.json(
          { error: 'Слишком много неудачных попыток входа. Попробуйте позже.' },
          { status: 429 }
        )
      }
      return NextResponse.json(
        { error: 'Неверный логин или пароль' },
        { status: 401 }
      )
    }

    if (!user) {
      const clientIP = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
      const shouldBlock = trackFailedLogin(clientIP, username)
      if (shouldBlock) {
        return NextResponse.json(
          { error: 'Слишком много неудачных попыток входа. Попробуйте позже.' },
          { status: 429 }
        )
      }
      return NextResponse.json(
        { error: 'Пользователь с таким логином или email не найден. Хотите зарегистрироваться?' },
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
      // Отслеживаем неудачную попытку входа
      const clientIP = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
      const shouldBlock = trackFailedLogin(clientIP, username)
      
      if (shouldBlock) {
        return NextResponse.json(
          { error: 'Слишком много неудачных попыток входа. Попробуйте позже.' },
          { status: 429 }
        )
      }
      
      return NextResponse.json(
        { error: 'Неверный логин или пароль' },
        { status: 401 }
      )
    }
    
    // Успешный вход - сбрасываем счетчик неудачных попыток
    const clientIP = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
    resetFailedLoginAttempts(clientIP)

    // Создаем безопасную JWT сессию
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        telegramId: user.telegram_id,
        hasTelegramId: !!user.telegram_id,
      },
    })

    setSessionCookie({
      userId: user.id,
      username: user.username,
      telegramId: user.telegram_id || null,
    }, response)
    
    // Дополнительно устанавливаем заголовки для предотвращения кеширования
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    return response
  } catch (error) {
    logger.error('Error in website/login API:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'

