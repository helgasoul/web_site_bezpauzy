import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Генерирует уникальный 6-значный код для аутентификации через Telegram
 * 
 * Flow:
 * 1. Пользователь на сайте нажимает "Войти через Telegram"
 * 2. Этот endpoint генерирует код и сохраняет в БД
 * 3. Пользователь должен получить этот код в Telegram боте
 * 4. Пользователь вводит код на сайте для завершения входа
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Генерируем 6-значный код
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Код действителен 5 минут
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 5)

    // Сохраняем код в БД
    // Пока не знаем telegram_id, сохраняем только код
    // telegram_id будет добавлен ботом, когда пользователь запросит код
    const { data, error } = await supabase
      .from('menohub_telegram_auth_codes')
      .insert({
        code,
        telegram_id: 0, // Временное значение, будет обновлено ботом
        expires_at: expiresAt.toISOString(),
        used: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating auth code:', error)
      return NextResponse.json(
        { error: 'Не удалось создать код аутентификации' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      code,
      expiresAt: expiresAt.toISOString(),
      message: 'Код создан. Запросите его в Telegram боте, затем введите на сайте.',
    })
  } catch (error) {
    console.error('Error in generate-code API:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

