/**
 * Библиотека для отправки email рассылок
 * Использует Resend для отправки транзакционных писем
 */

import { Resend } from 'resend'
import { createServiceRoleClient } from '@/lib/supabase/server'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

interface NewsletterEmailOptions {
  subject: string
  htmlContent: string
  textContent?: string
  fromEmail?: string
  fromName?: string
}

/**
 * Отправка email рассылки всем активным подписчикам
 */
export async function sendNewsletterEmail(
  options: NewsletterEmailOptions
): Promise<{ success: boolean; sent: number; failed: number; errors?: string[] }> {
  if (!resend) {
    console.error('❌ [Email] RESEND_API_KEY не установлен')
    return { success: false, sent: 0, failed: 0, errors: ['RESEND_API_KEY не установлен'] }
  }

  const supabase = createServiceRoleClient()

  // Получаем всех активных подписчиков
  const { data: subscribers, error } = await supabase
    .from('menohub_newsletter_subscribers')
    .select('email, name')
    .eq('status', 'active')

  if (error || !subscribers || subscribers.length === 0) {
    console.error('❌ [Email] Ошибка получения подписчиков:', error)
    return { success: false, sent: 0, failed: 0, errors: [error?.message || 'Нет подписчиков'] }
  }

  const fromEmail = options.fromEmail || process.env.RESEND_FROM_EMAIL || 'noreply@bezpauzy.ru'
  const fromName = options.fromName || 'Без |Паузы'

  let sent = 0
  let failed = 0
  const errors: string[] = []

  // Отправляем письма каждому подписчику отдельно
  // Resend не поддерживает массовую рассылку в одном запросе
  for (const subscriber of subscribers) {
    try {
      const { data, error: sendError } = await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: subscriber.email,
        subject: options.subject,
        html: options.htmlContent,
        text: options.textContent || options.htmlContent.replace(/<[^>]*>/g, ''),
      })

      if (sendError) {
        console.error(`❌ [Email] Ошибка отправки для ${subscriber.email}:`, sendError)
        failed++
        errors.push(`${subscriber.email}: ${sendError.message}`)
      } else {
        sent++
        if (sent % 10 === 0) {
          console.log(`✅ [Email] Отправлено: ${sent}/${subscribers.length}`)
        }
      }
    } catch (err: any) {
      console.error(`❌ [Email] Ошибка при отправке для ${subscriber.email}:`, err)
      failed++
      errors.push(`${subscriber.email}: ${err.message}`)
    }

    // Небольшая задержка между отправками, чтобы не превысить rate limits
    if (sent % 10 === 0 && sent < subscribers.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  return {
    success: failed === 0,
    sent,
    failed,
    errors: errors.length > 0 ? errors : undefined,
  }
}

/**
 * Отправка email одному получателю (для тестирования)
 */
export async function sendTestEmail(
  to: string,
  options: NewsletterEmailOptions
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.error('❌ [Email] RESEND_API_KEY не установлен')
    return { success: false, error: 'RESEND_API_KEY не установлен' }
  }

  const fromEmail = options.fromEmail || process.env.RESEND_FROM_EMAIL || 'noreply@bezpauzy.ru'
  const fromName = options.fromName || 'Без |Паузы'

  try {
    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to,
      subject: options.subject,
      html: options.htmlContent,
      text: options.textContent || options.htmlContent.replace(/<[^>]*>/g, ''),
    })

    if (error) {
      console.error('❌ [Email] Ошибка отправки тестового письма:', error)
      return { success: false, error: error.message }
    }

    console.log('✅ [Email] Тестовое письмо отправлено:', data?.id)
    return { success: true }
  } catch (err: any) {
    console.error('❌ [Email] Ошибка при отправке тестового письма:', err)
    return { success: false, error: err.message }
  }
}

