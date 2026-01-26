import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { sendPurchaseConfirmation } from '@/lib/email/send-purchase-confirmation'
import { logger } from '@/lib/logger'

/**
 * POST /api/webhooks/yookassa
 * Обработка уведомлений YooKassa.
 * Обновляет статус заказа на 'paid' при payment.succeeded.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body) {
      return NextResponse.json({ error: 'Bad payload' }, { status: 400 })
    }

    // ЮКасса отправляет события в формате:
    // { event: 'payment.succeeded', object: { id, status, amount, metadata } }
    const event: string | undefined = body.event
    const payment = body.object || body.payment || {}
    const paymentId: string | undefined = payment.id
    const status: string | undefined = payment.status
    const metadata = payment.metadata || {}
    const orderId: string | undefined = metadata.order_id

    // Лог для отладки
    logger.debug('📬 [YooKassa webhook] Получено событие:', { 
      event, 
      status, 
      paymentId, 
      orderId,
      fullBody: JSON.stringify(body, null, 2),
    })

    if (!orderId) {
      logger.error('[YooKassa webhook] order_id не найден в metadata')
      return NextResponse.json({ error: 'order_id not found' }, { status: 400 })
    }

    // Подтверждаем оплату только на событии успеха
    const isSucceeded = event === 'payment.succeeded' || status === 'succeeded'
    if (!isSucceeded) {
      logger.debug('⏭️ [YooKassa webhook] Событие пропущено (не payment.succeeded):', event)
      return NextResponse.json({ ok: true, skipped: true })
    }

    const supabase = createServiceRoleClient()

    // Определяем тип заказа из metadata
    const orderType = metadata.order_type || 'resource_purchase' // По умолчанию resource_purchase для обратной совместимости
    const allOrderIds = metadata.all_order_ids ? metadata.all_order_ids.split(',') : [orderId]

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'
    const purchaseItems: Array<{
      type: 'book' | 'resource'
      title: string
      downloadToken: string
      downloadUrl: string
      expiresAt: string
    }> = []
    let customerEmail: string | null = null
    let customerName: string | null = null

    // Проверяем, что заказ существует (в зависимости от типа)
    if (orderType === 'cart_order') {
      // Обработка заказа из корзины - обновляем все заказы
      logger.debug('🛒 [YooKassa webhook] Обработка заказа из корзины, заказов:', allOrderIds.length)

      for (const singleOrderId of allOrderIds) {
        // Проверяем, книга это или ресурс
        const { data: bookOrder } = await supabase
          .from('menohub_book_orders')
          .select('id, status, email, name, download_token, download_token_expires_at, order_number')
          .eq('id', singleOrderId)
          .single()

        if (bookOrder) {
          // Сохраняем email и имя клиента (берем из первого заказа)
          if (!customerEmail) {
            customerEmail = bookOrder.email
            customerName = bookOrder.name
          }

          if (bookOrder.status !== 'paid') {
            const { error: updateError } = await supabase
              .from('menohub_book_orders')
              .update({
                status: 'paid',
                yookassa_payment_id: paymentId,
                paid_at: new Date().toISOString(),
              })
              .eq('id', singleOrderId)

            if (updateError) {
              logger.error('[YooKassa webhook] Ошибка обновления заказа книги:', updateError)
            } else {
              logger.debug('✅ [YooKassa webhook] Заказ книги обновлен:', singleOrderId)
            }
          }

          // Добавляем в список товаров для письма
          if (bookOrder.download_token) {
            purchaseItems.push({
              type: 'book',
              title: 'Менопауза: Новое видение',
              downloadToken: bookOrder.download_token,
              downloadUrl: `${siteUrl}/api/book/download/${bookOrder.download_token}`,
              expiresAt: bookOrder.download_token_expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            })
          }
        } else {
          // Пробуем обновить как ресурс
          const { data: resourceOrder } = await supabase
            .from('menohub_resource_purchases')
            .select(`
              id, 
              status, 
              email, 
              name, 
              download_token, 
              download_token_expires_at,
              resource_id,
              order_number
            `)
            .eq('id', singleOrderId)
            .single()

          if (resourceOrder) {
            // Сохраняем email и имя клиента (берем из первого заказа)
            if (!customerEmail) {
              customerEmail = resourceOrder.email
              customerName = resourceOrder.name
            }

            if (resourceOrder.status !== 'paid') {
              const { error: updateError } = await supabase
                .from('menohub_resource_purchases')
                .update({
                  status: 'paid',
                  yookassa_payment_id: paymentId,
                  paid_at: new Date().toISOString(),
                })
                .eq('id', singleOrderId)

              if (updateError) {
                logger.error('[YooKassa webhook] Ошибка обновления заказа ресурса:', updateError)
              } else {
                logger.debug('✅ [YooKassa webhook] Заказ ресурса обновлен:', singleOrderId)
              }
            }

            // Получаем название ресурса
            if (resourceOrder.download_token && resourceOrder.resource_id) {
              const { data: resource } = await supabase
                .from('menohub_resources')
                .select('title')
                .eq('id', resourceOrder.resource_id)
                .single()

              purchaseItems.push({
                type: 'resource',
                title: resource?.title || 'Гайд',
                downloadToken: resourceOrder.download_token,
                downloadUrl: `${siteUrl}/api/resources/download/${resourceOrder.download_token}`,
                expiresAt: resourceOrder.download_token_expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              })
            }
          }
        }
      }

      logger.debug('✅ [YooKassa webhook] Все заказы из корзины обработаны')

      // Отправляем письмо со всеми товарами из корзины
      if (customerEmail && customerName && purchaseItems.length > 0) {
        logger.debug('📧 [YooKassa webhook] Подготовка к отправке письма для заказа из корзины:', {
          email: customerEmail,
          name: customerName,
          itemsCount: purchaseItems.length,
          items: purchaseItems.map(i => i.title),
        })
        
        try {
          // Получаем номер заказа из первого заказа (все заказы из корзины имеют разные номера, но используем первый для письма)
          let orderNumberForEmail: string | undefined = undefined
          const { data: firstOrder } = await supabase
            .from('menohub_book_orders')
            .select('order_number')
            .eq('id', allOrderIds[0])
            .single()
          
          if (!firstOrder) {
            const { data: firstResourceOrder } = await supabase
              .from('menohub_resource_purchases')
              .select('order_number')
              .eq('id', allOrderIds[0])
              .single()
            if (firstResourceOrder) {
              orderNumberForEmail = firstResourceOrder.order_number || undefined
            }
          } else {
            orderNumberForEmail = firstOrder.order_number || undefined
          }

          const emailResult = await sendPurchaseConfirmation({
            email: customerEmail,
            name: customerName,
            items: purchaseItems,
            orderId: orderNumberForEmail || allOrderIds[0],
          })
          
          if (emailResult.success) {
            if (emailResult.warning) {
              logger.warn('⚠️ [YooKassa webhook] Письмо не отправлено (только логирование):', emailResult.warning)
            } else {
              logger.debug('✅ [YooKassa webhook] Письмо с подтверждением покупки отправлено успешно')
            }
          } else {
            logger.error('[YooKassa webhook] Ошибка отправки письма:', emailResult.error)
          }
        } catch (emailError: any) {
          logger.error('[YooKassa webhook] Исключение при отправке письма:', emailError)
          logger.error('[YooKassa webhook] Stack trace:', emailError.stack)
          // Не прерываем выполнение, если письмо не отправилось
        }
      } else {
        logger.warn('⚠️ [YooKassa webhook] Пропущена отправка письма - нет необходимых данных:', {
          hasEmail: !!customerEmail,
          hasName: !!customerName,
          itemsCount: purchaseItems.length,
        })
      }
    } else if (orderType === 'book_purchase') {
      // Обработка заказа книги
      const { data: existingOrder, error: findError } = await supabase
        .from('menohub_book_orders')
        .select('id, status')
        .eq('id', orderId)
        .single()

      if (findError || !existingOrder) {
        logger.error('[YooKassa webhook] Заказ книги не найден:', orderId, findError)
        return NextResponse.json({ error: 'Book order not found' }, { status: 404 })
      }

      // Проверяем, что платеж еще не обработан
      if (existingOrder.status === 'paid') {
        logger.debug('✅ [YooKassa webhook] Заказ книги уже оплачен:', orderId)
        return NextResponse.json({ ok: true, already_processed: true })
      }

      // Обновляем статус заказа книги
      const { error: updateError } = await supabase
        .from('menohub_book_orders')
        .update({
          status: 'paid',
          yookassa_payment_id: paymentId,
          paid_at: new Date().toISOString(),
        })
        .eq('id', orderId)

      if (updateError) {
        logger.error('[YooKassa webhook] Ошибка обновления заказа книги:', updateError)
        return NextResponse.json({ error: 'db update failed' }, { status: 500 })
      }

      logger.debug('✅ [YooKassa webhook] Заказ книги успешно обновлен на "paid":', orderId)

      // Получаем данные заказа для отправки письма
      const { data: orderData } = await supabase
        .from('menohub_book_orders')
        .select('email, name, download_token, download_token_expires_at, order_number')
        .eq('id', orderId)
        .single()

      if (orderData && orderData.download_token && orderData.email && orderData.name) {
        try {
          logger.debug('📧 [YooKassa webhook] Подготовка к отправке письма для книги:', {
            email: orderData.email,
            name: orderData.name,
            orderNumber: orderData.order_number || orderId,
          })
          
          const emailResult = await sendPurchaseConfirmation({
            email: orderData.email,
            name: orderData.name,
            items: [{
              type: 'book',
              title: 'Менопауза: Новое видение',
              downloadToken: orderData.download_token,
              downloadUrl: `${siteUrl}/api/book/download/${orderData.download_token}`,
              expiresAt: orderData.download_token_expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            }],
            orderId: orderData.order_number || orderId,
          })
          
          if (emailResult.success) {
            if (emailResult.warning) {
              logger.warn('⚠️ [YooKassa webhook] Письмо не отправлено (только логирование):', emailResult.warning)
            } else {
              logger.debug('✅ [YooKassa webhook] Письмо с подтверждением покупки книги отправлено успешно')
            }
          } else {
            logger.error('[YooKassa webhook] Ошибка отправки письма:', emailResult.error)
          }
        } catch (emailError: any) {
          logger.error('[YooKassa webhook] Исключение при отправке письма:', emailError)
          logger.error('[YooKassa webhook] Stack trace:', emailError.stack)
        }
      } else {
        logger.warn('⚠️ [YooKassa webhook] Не отправлено письмо - нет необходимых данных:', {
          hasEmail: !!orderData?.email,
          hasName: !!orderData?.name,
          hasDownloadToken: !!orderData?.download_token,
        })
      }
    } else {
      // Обработка заказа ресурса (гайда)
      const { data: existingPurchase, error: findError } = await supabase
        .from('menohub_resource_purchases')
        .select('id, status')
        .eq('id', orderId)
        .single()

      if (findError || !existingPurchase) {
        logger.error('[YooKassa webhook] Заказ ресурса не найден:', orderId, findError)
        return NextResponse.json({ error: 'Purchase not found' }, { status: 404 })
      }

      // Проверяем, что платеж еще не обработан
      if (existingPurchase.status === 'paid') {
        logger.debug('✅ [YooKassa webhook] Заказ ресурса уже оплачен:', orderId)
        return NextResponse.json({ ok: true, already_processed: true })
      }

      // Обновляем статус заказа ресурса
      const { error: updateError } = await supabase
        .from('menohub_resource_purchases')
        .update({
          status: 'paid',
          yookassa_payment_id: paymentId,
          paid_at: new Date().toISOString(),
        })
        .eq('id', orderId)

      if (updateError) {
        logger.error('[YooKassa webhook] Ошибка обновления заказа ресурса:', updateError)
        return NextResponse.json({ error: 'db update failed' }, { status: 500 })
      }

      logger.debug('✅ [YooKassa webhook] Заказ ресурса успешно обновлен на "paid":', orderId)

      // Получаем данные заказа для отправки письма
      const { data: purchaseData } = await supabase
        .from('menohub_resource_purchases')
        .select(`
          email, 
          name, 
          download_token, 
          download_token_expires_at,
          resource_id,
          order_number
        `)
        .eq('id', orderId)
        .single()

      if (purchaseData && purchaseData.download_token && purchaseData.email && purchaseData.name) {
        // Получаем название ресурса
        let resourceTitle = 'Гайд'
        if (purchaseData.resource_id) {
          const { data: resource } = await supabase
            .from('menohub_resources')
            .select('title')
            .eq('id', purchaseData.resource_id)
            .single()
          if (resource) {
            resourceTitle = resource.title
          }
        }

        try {
          logger.debug('📧 [YooKassa webhook] Подготовка к отправке письма для ресурса:', {
            email: purchaseData.email,
            name: purchaseData.name,
            resourceTitle,
            orderNumber: purchaseData.order_number || orderId,
          })
          
          const emailResult = await sendPurchaseConfirmation({
            email: purchaseData.email,
            name: purchaseData.name,
            items: [{
              type: 'resource',
              title: resourceTitle,
              downloadToken: purchaseData.download_token,
              downloadUrl: `${siteUrl}/api/resources/download/${purchaseData.download_token}`,
              expiresAt: purchaseData.download_token_expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            }],
            orderId: purchaseData.order_number || orderId,
          })
          
          if (emailResult.success) {
            if (emailResult.warning) {
              logger.warn('⚠️ [YooKassa webhook] Письмо не отправлено (только логирование):', emailResult.warning)
            } else {
              logger.debug('✅ [YooKassa webhook] Письмо с подтверждением покупки ресурса отправлено успешно')
            }
          } else {
            logger.error('[YooKassa webhook] Ошибка отправки письма:', emailResult.error)
          }
        } catch (emailError: any) {
          logger.error('[YooKassa webhook] Исключение при отправке письма:', emailError)
          logger.error('[YooKassa webhook] Stack trace:', emailError.stack)
        }
      }
    }

    return NextResponse.json({ ok: true, processed: true })
  } catch (err: any) {
    logger.error('[YooKassa webhook] Ошибка обработки:', err)
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}

