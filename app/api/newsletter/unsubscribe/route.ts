import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const unsubscribeSchema = z.object({
  token: z.string().optional(),
  email: z.string().email().optional(),
}).refine(data => data.token || data.email, {
  message: 'Необходимо указать token или email',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Валидация данных
    const validationResult = unsubscribeSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const { token, email } = validationResult.data

    // Создаем клиент Supabase
    const supabase = await createClient()

    let query = supabase
      .from('menohub_newsletter_subscribers')
      .select('id, email, status')

    // Ищем подписчика по токену или email
    if (token) {
      query = query.eq('unsubscribe_token', token)
    } else if (email) {
      query = query.eq('email', email.toLowerCase().trim())
    }

    const { data: subscriber, error: findError } = await query.single()

    if (findError || !subscriber) {
      return NextResponse.json(
        { error: 'Подписчик не найден' },
        { status: 404 }
      )
    }

    // Если уже отписан
    if (subscriber.status === 'unsubscribed') {
      return NextResponse.json({
        success: true,
        message: 'Вы уже отписаны от рассылки',
        alreadyUnsubscribed: true,
      })
    }

    // Обновляем статус на отписан
    const { error: updateError } = await supabase
      .from('menohub_newsletter_subscribers')
      .update({
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('id', subscriber.id)

    if (updateError) {
      console.error('Error unsubscribing:', updateError)
      return NextResponse.json(
        { error: 'Произошла ошибка при отписке' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Вы успешно отписаны от рассылки',
    })
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Произошла внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

