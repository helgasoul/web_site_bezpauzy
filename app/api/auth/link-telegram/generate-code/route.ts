import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

/**
 * Генерирует код для привязки Telegram ID к существующему аккаунту на сайте
 * 
 * Flow:
 * 1. Пользователь зарегистрирован на сайте (есть логин/пароль)
 * 2. Нажимает "Спросить Еву" или хочет привязать Telegram
 * 3. Генерируется код
 * 4. Пользователь копирует код и переходит в бота по deep link
 * 5. Бот обрабатывает код и привязывает telegram_id к аккаунту
 */
export async function POST(request: NextRequest) {
  try {
    // Проверяем сессию пользователя
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('telegram_session')

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Необходимо войти в аккаунт' },
        { status: 401 }
      )
    }

    let sessionData
    try {
      sessionData = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString())
    } catch {
      return NextResponse.json(
        { error: 'Неверная сессия' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // Проверяем, что пользователь существует
    const { data: user, error: userError } = await supabase
      .from('menohub_users')
      .select('id, username, telegram_id')
      .eq('id', sessionData.userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    // Если уже привязан Telegram ID
    if (user.telegram_id && user.telegram_id !== 0) {
      return NextResponse.json({
        success: true,
        alreadyLinked: true,
        message: 'Telegram ID уже привязан к вашему аккаунту',
      })
    }

    // Генерируем уникальный код (6 символов: буквы и цифры)
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()

    // Код действителен 10 минут
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 10)

    // Сохраняем код в таблицу menohub_telegram_auth_codes
    // Связываем с user_id, чтобы бот мог обновить запись
    const { data: authCode, error: codeError } = await supabase
      .from('menohub_telegram_auth_codes')
      .insert({
        code,
        telegram_id: 0, // Будет обновлено ботом
        user_id: user.id, // Связь с пользователем
        expires_at: expiresAt.toISOString(),
        used: false,
      })
      .select()
      .single()

    if (codeError) {
      console.error('Error creating link code:', codeError)
      return NextResponse.json(
        { error: 'Не удалось создать код привязки' },
        { status: 500 }
      )
    }

    // Формируем deep link для бота
    const deepLink = `https://t.me/bezpauzy_bot?start=link_${code}`

    return NextResponse.json({
      success: true,
      code,
      deepLink,
      expiresAt: expiresAt.toISOString(),
      message: 'Код создан. Скопируйте его и откройте бота.',
    })
  } catch (error) {
    console.error('Error in link-telegram/generate-code API:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

