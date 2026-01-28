import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { createServiceRoleClient } from '@/lib/supabase/server'

const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bez-pauzy.ru'

interface CreateSubscriptionBody {
  planId: string
  amount: number
}

export async function POST(req: NextRequest) {
  try {
    // Проверяем аутентификацию
    const session = await getSession()
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Получаем данные из запроса
    const body: CreateSubscriptionBody = await req.json()
    const { planId, amount } = body

    if (!planId || !amount) {
      return NextResponse.json({ error: 'Missing planId or amount' }, { status: 400 })
    }

    // Валидация плана
    const validPlans = ['monthly', 'annual']
    if (!validPlans.includes(planId)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Проверяем переменные окружения
    if (!YOOKASSA_SHOP_ID || !YOOKASSA_SECRET_KEY) {
      console.error('❌ [Payment] YooKassa credentials not configured')
      return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 })
    }

    // Получаем данные пользователя
    const supabase = createServiceRoleClient()
    
    // Добавляем детальное логирование
    console.log('[Payment] Looking for user with userId:', session.userId)
    console.log('[Payment] Session data:', JSON.stringify(session))
    
    const { data: user, error: userError } = await supabase
      .from('menohub_users')
      .select('id, email, telegram_id, username')
      .eq('id', session.userId)
      .single()

    console.log('[Payment] User query result:', { user, error: userError })

    if (userError || !user) {
      console.error('❌ [Payment] User not found:', {
        userId: session.userId,
        error: userError,
        errorMessage: userError?.message,
        errorDetails: userError?.details
      })
      return NextResponse.json({ 
        error: 'User not found', 
        details: process.env.NODE_ENV === 'development' ? {
          userId: session.userId,
          errorMessage: userError?.message
        } : undefined
      }, { status: 404 })
    }

    }

    // Создаём уникальный идемпотентный ключ для предотвращения дублирующих платежей
    const idempotenceKey = crypto.randomUUID()

    // Формируем данные для создания платежа
    const paymentData = {
      amount: {
        value: amount.toFixed(2),
        currency: 'RUB',
      },
      confirmation: {
        type: 'redirect',
        return_url: `${SITE_URL}/payment/success`,
      },
      capture: true,
      description: planId === 'monthly' ? 'Месячная подписка на Еву' : 'Годовая подписка на Еву',
      metadata: {
        user_id: user.id.toString(),
        telegram_id: user.telegram_id?.toString() || '',
        plan_id: planId,
        email: user.email || '',
      },
    }

    // Создаём платёж в ЮКасса
    const authHeader = 'Basic ' + Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64')
    
    const yookassaResponse = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotence-Key': idempotenceKey,
        'Authorization': authHeader,
      },
      body: JSON.stringify(paymentData),
    })

    if (!yookassaResponse.ok) {
      const errorData = await yookassaResponse.text()
      console.error('❌ [Payment] YooKassa error:', errorData)
      return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
    }

    const paymentResponse = await yookassaResponse.json()
    
    console.log('✅ [Payment] Payment created:', {
      paymentId: paymentResponse.id,
      userId: user.id,
      planId,
      amount,
    })

    // Сохраняем информацию о платеже в базу данных (опционально)
    // Можно создать таблицу payments для отслеживания
    
    return NextResponse.json({
      success: true,
      paymentId: paymentResponse.id,
      confirmationUrl: paymentResponse.confirmation.confirmation_url,
    })
  } catch (error) {
    console.error('❌ [Payment] Error creating subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
