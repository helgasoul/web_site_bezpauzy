import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

/**
 * GET /api/book/purchase/[orderId]
 * Получить информацию о заказе книги по ID заказа
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> | { orderId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const { orderId } = resolvedParams

    if (!orderId) {
      return NextResponse.json(
        { error: 'ID заказа не указан' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Получаем информацию о заказе
    const { data: order, error } = await supabase
      .from('menohub_book_orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (error || !order) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      )
    }

    // Проверяем статус оплаты
    if (order.status !== 'paid') {
      return NextResponse.json(
        { error: 'Оплата не завершена' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      id: order.id,
      resourceTitle: 'Менопауза: Новое видение',
      downloadToken: order.download_token || null,
      downloadCount: order.download_count || 0,
      maxDownloads: order.max_downloads || 10,
      expiresAt: order.download_token_expires_at || null,
      bookType: order.book_type,
    })
  } catch (error: any) {
    console.error('Error fetching book order:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

