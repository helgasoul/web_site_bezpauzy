import { NextRequest, NextResponse } from 'next/server'
import { getSession, deleteSessionCookie } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'

/**
 * Проверяет текущую сессию пользователя
 */
export async function GET(request: NextRequest) {
  try {
    // Получаем сессию через безопасную JWT проверку
    const sessionData = await getSession()

    if (!sessionData) {
      return NextResponse.json({ authenticated: false, error: 'No valid session' })
    }

    // Проверяем, что пользователь все еще существует
    const supabase = await createClient()
    const userId = sessionData.userId
      
      const { data: user, error } = await supabase
        .from('menohub_users')
        .select('id, telegram_id, username, age_range, city, is_subscribed, subscription_plan, payment_status')
        .eq('id', userId)
        .single()

      if (error) {
        // Ошибка при запросе к базе - НЕ удаляем cookie, возможно временная проблема
        // Логируем только в development
        if (process.env.NODE_ENV === 'development') {
          console.error('[get-session] Database error:', error.message, error.code)
        }
        return NextResponse.json({ 
          authenticated: false,
          error: 'Database error'
        })
      }

      if (!user) {
        const response = NextResponse.json({ authenticated: false, error: 'User not found' })
        deleteSessionCookie(response)
        return response
      }
      
      return NextResponse.json({
        authenticated: true,
        user: {
          id: user.id,
          telegramId: user.telegram_id,
          username: user.username,
          ageRange: user.age_range,
          city: user.city,
          isSubscribed: user.is_subscribed,
          subscriptionPlan: user.subscription_plan,
          paymentStatus: user.payment_status,
        },
      })
  } catch (error: any) {
    // Логируем только в development
    if (process.env.NODE_ENV === 'development') {
      console.error('[get-session] Unexpected error:', error.message)
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}





