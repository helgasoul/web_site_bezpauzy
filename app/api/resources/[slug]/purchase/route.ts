import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getResourceBySlug } from '@/lib/supabase/resources'
import { randomUUID } from 'crypto'

/**
 * Получить CORS headers для ответа
 */
function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get('origin')
  
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  console.log('🌐 [CORS] Origin:', origin)

  if (origin) {
    // Разрешаем все ngrok домены (более гибкая проверка)
    if (origin.includes('ngrok-free.app') || origin.includes('ngrok-free.dev') || origin.includes('ngrok.io')) {
      console.log('✅ [CORS] Разрешен ngrok origin:', origin)
      headers['Access-Control-Allow-Origin'] = origin
      headers['Access-Control-Allow-Credentials'] = 'true'
      return headers
    }

    // Разрешаем localhost
    if (origin.includes('localhost:3000') || origin.includes('127.0.0.1:3000')) {
      console.log('✅ [CORS] Разрешен localhost origin:', origin)
      headers['Access-Control-Allow-Origin'] = origin
      headers['Access-Control-Allow-Credentials'] = 'true'
      return headers
    }

    // Разрешаем домен из NEXT_PUBLIC_SITE_URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    if (siteUrl) {
      try {
        const siteUrlObj = new URL(siteUrl)
        if (origin.includes(siteUrlObj.hostname)) {
          console.log('✅ [CORS] Разрешен site URL origin:', origin)
          headers['Access-Control-Allow-Origin'] = origin
          headers['Access-Control-Allow-Credentials'] = 'true'
          return headers
        }
      } catch {
        // Игнорируем ошибки парсинга
      }
    }

    console.warn('⚠️ [CORS] Origin не разрешен:', origin)
  } else {
    console.warn('⚠️ [CORS] Origin не предоставлен')
  }

  // В development режиме разрешаем все origins для отладки
  if (process.env.NODE_ENV === 'development') {
    console.log('🔓 [CORS] Development режим - разрешаю все origins')
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
 * OPTIONS /api/resources/[slug]/purchase
 * Обработка preflight запросов для CORS
 */
export async function OPTIONS(request: NextRequest) {
  const headers = getCorsHeaders(request)
  return new NextResponse(null, { status: 200, headers })
}

/**
 * POST /api/resources/[slug]/purchase
 * Создает заказ на покупку платного ресурса и возвращает ссылку на оплату ЮКасса
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const { slug } = resolvedParams

    console.log('🛒 [API] Запрос на покупку ресурса:', slug)

    // Проверка необходимых переменных окружения
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ [API] SUPABASE_SERVICE_ROLE_KEY не установлен')
      throw new Error('SUPABASE_SERVICE_ROLE_KEY не установлен в переменных окружения')
    }

    const corsHeaders = getCorsHeaders(request)

    // Получаем данные из запроса
    const body = await request.json()
    const { email, name, agreeToOffer } = body

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const trimmedEmail = email?.trim().toLowerCase() || ''
    
    if (!trimmedEmail) {
      return NextResponse.json(
        { error: 'Email обязателен' },
        { status: 400, headers: corsHeaders }
      )
    }

    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Некорректный формат email' },
        { status: 400, headers: corsHeaders }
      )
    }

    if (!agreeToOffer) {
      return NextResponse.json(
        { error: 'Необходимо согласие с офертой' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Получаем ресурс
    const resource = await getResourceBySlug(slug)

    if (!resource) {
      return NextResponse.json(
        { error: 'Ресурс не найден' },
        { status: 404, headers: corsHeaders }
      )
    }

    if (!resource.isPaid) {
      return NextResponse.json(
        { error: 'Этот ресурс не является платным' },
        { status: 400, headers: corsHeaders }
      )
    }

    if (!resource.priceKopecks || resource.priceKopecks <= 0) {
      return NextResponse.json(
        { error: 'Цена не установлена' },
        { status: 400, headers: corsHeaders }
      )
    }

    const supabase = createServiceRoleClient()

    // Генерируем уникальный токен для скачивания (будет использован после оплаты)
    const downloadToken = randomUUID()

    // Вычисляем срок действия токена (30 дней)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    // Создаем заказ в БД
    const { data: purchase, error: purchaseError } = await supabase
      .from('menohub_resource_purchases')
      .insert({
        resource_id: resource.id,
        email: trimmedEmail,
        name: name?.trim() || null,
        amount_kopecks: resource.priceKopecks,
        status: 'pending',
        download_token: downloadToken,
        download_token_expires_at: expiresAt.toISOString(),
        max_downloads: resource.downloadLimit || 3,
        metadata: {
          user_agent: request.headers.get('user-agent'),
          ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        },
      })
      .select()
      .single()

    if (purchaseError) {
      console.error('Error creating purchase:', purchaseError)
      return NextResponse.json(
        { error: 'Ошибка при создании заказа' },
        { status: 500, headers: corsHeaders }
      )
    }

    // TODO: Интеграция с ЮКасса
    // Пока возвращаем заглушку
    // В реальной реализации здесь будет:
    // 1. Создание платежа в ЮКасса
    // 2. Получение paymentUrl
    // 3. Сохранение yookassa_payment_id в purchase

    // Определяем базовый URL (в dev используем http:// для localhost, чтобы избежать SSL‑предупреждений)
    let baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
    
    // Для localhost всегда используем http://, даже если в NEXT_PUBLIC_SITE_URL указан https://
    if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
      baseUrl = baseUrl.replace(/^https:/, 'http:')
    }

    const returnUrl = `${baseUrl}/purchase/success?orderId=${purchase.id}`
    console.log('💳 [API] Создание платежа ЮКасса:', {
      amount: resource.priceKopecks,
      orderId: purchase.id,
      returnUrl,
    })

    const { paymentUrl, paymentId } = await createYooKassaPayment({
      amount: resource.priceKopecks,
      orderId: purchase.id,
      description: `Покупка гайда: ${resource.title}`,
      returnUrl,
    })

    console.log('✅ [API] Payment URL получен:', paymentUrl, paymentId)

    if (!paymentUrl) {
      console.error('❌ [API] Не удалось создать payment URL')
      
      // В development режиме используем test redirect для тестирования
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ [API] DEV MODE: Использую test redirect вместо реального платежа')
        const testUrl = `${returnUrl}&test=true`
        return NextResponse.json(
          { 
            success: true,
            orderId: purchase.id,
            paymentUrl: testUrl,
            redirect: true,
            isTest: true
          },
          { headers: corsHeaders }
        )
      }
      
      // Если не удалось создать платеж, удаляем заказ
      await supabase
        .from('menohub_resource_purchases')
        .delete()
        .eq('id', purchase.id)

      return NextResponse.json(
        { error: 'Ошибка при создании платежа. Проверьте ключи YooKassa в .env.local' },
        { status: 500, headers: corsHeaders }
      )
    }

    // Обновляем заказ с payment_id (если получили). Не критично при строгих RLS.
    if (paymentId) {
      try {
        await supabase
          .from('menohub_resource_purchases')
          .update({ yookassa_payment_id: paymentId })
          .eq('id', purchase.id)
      } catch (e) {
        console.warn('⚠️ [API] Не удалось записать yookassa_payment_id (политики RLS могут блокировать). Продолжаем.')
      }
    }

    const response = {
      success: true,
      orderId: purchase.id,
      paymentUrl,
      redirect: true,
    }

    console.log('✅ [API] Возвращаем ответ:', response)

    return NextResponse.json(response, { headers: corsHeaders })
  } catch (error: any) {
    console.error('❌ [API] Error in purchase API:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      cause: error?.cause,
    })
    const corsHeaders = getCorsHeaders(request)
    
    // В development режиме возвращаем детали ошибки для отладки
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error?.message || 'Внутренняя ошибка сервера'
      : 'Внутренняя ошибка сервера'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500, headers: corsHeaders }
    )
  }
}

/**
 * Создание платежа в ЮКасса
 * Создает платеж и возвращает ссылку для редиректа
 */
async function createYooKassaPayment(params: {
  amount: number
  orderId: string
  description: string
  returnUrl: string
}): Promise<{ paymentUrl: string | null; paymentId?: string | null }> {
  const shopId = process.env.YOOKASSA_SHOP_ID
  const secretKey = process.env.YOOKASSA_SECRET_KEY

  console.log('🔍 [YooKassa] Проверка переменных окружения:', {
    hasShopId: !!shopId,
    shopIdLength: shopId?.length || 0,
    shopIdPrefix: shopId?.substring(0, 10) || 'нет',
    hasSecretKey: !!secretKey,
    secretKeyLength: secretKey?.length || 0,
    secretKeyPrefix: secretKey?.substring(0, 10) || 'нет',
  })

  // Если нет ключей — возвращаем dev-редирект на страницу успеха,
  // чтобы не блокировать локальную разработку
  if (!shopId || !secretKey) {
    console.warn('⚠️ [YooKassa] Переменные окружения не заданы, использую dev redirect')
    return { paymentUrl: `${params.returnUrl}&test=true`, paymentId: null }
  }

  // Определяем режим (тестовая или production) по префиксу shop_id
  // Тестовые shop_id обычно начинаются с "test_" или имеют другой формат
  const isTestMode = shopId.includes('test') || process.env.NODE_ENV === 'development'
  console.log(`💳 [YooKassa] Режим: ${isTestMode ? 'ТЕСТОВАЯ' : 'PRODUCTION'}, Shop ID: ${shopId.substring(0, 10)}...`)

  const auth = Buffer.from(`${shopId}:${secretKey}`).toString('base64')
  const idempotenceKey = randomUUID()

  const payload = {
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
    metadata: {
      order_id: params.orderId,
      order_type: 'resource_purchase',
    },
    // Для тестовой ЮКассы важно убедиться, что все параметры корректны
    // Возврат на тот же URL, что и redirect
    receipt: undefined, // Не обязателен для тестового режима
  }

  console.log('💳 [YooKassa] Отправка запроса на создание платежа:', {
    url: 'https://api.yookassa.ru/v3/payments',
    amount: payload.amount.value,
    currency: payload.amount.currency,
    returnUrl: params.returnUrl,
  })

  const res = await fetch('https://api.yookassa.ru/v3/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotence-Key': idempotenceKey,
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify(payload),
  })

  const responseText = await res.text().catch(() => '')
  console.log('💳 [YooKassa] Ответ API:', {
    status: res.status,
    statusText: res.statusText,
    headers: Object.fromEntries(res.headers.entries()),
    responseLength: responseText.length,
    responsePreview: responseText.substring(0, 500),
  })

  if (!res.ok) {
    console.error('❌ [YooKassa] Ошибка создания платежа:', {
      status: res.status,
      statusText: res.statusText,
      response: responseText,
      shopIdPrefix: shopId.substring(0, 10),
      hasSecretKey: !!secretKey,
      payload: JSON.stringify(payload, null, 2),
    })
    return { paymentUrl: null }
  }

  let payment: any
  try {
    payment = JSON.parse(responseText)
  } catch (e) {
    console.error('❌ [YooKassa] Ошибка парсинга JSON ответа:', e, responseText)
    return { paymentUrl: null }
  }

  console.log('✅ [YooKassa] Успешный ответ от API:', {
    paymentId: payment?.id,
    status: payment?.status,
    paid: payment?.paid,
    confirmationType: payment?.confirmation?.type,
    confirmationUrl: payment?.confirmation?.confirmation_url,
    fullResponse: JSON.stringify(payment, null, 2),
  })

  const paymentUrl = payment?.confirmation?.confirmation_url || null
  const paymentId = payment?.id || null

  if (!paymentUrl) {
    console.error('❌ [YooKassa] confirmation_url отсутствует в ответе:', payment)
  }

  return { paymentUrl, paymentId }
}

