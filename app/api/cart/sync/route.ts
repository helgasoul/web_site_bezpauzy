import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'
import type { CartItem } from '@/lib/types/cart'

/**
 * GET /api/cart/sync
 * Загружает корзину пользователя с сервера
 */
export async function GET(request: NextRequest) {
  try {
    const sessionData = await getSession()
    
    if (!sessionData || !sessionData.userId) {
      // Пользователь не авторизован - возвращаем пустую корзину
      return NextResponse.json({ items: [] })
    }

    const supabase = createServiceRoleClient()
    
    const { data: cart, error } = await supabase
      .from('menohub_user_cart')
      .select('items')
      .eq('user_id', sessionData.userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ [API] Ошибка загрузки корзины:', error)
      return NextResponse.json(
        { error: 'Ошибка при загрузке корзины' },
        { status: 500 }
      )
    }

    const items: CartItem[] = cart?.items || []
    
    return NextResponse.json({ items })
  } catch (error: any) {
    console.error('❌ [API] Ошибка синхронизации корзины:', error)
    return NextResponse.json(
      { error: error.message || 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/cart/sync
 * Сохраняет корзину пользователя на сервере
 */
export async function POST(request: NextRequest) {
  try {
    const sessionData = await getSession()
    
    if (!sessionData || !sessionData.userId) {
      // Пользователь не авторизован - игнорируем сохранение
      return NextResponse.json({ success: true })
    }

    const body = await request.json()
    const { items } = body

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Некорректный формат данных корзины' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()
    
    // Используем upsert для обновления существующей корзины или создания новой
    const { error } = await supabase
      .from('menohub_user_cart')
      .upsert({
        user_id: sessionData.userId,
        items: items,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })

    if (error) {
      console.error('❌ [API] Ошибка сохранения корзины:', error)
      return NextResponse.json(
        { error: 'Ошибка при сохранении корзины' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('❌ [API] Ошибка синхронизации корзины:', error)
    return NextResponse.json(
      { error: error.message || 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
