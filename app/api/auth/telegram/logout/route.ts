import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Выход из системы (удаляет сессию)
 */
export async function POST() {
  try {
    cookies().delete('telegram_session')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in logout API:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}





