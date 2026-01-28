import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/middleware'
import { createServiceRoleClient } from '@/lib/supabase/server'

// GET /api/admin/orders/[id] - Получение деталей заказа
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { admin, error: authError } = await requireAdmin(request)
    if (!admin || authError) {
      return NextResponse.json(
        { error: authError || 'Unauthorized' },
        { status: 401 }
      )
    }

    // Проверка прав доступа
    if (admin.role !== 'super_admin' && admin.role !== 'order_manager') {
      return NextResponse.json(
        { error: 'Недостаточно прав доступа' },
        { status: 403 }
      )
    }

    let supabase
    try {
      supabase = createServiceRoleClient()
    } catch (e) {
      return NextResponse.json(
        { error: 'Supabase service role not configured' },
        { status: 500 }
      )
    }

    const orderId = params.id

    // Получаем заказ
    const { data: order, error } = await supabase
      .from('menohub_book_orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (error) {
      console.error('Error fetching order:', error)
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      )
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('❌ [Admin Orders] GET Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/orders/[id] - Обновление статуса заказа
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { admin, error: authError } = await requireAdmin(request)
    if (!admin || authError) {
      return NextResponse.json(
        { error: authError || 'Unauthorized' },
        { status: 401 }
      )
    }

    // Проверка прав доступа
    if (admin.role !== 'super_admin' && admin.role !== 'order_manager') {
      return NextResponse.json(
        { error: 'Недостаточно прав доступа' },
        { status: 403 }
      )
    }

    let supabase
    try {
      supabase = createServiceRoleClient()
    } catch (e) {
      return NextResponse.json(
        { error: 'Supabase service role not configured' },
        { status: 500 }
      )
    }

    const orderId = params.id
    const body = await request.json()
    const { status: newStatus } = body

    // Валидация статуса
    const validStatuses = ['pending', 'paid', 'shipped', 'cancelled', 'refunded']
    if (!newStatus || !validStatuses.includes(newStatus)) {
      return NextResponse.json(
        { error: 'Некорректный статус' },
        { status: 400 }
      )
    }

    // Получаем текущий заказ
    const { data: currentOrder, error: fetchError } = await supabase
      .from('menohub_book_orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (fetchError || !currentOrder) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      )
    }

    // Подготовка обновлений с автоматическими временными метками
    const updates: any = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    }

    // Установка временных меток в зависимости от статуса
    if (newStatus === 'paid' && currentOrder.status === 'pending' && !currentOrder.paid_at) {
      updates.paid_at = new Date().toISOString()
    }

    if (newStatus === 'shipped' && currentOrder.status === 'paid' && !currentOrder.shipped_at) {
      updates.shipped_at = new Date().toISOString()
    }

    if (newStatus === 'cancelled' && !currentOrder.cancelled_at) {
      updates.cancelled_at = new Date().toISOString()
    }

    // Обновляем заказ
    const { data: updatedOrder, error: updateError } = await supabase
      .from('menohub_book_orders')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating order:', updateError)
      return NextResponse.json(
        { error: 'Ошибка обновления заказа' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    })
  } catch (error) {
    console.error('❌ [Admin Orders] PATCH Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
