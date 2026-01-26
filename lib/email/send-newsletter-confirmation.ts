import { Resend } from 'resend'
import { logger } from '@/lib/logger'

// Ленивая инициализация Resend (только если API ключ установлен)
let resend: Resend | null = null

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

interface NewsletterConfirmationEmailProps {
  email: string
  name?: string
  unsubscribeToken?: string
}

/**
 * Отправка email подтверждения подписки на рассылку
 */
export async function sendNewsletterConfirmation({
  email,
  name,
  unsubscribeToken,
}: NewsletterConfirmationEmailProps): Promise<{ success: boolean; error?: string }> {
  logger.debug('📧 [Email] Попытка отправить newsletter confirmation:', { email, name })
  
  const resendClient = getResendClient()
  if (!resendClient) {
    if (process.env.NODE_ENV === 'development') {
      logger.debug('📧 [DEV] Newsletter confirmation email would be sent to:', email)
      return { success: true }
    }
    logger.error('[Email] RESEND_API_KEY не установлен')
    logger.error('[Email] Проверьте .env.local файл')
    return { success: false, error: 'Email service is not configured' }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.ru'
  const unsubscribeUrl = unsubscribeToken
    ? `${siteUrl}/newsletter/unsubscribe?token=${unsubscribeToken}`
    : `${siteUrl}/newsletter/unsubscribe?email=${encodeURIComponent(email)}`

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Без |Паузы <noreply@bezpauzy.ru>'
  logger.debug('📧 [Email] Отправка с адреса:', fromEmail)

  try {
    const { data, error } = await resendClient.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Добро пожаловать в рассылку Без |Паузы! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Подтверждение подписки</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f7;">
            <table role="presentation" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 40px 20px; text-align: center;">
                  <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #8B7FD6 0%, #7DD3E0 100%); padding: 40px 20px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                          Добро пожаловать! 🎉
                        </h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <p style="margin: 0 0 20px 0; color: #3D4461; font-size: 16px; line-height: 1.6;">
                          ${name ? `Здравствуйте, ${name}!` : 'Здравствуйте!'}
                        </p>
                        
                        <p style="margin: 0 0 20px 0; color: #3D4461; font-size: 16px; line-height: 1.6;">
                          Спасибо за подписку на рассылку <strong>Без |Паузы</strong>!
                        </p>
                        
                        <p style="margin: 0 0 20px 0; color: #3D4461; font-size: 16px; line-height: 1.6;">
                          Теперь вы будете получать:
                        </p>
                        
                        <ul style="margin: 0 0 30px 0; padding-left: 20px; color: #3D4461; font-size: 16px; line-height: 1.8;">
                          <li>Научно обоснованные статьи о менопаузе</li>
                          <li>Рекомендации от гинекологов, маммологов и нутрициологов</li>
                          <li>Новости о новых исследованиях</li>
                          <li>Практические советы для поддержания здоровья</li>
                        </ul>
                        
                        <p style="margin: 0 0 30px 0; color: #3D4461; font-size: 16px; line-height: 1.6;">
                          Мы будем отправлять вам письма раз в неделю с самыми важными и полезными материалами.
                        </p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                          <a href="${siteUrl}" style="display: inline-block; padding: 14px 32px; background-color: #8B7FD6; color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px;">
                            Перейти на сайт
                          </a>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 30px; background-color: #E8E5F2; text-align: center; border-top: 1px solid #e0e0e0;">
                        <p style="margin: 0 0 10px 0; color: #3D4461; font-size: 14px; line-height: 1.6;">
                          Если вы не подписывались на эту рассылку, просто проигнорируйте это письмо.
                        </p>
                        <p style="margin: 0; color: #3D4461; font-size: 12px; line-height: 1.6;">
                          <a href="${unsubscribeUrl}" style="color: #8B7FD6; text-decoration: underline;">
                            Отписаться от рассылки
                          </a>
                        </p>
                        <p style="margin: 10px 0 0 0; color: #3D4461; font-size: 12px; line-height: 1.6;">
                          © ${new Date().getFullYear()} Без |Паузы. Все права защищены.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
      text: `
Добро пожаловать в рассылку Без |Паузы!

${name ? `Здравствуйте, ${name}!` : 'Здравствуйте!'}

Спасибо за подписку! Теперь вы будете получать:
- Научно обоснованные статьи о менопаузе
- Рекомендации от врачей
- Новости о новых исследованиях
- Практические советы

Мы будем отправлять вам письма раз в неделю.

Перейти на сайт: ${siteUrl}

Отписаться: ${unsubscribeUrl}

© ${new Date().getFullYear()} Без |Паузы. Все права защищены.
      `.trim(),
    })

    if (error) {
      logger.error('[Email] Ошибка Resend API при отправке newsletter confirmation:', error)
      logger.error('[Email] Детали ошибки:', JSON.stringify(error, null, 2))
      return { success: false, error: error.message }
    }

    logger.debug('✅ [Email] Newsletter confirmation успешно отправлен на:', email)
    logger.debug('✅ [Email] ID письма в Resend:', data?.id)
    return { success: true }
  } catch (error: any) {
    logger.error('[Email] Неожиданная ошибка при отправке newsletter confirmation:', error)
    logger.error('[Email] Stack trace:', error.stack)
    return { success: false, error: error.message || 'Failed to send email' }
  }
}

