import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth/session'
import { createServiceRoleClient } from '@/lib/supabase/service-role-client'

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
    const session = await getServerSession()
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
    const { data: user, error: userError } = await supabase
      .from('menohub_users')
      .select('id, email, telegram_id')
      .eq('id', session.userId)
      .single()

    if (userError || !user) {
      console.error('❌ [Payment] User not found:', userError)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
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
