import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'

/**
 * Регистрация нового пользователя на сайте
 * 
 * Flow:
 * 1. Пользователь вводит логин и пароль
 * 2. Создается запись в menohub_users (без telegram_id, если пользователь еще не в боте)
 * 3. Если пользователь хочет общаться с Евой, нужно привязать Telegram ID позже
 */
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Валидация
    if (!username || username.length < 3) {
      return NextResponse.json(
        { error: 'Логин должен содержать минимум 3 символа' },
        { status: 400 }
      )
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен содержать минимум 6 символов' },
        { status: 400 }
      )
    }

    // Проверка формата логина (только буквы, цифры, подчеркивание)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: 'Логин может содержать только буквы, цифры и подчеркивание' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Проверяем, не занят ли логин
    const { data: existingUser } = await supabase
      .from('menohub_users')
      .select('id')
      .eq('username', username.toLowerCase().trim())
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Этот логин уже занят. Выберите другой.' },
        { status: 409 }
      )
    }

    // Хешируем пароль
    const passwordHash = await bcrypt.hash(password, 10)

    // Создаем нового пользователя
    const { data: newUser, error: createError } = await supabase
      .from('menohub_users')
      .insert({
        username: username.toLowerCase().trim(),
        password_hash: passwordHash,
        // telegram_id будет NULL или 0, если пользователь еще не в боте
        telegram_id: 0,
        // Добавляем обязательные поля с дефолтными значениями
        query_count_daily: 0,
        query_count_total: 0,
      })
      .select('id, username, telegram_id')
      .single()

    if (createError) {
      console.error('Error creating user:', createError)
      console.error('Error details:', JSON.stringify(createError, null, 2))
      
      // Более детальное сообщение об ошибке
      let errorMessage = 'Не удалось создать аккаунт. Попробуйте позже.'
      
      if (createError.code === '23505') {
        // Unique constraint violation
        errorMessage = 'Этот логин уже занят. Выберите другой.'
      } else if (createError.code === '23502') {
        // Not null constraint violation
        errorMessage = 'Не все обязательные поля заполнены. Обратитесь в поддержку.'
      } else if (createError.message) {
        errorMessage = `Ошибка: ${createError.message}`
      }
      
      return NextResponse.json(
        { error: errorMessage, details: createError },
        { status: 500 }
      )
    }

    // Создаем сессию
    const sessionToken = Buffer.from(JSON.stringify({
      userId: newUser.id,
      username: newUser.username,
      telegramId: newUser.telegram_id || null,
    })).toString('base64')

    // Устанавливаем cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        hasTelegramId: !!newUser.telegram_id,
      },
      message: 'Регистрация успешна!',
    })

    response.cookies.set('telegram_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 дней
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Error in register API:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

