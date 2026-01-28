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

    // Сначала всегда пробуем поиск по username (так как при регистрации сохраняется только username)
    let user = null
    let userError = null

    // Поиск по username - используем точное совпадение, так как username уже в нижнем регистре
    logger.info('Searching for user by username:', { loginOrEmail })
    const { data: usernameData, error: usernameError } = await supabase
      .from('menohub_users')
      .select('*')
      .eq('username', loginOrEmail)
      .maybeSingle()

    logger.info('Username search result:', { 
      found: !!usernameData, 
      error: usernameError?.message,
      userId: usernameData?.id,
      username: usernameData?.username,
      hasPassword: !!usernameData?.password_hash
    })

    if (usernameData) {
      user = usernameData
      userError = usernameError
      logger.info('User found by username:', { userId: user.id, username: user.username })
    } else if (usernameError) {
      userError = usernameError
      logger.error('Error searching by username:', usernameError)
    } else {
      // Пользователь не найден - попробуем найти всех пользователей с похожим username для диагностики
      const { data: allUsers, error: allUsersError } = await supabase
        .from('menohub_users')
        .select('id, username, email')
        .limit(10)
      logger.info('Sample users in database:', { 
        count: allUsers?.length, 
        users: allUsers?.map(u => ({ id: u.id, username: u.username, email: u.email }))
      })
    }

    // Если не нашли по username и введен email, пробуем поиск по email
    if (!user && !userError && loginOrEmail.includes('@')) {
      const { data: emailData, error: emailError } = await supabase
        .from('menohub_users')
        .select('*')
        .eq('email', loginOrEmail)
        .not('email', 'is', null)
        .maybeSingle()

      if (emailData) {
        user = emailData
        userError = emailError
        logger.info('User found by email:', { userId: user.id, email: user.email })
      } else if (emailError) {
        userError = emailError
        logger.error('Error searching by email:', emailError)
      }
    }

    // Если все еще не нашли, пробуем поиск без учета регистра через ilike
    if (!user && !userError) {
      const { data: ilikeData, error: ilikeError } = await supabase
        .from('menohub_users')
        .select('*')
        .ilike('username', loginOrEmail)
        .maybeSingle()

      if (ilikeData) {
        user = ilikeData
        userError = ilikeError
        logger.info('User found by username (case-insensitive):', { userId: user.id, username: user.username })
      }
    }

    // Детальное логирование для диагностики
    logger.info('Login attempt:', { 
      loginOrEmail, 
      isEmail: loginOrEmail.includes('@'),
      found: !!user,
      userId: user?.id,
      username: user?.username,
      hasPassword: !!user?.password_hash,
      error: userError?.message 
    })

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
    logger.info('Checking password for user:', { userId: user.id, username: user.username })
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)
    logger.info('Password check result:', { isValid: isPasswordValid })

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

