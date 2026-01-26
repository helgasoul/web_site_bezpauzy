import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'

/**
 * GET /api/cookies/preferences
 * Получить настройки cookie для авторизованного пользователя
 */
export async function GET(request: NextRequest) {
  try {
    // Проверяем авторизацию пользователя
    const sessionData = await getSession()
    
    if (!sessionData || !sessionData.userId) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      )
    }

    const userId = sessionData.userId
    const supabase = createServiceRoleClient()

    // Получаем настройки пользователя
    const { data, error } = await supabase
      .from('menohub_user_cookie_preferences')
      .select('preferences')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching cookie preferences:', error)
      return NextResponse.json(
        { error: 'Ошибка при получении настроек' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      preferences: data?.preferences || null,
    })
  } catch (error: any) {
    console.error('Error in cookie preferences API:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/cookies/preferences
 * Сохранить настройки cookie для авторизованного пользователя
 */
export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию пользователя
    const sessionData = await getSession()
    
    if (!sessionData || !sessionData.userId) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      )
    }

    const userId = sessionData.userId
    const body = await request.json()
    const { preferences } = body

    if (!preferences) {
      return NextResponse.json(
        { error: 'preferences обязательны' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Сохраняем или обновляем настройки
    const { data, error } = await supabase
      .from('menohub_user_cookie_preferences')
      .upsert({
        user_id: userId,
        preferences: preferences,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving cookie preferences:', error)
      return NextResponse.json(
        { error: 'Ошибка при сохранении настроек' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      preferences: data.preferences,
    })
  } catch (error: any) {
    console.error('Error in cookie preferences API:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
