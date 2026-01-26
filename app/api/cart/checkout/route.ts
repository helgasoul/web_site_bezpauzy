import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'
import { randomUUID } from 'crypto'
import type { CartItem } from '@/lib/types/cart'
import { normalizeEmail } from '@/lib/utils/validation'
import { logger } from '@/lib/logger'

/**
 * Получить CORS headers для ответа
 */
function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get('origin')
  
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (origin) {
    if (origin.includes('ngrok-free.app') || origin.includes('ngrok-free.dev') || origin.includes('ngrok.io')) {
      headers['Access-Control-Allow-Origin'] = origin
      headers['Access-Control-Allow-Credentials'] = 'true'
      return headers
    }

    if (origin.includes('localhost:3000') || origin.includes('127.0.0.1:3000')) {
      headers['Access-Control-Allow-Origin'] = origin
      headers['Access-Control-Allow-Credentials'] = 'true'
      return headers
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    if (siteUrl) {
      try {
        const siteUrlObj = new URL(siteUrl)
        if (origin.includes(siteUrlObj.hostname)) {
          headers['Access-Control-Allow-Origin'] = origin
          headers['Access-Control-Allow-Credentials'] = 'true'
          return headers
        }
      } catch {
        // Игнорируем ошибки парсинга
      }
    }
  }

  if (process.env.NODE_ENV === 'development') {
    if (origin) {
      headers['Access-Control-Allow-Origin'] = origin
      headers['Access-Control-Allow-Credentials'] = 'true'
    } else {
      headers['Access-Control-Allow-Origin'] = '*'
    }
    return headers
  }

  return headers
}

/**
 * OPTIONS /api/cart/checkout
 */
export async function OPTIONS(request: NextRequest) {
  const headers = getCorsHeaders(request)
  return new NextResponse(null, { status: 200, headers })
}

/**
 * POST /api/cart/checkout
 * Создает заказы из корзины и возвращает ссылку на оплату ЮКасса
 */
export async function POST(request: NextRequest) {
  try {
    logger.debug('🛒 [API] Запрос на оформление заказа из корзины')

    const corsHeaders = getCorsHeaders(request)

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      logger.error('[API] SUPABASE_SERVICE_ROLE_KEY не установлен')
      throw new Error('SUPABASE_SERVICE_ROLE_KEY не установлен')
    }

    // Получаем данные из запроса
    const body = await request.json()
    const { items, email, name, phone } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Корзина пуста' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Валидация и нормализация email
    if (!email) {
      return NextResponse.json(
        { error: 'Email обязателен' },
        { status: 400, headers: corsHeaders }
      )
    }

    const normalizedEmail = normalizeEmail(email)
    if (!normalizedEmail) {
      return NextResponse.json(
        { error: 'Некорректный формат email' },
        { status: 400, headers: corsHeaders }
      )
    }

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Имя обязательно' },
        { status: 400, headers: corsHeaders }
      )
    }

    const supabase = createServiceRoleClient()

    // Получаем userId из сессии (если есть)
    let userId: number | null = null
    try {
      const sessionData = await getSession()
      if (sessionData) {
        userId = sessionData.userId
      }
    } catch {
      // Пользователь не авторизован - продолжаем без userId
    }

    // Создаем заказы для каждого товара
    const orderIds: string[] = []
    const orderItemTypes: Array<'book' | 'resource'> = [] // Храним тип товара для каждого заказа
    const orderItems: Array<{ description: string; quantity: number; amount: number }> = []
    let totalAmountKopecks = 0

    for (const item of items as CartItem[]) {
      const itemTotalKopecks = Math.round(item.price * item.quantity * 100)
      totalAmountKopecks += itemTotalKopecks

      orderItems.push({
        description: `${item.title}${item.quantity > 1 ? ` (x${item.quantity})` : ''}`,
        quantity: item.quantity,
        amount: itemTotalKopecks,
      })

      if (item.type === 'book') {
        // Создаем заказ книги
        const downloadToken = randomUUID()
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 30)

        // Генерируем номер заказа через PostgreSQL функцию
        const { data: orderNumberData, error: orderNumberError } = await supabase
          .rpc('generate_order_number')

        if (orderNumberError) {
          logger.error('[API] Ошибка генерации номера заказа:', orderNumberError)
          return NextResponse.json(
            { error: 'Ошибка при генерации номера заказа' },
            { status: 500, headers: corsHeaders }
          )
        }

        const orderNumber = orderNumberData || null

        const { data: bookOrder, error: bookError } = await supabase
          .from('menohub_book_orders')
          .insert({
            email: normalizedEmail,
            name: name.trim(),
            phone: phone?.trim() || null,
            user_id: userId,
            book_type: item.metadata?.book_type || 'digital',
            amount_kopecks: itemTotalKopecks,
            status: 'pending',
            download_token: downloadToken,
            download_token_expires_at: expiresAt.toISOString(),
            order_number: orderNumber,
          })
          .select('id, order_number')
          .single()

        if (bookError) {
          logger.error('[API] Ошибка создания заказа книги:', bookError)
          logger.error('[API] Детали ошибки:', JSON.stringify(bookError, null, 2))
          logger.error('[API] Данные запроса:', {
            email: normalizedEmail,
            name: name.trim(),
            phone: phone?.trim() || null,
            user_id: userId,
            book_type: item.metadata?.book_type || 'digital',
            amount_kopecks: itemTotalKopecks,
            download_token: downloadToken,
            download_token_expires_at: expiresAt.toISOString(),
          })
          return NextResponse.json(
            { error: `Ошибка при создании заказа книги: ${bookError.message || 'Неизвестная ошибка'}` },
            { status: 500, headers: corsHeaders }
          )
        }

        orderIds.push(bookOrder.id)
        orderItemTypes.push('book')
      } else if (item.type === 'resource') {
        // Создаем заказ ресурса
        const downloadToken = randomUUID()
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 30)

        // Получаем информацию о ресурсе
        const resourceSlug = item.metadata?.resource_slug || item.id
        const { data: resource } = await supabase
          .from('menohub_resources')
          .select('id, title')
          .eq('slug', resourceSlug)
          .single()

        if (!resource) {
          logger.error('[API] Ресурс не найден:', resourceSlug)
          return NextResponse.json(
            { error: `Ресурс "${item.title}" не найден` },
            { status: 404, headers: corsHeaders }
          )
        }

        // Генерируем номер заказа через PostgreSQL функцию
        const { data: orderNumberData, error: orderNumberError } = await supabase
          .rpc('generate_order_number')

        if (orderNumberError) {
          logger.error('[API] Ошибка генерации номера заказа:', orderNumberError)
          return NextResponse.json(
            { error: 'Ошибка при генерации номера заказа' },
            { status: 500, headers: corsHeaders }
          )
        }

        const orderNumber = orderNumberData || null

        // Создаем один заказ ресурса с общей суммой (quantity учитывается в amount_kopecks)
        const { data: resourceOrder, error: resourceError } = await supabase
          .from('menohub_resource_purchases')
          .insert({
            email: normalizedEmail,
            name: name.trim(),
            // phone не поддерживается в таблице menohub_resource_purchases
            user_id: userId,
            resource_id: resource.id,
            amount_kopecks: itemTotalKopecks, // Используем общую сумму с учетом quantity
            status: 'pending',
            download_token: downloadToken,
            download_token_expires_at: expiresAt.toISOString(),
            order_number: orderNumber,
          })
          .select('id, order_number')
          .single()

        if (resourceError) {
          logger.error('[API] Ошибка создания заказа ресурса:', resourceError)
          logger.error('[API] Детали ошибки:', JSON.stringify(resourceError, null, 2))
          return NextResponse.json(
            { error: `Ошибка при создании заказа ресурса: ${resourceError.message || 'Неизвестная ошибка'}` },
            { status: 500, headers: corsHeaders }
          )
        }

        orderIds.push(resourceOrder.id)
        orderItemTypes.push('resource')
      }
    }

    // Создаем единый платеж в ЮКассе
    const mainOrderId = orderIds[0] // Используем первый ID как основной
    const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/purchase/success?orderId=${mainOrderId}`

    const { paymentUrl, paymentId } = await createYooKassaPayment({
      amount: totalAmountKopecks,
      orderId: mainOrderId,
      description: `Заказ из корзины: ${orderItems.map(i => i.description).join(', ')}`,
      returnUrl,
      email: normalizedEmail,
      items: orderItems,
      allOrderIds: orderIds, // Все ID заказов для обновления после оплаты
    })

    if (!paymentUrl) {
      logger.error('[API] Не удалось создать payment URL')
      return NextResponse.json(
        {
          error: 'Ошибка при создании платежа',
          warning: 'Ключи ЮКассы не настроены. Для реального платежа настройте YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY в .env.local',
        },
        { status: 500, headers: corsHeaders }
      )
    }

    // Обновляем все заказы с payment_id
    if (paymentId) {
      for (let i = 0; i < orderIds.length; i++) {
        const orderId = orderIds[i]
        const orderType = orderItemTypes[i]
        
        // Определяем тип заказа по сохраненному типу
        if (orderType === 'book') {
          const { error: updateError } = await supabase
            .from('menohub_book_orders')
            .update({ yookassa_payment_id: paymentId })
            .eq('id', orderId)
          
          if (updateError) {
            logger.error(`[API] Ошибка обновления заказа книги ${orderId}:`, updateError)
          } else {
            logger.debug(`✅ [API] Заказ книги обновлен: ${orderId}`)
          }
        } else if (orderType === 'resource') {
          const { error: updateError } = await supabase
            .from('menohub_resource_purchases')
            .update({ yookassa_payment_id: paymentId })
            .eq('id', orderId)
          
          if (updateError) {
            logger.error(`[API] Ошибка обновления заказа ресурса ${orderId}:`, updateError)
          } else {
            logger.debug(`✅ [API] Заказ ресурса обновлен: ${orderId}`)
          }
        }
      }
    }

    // Получаем номер заказа для ответа
    let orderNumber: string | null = null
    const firstOrderType = orderItemTypes[0]
    if (firstOrderType === 'book') {
      const { data: orderData } = await supabase
        .from('menohub_book_orders')
        .select('order_number')
        .eq('id', mainOrderId)
        .single()
      orderNumber = orderData?.order_number || null
    } else {
      const { data: orderData } = await supabase
        .from('menohub_resource_purchases')
        .select('order_number')
        .eq('id', mainOrderId)
        .single()
      orderNumber = orderData?.order_number || null
    }

    return NextResponse.json(
      {
        success: true,
        paymentUrl,
        orderId: mainOrderId,
        orderNumber: orderNumber,
        totalAmount: totalAmountKopecks,
      },
      { headers: corsHeaders }
    )
  } catch (error: any) {
    logger.error('[API] Ошибка оформления заказа:', error)
    logger.error('[API] Stack trace:', error.stack)
    logger.error('[API] Детали ошибки:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    return NextResponse.json(
      { 
        error: error.message || 'Внутренняя ошибка сервера',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500, headers: getCorsHeaders(request) }
    )
  }
}

/**
 * Создает платеж в ЮКассе
 */
async function createYooKassaPayment(params: {
  amount: number
  orderId: string
  description: string
  returnUrl: string
  email?: string
  items: Array<{ description: string; quantity: number; amount: number }>
  allOrderIds?: string[]
}): Promise<{ paymentUrl: string | null; paymentId?: string | null }> {
  const shopId = process.env.YOOKASSA_SHOP_ID
  const secretKey = process.env.YOOKASSA_SECRET_KEY

  if (!shopId || !secretKey) {
    logger.warn('⚠️ [YooKassa] Переменные окружения не заданы, использую dev redirect')
    return { paymentUrl: `${params.returnUrl}&test=true`, paymentId: null }
  }

  const isTestMode = 
    shopId.includes('test') || 
    shopId.startsWith('381764678') ||
    secretKey.includes('test') ||
    secretKey.startsWith('test_') ||
    process.env.NODE_ENV === 'development'
  
  logger.debug(`💳 [YooKassa] Режим: ${isTestMode ? 'ТЕСТОВАЯ' : 'PRODUCTION'}`)

  const auth = Buffer.from(`${shopId}:${secretKey}`).toString('base64')
  const idempotenceKey = randomUUID()

  // Формируем receipt с несколькими товарами
  const receipt: any = {
    items: params.items.map(item => ({
      description: item.description,
      quantity: item.quantity.toString(),
      amount: {
        value: (item.amount / 100).toFixed(2),
        currency: 'RUB',
      },
      vat_code: 2, // НДС 0% для цифровых товаров
    })),
  }
  
  if (params.email) {
    receipt.customer = {
      email: params.email,
    }
  }

  const payload: any = {
    amount: {
      value: (params.amount / 100).toFixed(2),
      currency: 'RUB',
    },
    capture: true,
    confirmation: {
      type: 'redirect',
      return_url: params.returnUrl,
    },
    description: params.description,
    receipt: receipt,
    metadata: {
      order_id: params.orderId,
      order_type: 'cart_order',
      all_order_ids: params.allOrderIds?.join(',') || params.orderId,
    },
  }

  const res = await fetch('https://api.yookassa.ru/v3/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotence-Key': idempotenceKey,
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(payload),
  })

  const responseText = await res.text()

  if (!res.ok) {
      logger.error('[YooKassa] Ошибка создания платежа:', responseText)
    return { paymentUrl: null }
  }

  const payment = JSON.parse(responseText)
  const paymentUrl = payment?.confirmation?.confirmation_url || null
  const paymentId = payment?.id || null

  return { paymentUrl, paymentId }
}
