import { NextResponse } from 'next/server'
import { deleteSessionCookie } from '@/lib/auth/session'

/**
 * Выход из системы (удаляет сессию)
 */
export async function POST() {
  try {
    const response = NextResponse.json({ success: true })
    deleteSessionCookie(response)
    return response
  } catch (error) {
    // Логируем только в development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in logout API:', error)
    }
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}





