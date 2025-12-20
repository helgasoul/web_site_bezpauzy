import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

/**
 * Проверяет текущую сессию пользователя
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('telegram_session')?.value

    console.log('get-session: checking cookie', { 
      hasCookie: !!sessionToken,
      cookieLength: sessionToken?.length 
    })

    if (!sessionToken) {
      console.log('get-session: no cookie found')
      return NextResponse.json({ authenticated: false })
    }

    try {
      const sessionData = JSON.parse(
        Buffer.from(sessionToken, 'base64').toString()
      )

      // Проверяем, что пользователь все еще существует
      const supabase = await createClient()
      const { data: user, error } = await supabase
        .from('menohub_users')
        .select('id, telegram_id, email, username, age_range, city, subscription_status, subscription_plan')
        .eq('id', sessionData.userId)
        .single()

      if (error || !user) {
        // Пользователь не найден, удаляем сессию
        cookieStore.delete('telegram_session')
        return NextResponse.json({ authenticated: false })
      }

      return NextResponse.json({
        authenticated: true,
        user: {
          id: user.id,
          telegramId: user.telegram_id,
          email: user.email,
          username: user.username,
          ageRange: user.age_range,
          city: user.city,
          subscriptionStatus: user.subscription_status,
          subscriptionPlan: user.subscription_plan,
        },
      })
    } catch (parseError) {
      // Неверный формат токена
      cookieStore.delete('telegram_session')
      return NextResponse.json({ authenticated: false })
    }
  } catch (error) {
    console.error('Error in get-session API:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}





