import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

/**
 * POST /api/book/purchase/[orderId]/mark-paid
 * DEV-only endpoint для пометки заказа как оплаченного (для тестирования)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> | { orderId: string } }
) {
  // Только в development режиме
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    )
  }

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

    // Обновляем статус заказа на 'paid'
    const { error } = await supabase
      .from('menohub_book_orders')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (error) {
      console.error('Error marking book order as paid:', error)
      return NextResponse.json(
        { error: 'Ошибка при обновлении заказа' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in mark-paid:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

