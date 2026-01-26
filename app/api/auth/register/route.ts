import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { setSessionCookie, getSession } from '@/lib/auth/session'
import bcrypt from 'bcryptjs'
import { sendWelcomeEmail } from '@/lib/email/send-welcome-email'
import { logger } from '@/lib/logger'

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
    const body = await request.json()
    const username = typeof body.username === 'string' ? body.username.trim() : ''
    const password = body.password

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

    // Проверка формата логина (только латинские буквы, цифры, подчеркивание)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: 'Логин может содержать только латинские буквы (a–z), цифры и подчёркивание. Без пробелов и русских букв.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Проверяем, не занят ли логин
    const { data: existingUserByUsername } = await supabase
      .from('menohub_users')
      .select('id, telegram_id, username')
      .eq('username', username.toLowerCase().trim())
      .single()

    if (existingUserByUsername) {
      // Если пользователь существует и у него есть telegram_id, предлагаем войти
      if (existingUserByUsername.telegram_id && existingUserByUsername.telegram_id !== 0) {
        return NextResponse.json(
          { error: 'Пользователь с таким логином уже существует. Войдите в аккаунт или используйте другой логин.' },
          { status: 409 }
        )
      }
      // Если пользователь существует без telegram_id, тоже не позволяем регистрироваться
      return NextResponse.json(
        { error: 'Этот логин уже занят. Выберите другой.' },
        { status: 409 }
      )
    }

    // Проверяем, есть ли активная сессия с telegram_id (чтобы не создавать дубликат)
    try {
      const existingSession = await getSession()
      
      if (existingSession && existingSession.telegramId && existingSession.telegramId !== 0) {
        // Пользователь уже зарегистрирован через Telegram - обновляем запись вместо создания новой
        const { data: existingUserByTelegram } = await supabase
          .from('menohub_users')
          .select('id, username, telegram_id')
          .eq('telegram_id', existingSession.telegramId)
          .single()
        
        if (existingUserByTelegram) {
          // Обновляем существующего пользователя: добавляем username и password_hash
          const passwordHash = await bcrypt.hash(password, 10)
          
          const { data: updatedUser, error: updateError } = await supabase
            .from('menohub_users')
            .update({
              username: username.toLowerCase().trim(),
              password_hash: passwordHash,
            })
            .eq('id', existingUserByTelegram.id)
            .select('id, username, telegram_id')
            .single()
          
          if (updateError) {
            logger.error('Error updating user:', updateError)
            return NextResponse.json(
              { error: 'Не удалось обновить аккаунт. Попробуйте позже.' },
              { status: 500 }
            )
          }
          
          // Создаем новую безопасную JWT сессию
          const response = NextResponse.json({
            success: true,
            user: {
              id: updatedUser.id,
              username: updatedUser.username,
              hasTelegramId: !!updatedUser.telegram_id,
            },
            message: 'Аккаунт успешно обновлен!',
          })
          
          setSessionCookie({
            userId: updatedUser.id,
            username: updatedUser.username,
            telegramId: updatedUser.telegram_id || null,
          }, response)
          
          return response
        }
      }
    } catch (e) {
      // Если не удалось распарсить сессию, продолжаем обычную регистрацию
      logger.debug('Could not parse existing session, proceeding with new registration')
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
      logger.error('Error creating user:', createError)
      logger.error('Error details:', JSON.stringify(createError, null, 2))
      
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
        {
          error: errorMessage,
          ...(process.env.NODE_ENV === 'development' && { details: createError }),
        },
        { status: 500 }
      )
    }

    // Отправляем welcome email (если есть email в данных пользователя)
    // Примечание: В текущей схеме регистрация по username, но можно добавить email позже
    // Пока оставляем закомментированным, так как email может быть не указан при регистрации
    // Если в будущем добавится поле email в форму регистрации, раскомментируйте:
    // if (email) {
    //   sendWelcomeEmail({
    //     to: email,
    //     name: newUser.username,
    //   }).catch((error) => {
    //     console.error('Failed to send welcome email:', error)
    //   })
    // }

    // Создаем безопасную JWT сессию
    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        hasTelegramId: !!newUser.telegram_id,
      },
      message: 'Регистрация успешна!',
    })

    setSessionCookie({
      userId: newUser.id,
      username: newUser.username,
      telegramId: newUser.telegram_id || null,
    }, response)

    return response
  } catch (error) {
    logger.error('Error in register API:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

