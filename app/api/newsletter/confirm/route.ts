import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/email/send-welcome-email'
import { logger } from '@/lib/logger'

// N8N webhook можно использовать как fallback (раскомментируйте в catch блоке при необходимости)
// const N8N_WELCOME_WEBHOOK = 'https://puchkova.app.n8n.cloud/webhook/welcome-email'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(new URL('/subscription-error', request.url))
    }

    const supabase = createServiceRoleClient()

    // Находим подписчика по токену подтверждения
    const { data: subscriber, error: findError } = await supabase
      .from('menohub_newsletter_subscribers')
      .select('id, email, name, status, confirmation_token')
      .eq('confirmation_token', token)
      .single()

    if (findError || !subscriber) {
      return NextResponse.redirect(new URL('/subscription-error', request.url))
    }

    // Если уже подтвержден - редиректим на страницу успеха
    if (subscriber.status === 'active' && subscriber.confirmation_token === null) {
      return NextResponse.redirect(new URL('/subscription-confirmed', request.url))
    }

    // Обновляем статус на 'active' и сохраняем время подтверждения
    const now = new Date().toISOString()
    const { error: updateError } = await supabase
      .from('menohub_newsletter_subscribers')
      .update({
        status: 'active',
        confirmed_at: now,
        confirmation_token: null, // Очищаем токен после подтверждения
      })
      .eq('id', subscriber.id)

    if (updateError) {
      return NextResponse.redirect(new URL('/subscription-error', request.url))
    }

    // Отправляем приветственное письмо через Resend
    try {
      logger.debug('📧 [API] Отправка welcome email на:', subscriber.email)
      const emailResult = await sendWelcomeEmail({
        to: subscriber.email,
        name: subscriber.name || 'Дорогой подписчик',
      })

      if (emailResult.success) {
        logger.debug('✅ [API] Welcome email успешно отправлен')
        // Обновляем флаг отправки приветственного письма
        await supabase
          .from('menohub_newsletter_subscribers')
          .update({ welcome_email_sent: true })
          .eq('id', subscriber.id)
      } else {
        logger.error('[API] Не удалось отправить welcome email:', emailResult.error)
      }
    } catch (emailError) {
      logger.error('[API] Исключение при отправке приветственного письма через Resend:', emailError)
      // Если Resend не работает, можно использовать N8N как fallback (раскомментируйте при необходимости)
      // await fetch(N8N_WELCOME_WEBHOOK, { ... })
    }

    return NextResponse.redirect(new URL('/subscription-confirmed', request.url))
  } catch (error) {
    return NextResponse.redirect(new URL('/subscription-error', request.url))
  }
}
