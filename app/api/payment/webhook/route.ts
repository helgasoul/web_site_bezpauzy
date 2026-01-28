import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role-client'

const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY

interface YooKassaPayment {
  id: string
  status: 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled'
  paid: boolean
  amount: {
    value: string
    currency: string
  }
  metadata: {
    user_id: string
    telegram_id?: string
    plan_id: string
    email?: string
  }
  created_at: string
}

interface WebhookPayload {
  type: string
  event: 'payment.succeeded' | 'payment.canceled'
  object: YooKassaPayment
}

export async function POST(req: NextRequest) {
  try {
    // Получаем тело запроса
    const payload: WebhookPayload = await req.json()
    
    console.log('📨 [Webhook] Received:', {
      type: payload.type,
      event: payload.event,
      paymentId: payload.object?.id,
      status: payload.object?.status,
    })

    // Проверяем, что это событие успешной оплаты
    if (payload.event !== 'payment.succeeded' || payload.object.status !== 'succeeded') {
      console.log('ℹ️ [Webhook] Skipping non-success event')
      return NextResponse.json({ received: true })
    }

    const payment = payload.object
    const { user_id, plan_id } = payment.metadata

    if (!user_id || !plan_id) {
      console.error('❌ [Webhook] Missing user_id or plan_id in metadata')
      return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 })
    }

    // Определяем срок подписки
    const subscriptionDuration = plan_id === 'monthly' ? 30 : 365
    const subscriptionEnd = new Date()
    subscriptionEnd.setDate(subscriptionEnd.getDate() + subscriptionDuration)

    // Обновляем статус подписки пользователя
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from('menohub_users')
      .update({
        is_subscribed: true,
        subscription_status: 'active',
        subscription_plan: plan_id,
        payment_status: 'paid',
        subscription_end_date: subscriptionEnd.toISOString(),
        last_payment_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', parseInt(user_id))
      .select()
      .single()

    if (error) {
      console.error('❌ [Webhook] Error updating user subscription:', error)
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
    }

    console.log('✅ [Webhook] Subscription activated:', {
      userId: user_id,
      planId: plan_id,
      subscriptionEnd: subscriptionEnd.toISOString(),
    })

    // Опционально: можно сохранить информацию о платеже в отдельную таблицу payments
    // для учёта и статистики

    return NextResponse.json({ 
      received: true,
      subscription_activated: true 
    })
  } catch (error) {
    console.error('❌ [Webhook] Error processing webhook:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Отключаем верификацию body для webhook
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
