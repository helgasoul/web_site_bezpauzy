import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

/**
 * GET /api/cart/order/[orderId]
 * Получает информацию о заказе из корзины (может содержать несколько товаров)
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

    // Проверяем, является ли это заказом из корзины (смотрим по metadata в webhook)
    // Для заказов из корзины все заказы связаны одним payment_id
    // Но проще всего - проверить, есть ли у заказа order_type='cart_order' в metadata
    // Однако metadata хранится только в YooKassa, не в нашей БД

    // Проверяем сначала книгу
    const { data: bookOrder } = await supabase
      .from('menohub_book_orders')
      .select('id, order_number, email, name, amount_kopecks, status, yookassa_payment_id, created_at')
      .eq('id', orderId)
      .single()

    // Проверяем статус - если pending, ждем оплаты (webhook еще не обработал)
    // Но для страницы успеха показываем даже pending заказы (пользователь вернулся с YooKassa)
    if (bookOrder) {
      // Это заказ книги, проверяем, есть ли другие заказы с тем же payment_id (из корзины)
      let allOrders: Array<{
        type: 'book' | 'resource'
        id: string
        title: string
        amount_kopecks: number
        order_number?: string
      }> = [
        {
          type: 'book',
          id: bookOrder.id,
          title: 'Менопауза: Новое видение',
          amount_kopecks: bookOrder.amount_kopecks,
          order_number: bookOrder.order_number || undefined,
        },
      ]

      let totalAmount = bookOrder.amount_kopecks

      // Если есть payment_id, проверяем другие заказы с тем же payment_id
      // Показываем заказы даже со статусом pending (пользователь вернулся с YooKassa)
      if (bookOrder.yookassa_payment_id) {
        const { data: otherBookOrders } = await supabase
          .from('menohub_book_orders')
          .select('id, order_number, amount_kopecks')
          .eq('yookassa_payment_id', bookOrder.yookassa_payment_id)
          .in('status', ['paid', 'pending'])
          .neq('id', orderId)

        if (otherBookOrders) {
          otherBookOrders.forEach((order) => {
            allOrders.push({
              type: 'book',
              id: order.id,
              title: 'Менопауза: Новое видение',
              amount_kopecks: order.amount_kopecks,
              order_number: order.order_number || undefined,
            })
            totalAmount += order.amount_kopecks
          })
        }

        const { data: resourceOrders } = await supabase
          .from('menohub_resource_purchases')
          .select(`
            id,
            order_number,
            amount_kopecks,
            resource_id,
            menohub_resources!inner(title)
          `)
          .eq('yookassa_payment_id', bookOrder.yookassa_payment_id)
          .in('status', ['paid', 'pending'])

        if (resourceOrders) {
          resourceOrders.forEach((order: any) => {
            allOrders.push({
              type: 'resource',
              id: order.id,
              title: order.menohub_resources?.title || 'Гайд',
              amount_kopecks: order.amount_kopecks,
              order_number: order.order_number || undefined,
            })
            totalAmount += order.amount_kopecks
          })
        }
      }

      return NextResponse.json({
        orderId: orderId,
        orderNumber: bookOrder.order_number || null,
        email: bookOrder.email,
        name: bookOrder.name,
        items: allOrders,
        totalAmountKopecks: totalAmount,
        createdAt: bookOrder.created_at,
      })
    }

    // Проверяем ресурс
    const { data: resourceOrder } = await supabase
      .from('menohub_resource_purchases')
      .select(`
        id,
        order_number,
        email,
        name,
        amount_kopecks,
        status,
        yookassa_payment_id,
        created_at,
        resource_id,
        menohub_resources!inner(title)
      `)
      .eq('id', orderId)
      .single()

    // Проверяем статус - если pending, ждем оплаты (webhook еще не обработал)
    // Но для страницы успеха показываем даже pending заказы (пользователь вернулся с YooKassa)
    if (resourceOrder) {
      let allOrders: Array<{
        type: 'book' | 'resource'
        id: string
        title: string
        amount_kopecks: number
        order_number?: string
      }> = [
        {
          type: 'resource',
          id: resourceOrder.id,
          title: resourceOrder.menohub_resources?.title || 'Гайд',
          amount_kopecks: resourceOrder.amount_kopecks,
          order_number: resourceOrder.order_number || undefined,
        },
      ]

      let totalAmount = resourceOrder.amount_kopecks

      // Проверяем другие заказы с тем же payment_id
      if (resourceOrder.yookassa_payment_id) {
        const { data: bookOrders } = await supabase
          .from('menohub_book_orders')
          .select('id, order_number, amount_kopecks, status')
          .eq('yookassa_payment_id', resourceOrder.yookassa_payment_id)
          .in('status', ['paid', 'pending'])

        if (bookOrders) {
          bookOrders.forEach((order) => {
            allOrders.push({
              type: 'book',
              id: order.id,
              title: 'Менопауза: Новое видение',
              amount_kopecks: order.amount_kopecks,
              order_number: order.order_number || undefined,
            })
            totalAmount += order.amount_kopecks
          })
        }

        const { data: otherResourceOrders } = await supabase
          .from('menohub_resource_purchases')
          .select(`
            id,
            order_number,
            amount_kopecks,
            resource_id,
            status,
            menohub_resources!inner(title)
          `)
          .eq('yookassa_payment_id', resourceOrder.yookassa_payment_id)
          .in('status', ['paid', 'pending'])
          .neq('id', orderId)

        if (otherResourceOrders) {
          otherResourceOrders.forEach((order: any) => {
            allOrders.push({
              type: 'resource',
              id: order.id,
              title: order.menohub_resources?.title || 'Гайд',
              amount_kopecks: order.amount_kopecks,
              order_number: order.order_number || undefined,
            })
            totalAmount += order.amount_kopecks
          })
        }
      }

      return NextResponse.json({
        orderId: orderId,
        orderNumber: resourceOrder.order_number || null,
        email: resourceOrder.email,
        name: resourceOrder.name,
        items: allOrders,
        totalAmountKopecks: totalAmount,
        createdAt: resourceOrder.created_at,
      })
    }

    return NextResponse.json(
      { error: 'Заказ не найден или еще не оплачен' },
      { status: 404 }
    )
  } catch (error: any) {
    logger.error('[API] Ошибка получения заказа:', error)
    return NextResponse.json(
      { error: error.message || 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
