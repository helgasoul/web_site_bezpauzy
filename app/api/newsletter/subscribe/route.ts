import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { z } from 'zod'
import crypto from 'crypto'
import { sendNewsletterConfirmation } from '@/lib/email/send-newsletter-confirmation'

const subscribeSchema = z.object({
  email: z.string().email('Некорректный email адрес'),
  name: z.string().optional(),
  source: z.string().optional(),
})

// N8N webhook можно использовать как fallback (раскомментируйте в catch блоке при необходимости)
// const N8N_CONFIRMATION_WEBHOOK = 'https://puchkova.app.n8n.cloud/webhook/confirmation-email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Валидация данных
    const validationResult = subscribeSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, name, source } = validationResult.data
    const normalizedEmail = email.toLowerCase().trim()

    // Создаем клиент Supabase с service role для полного доступа
    const supabase = createServiceRoleClient()

    // Проверяем, не подписан ли уже этот email
    const { data: existingSubscriber, error: checkError } = await supabase
      .from('menohub_newsletter_subscribers')
      .select('id, status, confirmation_token')
      .eq('email', normalizedEmail)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 означает, что запись не найдена - это нормально
      return NextResponse.json(
        { error: 'Произошла ошибка при проверке подписки' },
        { status: 500 }
      )
    }

    // Если подписчик уже существует и активен
    if (existingSubscriber && existingSubscriber.status === 'active') {
      return NextResponse.json(
        { error: 'Этот email уже подписан на рассылку' },
        { status: 400 }
      )
    }

    // Если подписчик существует со статусом 'pending' - отправляем новое письмо
    if (existingSubscriber && existingSubscriber.status === 'pending') {
      // Генерируем новый токен подтверждения
      const confirmationToken = crypto.randomBytes(32).toString('hex')
      const now = new Date().toISOString()

      // Получаем или генерируем unsubscribe_token
      const { data: subscriberData } = await supabase
        .from('menohub_newsletter_subscribers')
        .select('unsubscribe_token')
        .eq('id', existingSubscriber.id)
        .single()

      let unsubscribeToken = subscriberData?.unsubscribe_token
      if (!unsubscribeToken) {
        unsubscribeToken = crypto.randomBytes(32).toString('hex')
      }

      const { error: updateError } = await supabase
        .from('menohub_newsletter_subscribers')
        .update({
          confirmation_token: confirmationToken,
          confirmation_sent_at: now,
          name: name || null,
          source: source || 'newsletter_page',
          unsubscribe_token: unsubscribeToken, // Сохраняем unsubscribe_token
        })
        .eq('id', existingSubscriber.id)

      if (updateError) {
        return NextResponse.json(
          { error: 'Произошла ошибка при обновлении подписки' },
          { status: 500 }
        )
      }

      // Отправляем письмо подтверждения через Resend
      try {
        const { logger } = await import('@/lib/logger')
        logger.debug('📧 [API] Отправка письма подтверждения подписки на:', normalizedEmail)
        const emailResult = await sendNewsletterConfirmation({
          email: normalizedEmail,
          name: name || undefined,
          unsubscribeToken: unsubscribeToken,
        })
        
        if (emailResult.success) {
          logger.debug('✅ [API] Письмо подтверждения успешно отправлено')
        } else {
          logger.error('[API] Не удалось отправить письмо подтверждения:', emailResult.error)
        }
      } catch (emailError) {
        const { logger } = await import('@/lib/logger')
        logger.error('[API] Исключение при отправке письма подтверждения через Resend:', emailError)
        // Если Resend не работает, можно использовать N8N как fallback (раскомментируйте при необходимости)
        // await fetch(N8N_CONFIRMATION_WEBHOOK, { ... })
      }

      return NextResponse.json({
        success: true,
        message: 'Проверьте почту для подтверждения подписки',
      })
    }

    // Генерируем токены
    const confirmationToken = crypto.randomBytes(32).toString('hex')
    const unsubscribeToken = crypto.randomBytes(32).toString('hex')
    const now = new Date().toISOString()

    // Если подписчик существует, но отписан - обновляем
    if (existingSubscriber) {
      const { error: updateError } = await supabase
        .from('menohub_newsletter_subscribers')
        .update({
          status: 'pending',
          name: name || null,
          source: source || 'newsletter_page',
          confirmation_token: confirmationToken,
          confirmation_sent_at: now,
          confirmed_at: null,
          subscribed_at: now,
          unsubscribed_at: null,
          unsubscribe_token: unsubscribeToken,
          welcome_email_sent: false,
        })
        .eq('id', existingSubscriber.id)

      if (updateError) {
        return NextResponse.json(
          { error: 'Произошла ошибка при обновлении подписки' },
          { status: 500 }
        )
      }
    } else {
      // Создаем новую подписку со статусом 'pending'
      const { error: insertError } = await supabase
        .from('menohub_newsletter_subscribers')
        .insert({
          email: normalizedEmail,
          name: name || null,
          source: source || 'newsletter_page',
          status: 'pending',
          confirmation_token: confirmationToken,
          confirmation_sent_at: now,
          subscribed_at: now,
          unsubscribe_token: unsubscribeToken,
        })

      if (insertError) {
        // Если это ошибка дублирования email
        if (insertError.code === '23505') {
          return NextResponse.json(
            { error: 'Этот email уже подписан на рассылку' },
            { status: 400 }
          )
        }

        return NextResponse.json(
          { error: 'Произошла ошибка при подписке. Попробуйте позже.' },
          { status: 500 }
        )
      }
    }

    // Отправляем письмо подтверждения через Resend
    try {
      console.log('📧 [API] Отправка письма подтверждения подписки на:', normalizedEmail)
      const emailResult = await sendNewsletterConfirmation({
        email: normalizedEmail,
        name: name || undefined,
        unsubscribeToken: unsubscribeToken, // Используем правильный unsubscribe_token
      })
      
      if (emailResult.success) {
        console.log('✅ [API] Письмо подтверждения успешно отправлено')
      } else {
        console.error('❌ [API] Не удалось отправить письмо подтверждения:', emailResult.error)
      }
    } catch (emailError) {
      console.error('❌ [API] Исключение при отправке письма подтверждения через Resend:', emailError)
      // Если Resend не работает, можно использовать N8N как fallback (раскомментируйте при необходимости)
      // await fetch(N8N_CONFIRMATION_WEBHOOK, { ... })
    }

    return NextResponse.json({
      success: true,
      message: 'Проверьте почту для подтверждения подписки',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Произошла внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

