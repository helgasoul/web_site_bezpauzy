import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

/**
 * POST /api/resources/purchase/[orderId]/mark-paid
 * DEV-ONLY: Помечает заказ как оплаченный, чтобы пройти поток тестирования.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> | { orderId: string } }
) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
    }

    const resolvedParams = await Promise.resolve(params)
    const { orderId } = resolvedParams

    if (!orderId) {
      return NextResponse.json(
        { error: 'ID заказа не указан' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    const { data, error } = await supabase
      .from('menohub_resource_purchases')
      .update({ status: 'paid' })
      .eq('id', orderId)
      .select('id, status')
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Не удалось обновить статус заказа' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, id: data.id, status: data.status })
  } catch (error: any) {
    console.error('Error in mark-paid API:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}


