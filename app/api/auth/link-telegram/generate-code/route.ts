import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'

/**
 * Генерирует код для привязки Telegram ID к существующему аккаунту на сайте
 * 
 * Flow:
 * 1. Пользователь зарегистрирован на сайте (есть логин/пароль)
 * 2. Нажимает "Привязать Telegram"
 * 3. Дает согласие на обработку персональных данных
 * 4. Генерируется код и устанавливается consent_granted = TRUE
 * 5. Пользователь копирует код и переходит в бота по deep link
 * 6. Бот обрабатывает код и привязывает telegram_id к аккаунту
 */
export async function POST(request: NextRequest) {
  try {
    // Проверяем наличие согласия в теле запроса
    const body = await request.json().catch(() => ({}))
    const consentGiven = body.consentGiven === true

    if (!consentGiven) {
      return NextResponse.json(
        { error: 'Необходимо дать согласие на обработку персональных данных' },
        { status: 400 }
      )
    }

    // Проверяем сессию пользователя через безопасную JWT проверку
    const sessionData = await getSession()

    if (!sessionData) {
      return NextResponse.json(
        { error: 'Необходимо войти в аккаунт' },
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

    // ✅ УСТАНОВКА СОГЛАСИЯ: Пользователь дал явное согласие через форму
    // Устанавливаем consent_granted = TRUE, чтобы предотвратить создание дубликатов
    // Это означает, что пользователь согласен на обработку данных при использовании бота
    try {
      const { error: consentError } = await supabase
        .from('menohub_users')
        .update({ 
          consent_granted: true,
        })
        .eq('id', user.id)

      if (consentError) {
        console.error('[link-telegram/generate-code] Failed to update consent_granted:', consentError.message)
        return NextResponse.json(
          { error: 'Не удалось сохранить согласие. Попробуйте еще раз.' },
          { status: 500 }
        )
      }
    } catch (consentErr) {
      console.error('[link-telegram/generate-code] Error updating consent:', consentErr)
      return NextResponse.json(
        { error: 'Ошибка при сохранении согласия. Попробуйте еще раз.' },
        { status: 500 }
      )
    }

    // Генерируем уникальный код (6 символов: буквы и цифры)
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()

    // Код действителен 10 минут
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 10)

    // Сохраняем код в таблицу menohub_telegram_auth_codes
    // Связываем с website_user_id (BIGINT), чтобы бот мог обновить запись в menohub_users
    // Если колонка website_user_id еще не существует, используем только код (бот найдет по коду)
    let insertData: any = {
      code,
      telegram_id: 0, // Будет обновлено ботом
      expires_at: expiresAt.toISOString(),
      used: false,
    }

    // Пытаемся добавить website_user_id, если колонка существует
    // Если колонки нет, попробуем без неё (бот найдет по коду)
    insertData.website_user_id = user.id
    insertData.user_id = null // Legacy UUID field

    const { data: authCode, error: codeError } = await supabase
      .from('menohub_telegram_auth_codes')
      .insert(insertData)
      .select()
      .single()

    if (codeError) {
      // Логируем только в development (без чувствительных данных)
      if (process.env.NODE_ENV === 'development') {
        console.error('[link-telegram/generate-code] Error creating link code:', codeError.code)
        console.error('[link-telegram/generate-code] Error message:', codeError.message)
      }
      
      // Если колонка website_user_id не существует, пробуем без неё
      // PostgreSQL error codes: 42703 = undefined column, 42804 = datatype mismatch
      const isColumnError = codeError.code === '42703' || 
                           codeError.message?.toLowerCase().includes('website_user_id') ||
                           codeError.message?.toLowerCase().includes('column') ||
                           codeError.message?.toLowerCase().includes('does not exist')
      
      if (isColumnError) {
        // Логируем только в development
        if (process.env.NODE_ENV === 'development') {
          console.log('[link-telegram/generate-code] Retrying without website_user_id column')
        }
        const { data: retryAuthCode, error: retryError } = await supabase
          .from('menohub_telegram_auth_codes')
          .insert({
            code,
            telegram_id: 0,
            expires_at: expiresAt.toISOString(),
            used: false,
          })
          .select()
          .single()

        if (retryError) {
          console.error('[link-telegram/generate-code] Retry also failed:', retryError)
          return NextResponse.json(
            { error: `Не удалось создать код привязки: ${retryError.message || 'Неизвестная ошибка'}` },
            { status: 500 }
          )
        }

        // Успешно создали код без website_user_id
        const retryWebDeepLink = `https://t.me/bezpauzy_bot?start=link_${code}`
        const retryNativeDeepLink = `tg://resolve?domain=bezpauzy_bot&start=link_${code}`
        return NextResponse.json({
          success: true,
          code,
          deepLink: retryWebDeepLink,
          nativeDeepLink: retryNativeDeepLink,
          expiresAt: expiresAt.toISOString(),
          message: 'Код создан. Скопируйте его и откройте бота.',
        })
      }
      
      // Если таблица не существует или есть другая ошибка БД
      if (codeError.code === '42P01' || codeError.message?.includes('does not exist')) {
        return NextResponse.json(
          { error: 'Таблица для кодов привязки не найдена. Обратитесь в поддержку.' },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { error: `Не удалось создать код привязки: ${codeError.message || 'Неизвестная ошибка'}` },
        { status: 500 }
      )
    }

    // Формируем deep link для бота
    // Используем оба формата: веб (https://t.me) и нативный (tg://)
    // Telegram может не передать параметр в некоторых случаях, поэтому используем оба
    const webDeepLink = `https://t.me/bezpauzy_bot?start=link_${code}`
    const nativeDeepLink = `tg://resolve?domain=bezpauzy_bot&start=link_${code}`
    
    // Возвращаем веб-формат как основной (работает везде)
    // Нативный формат можно использовать как fallback
    const deepLink = webDeepLink

    // Логируем только в development (без кода и ссылок)
    if (process.env.NODE_ENV === 'development') {
      console.log('[generate-code] Code generated successfully')
    }

    return NextResponse.json({
      success: true,
      code,
      deepLink,
      nativeDeepLink, // Возвращаем оба формата
      expiresAt: expiresAt.toISOString(),
      message: 'Код создан. Скопируйте его и откройте бота.',
    })
  } catch (error) {
    // Логируем только в development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in link-telegram/generate-code API:', error)
    }
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

