import { Resend } from 'resend'
import { logger } from '@/lib/logger'

// Ленивая инициализация Resend
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

interface PurchaseItem {
  type: 'book' | 'resource'
  title: string
  downloadToken: string
  downloadUrl: string
  expiresAt: string
}

interface SendPurchaseConfirmationParams {
  email: string
  name: string
  items: PurchaseItem[]
  orderId?: string
}

interface SendPurchaseConfirmationResult {
  success: boolean
  error?: string
  warning?: string
}

/**
 * Отправка email с подтверждением покупки и ссылками на скачивание
 */
export async function sendPurchaseConfirmation({
  email,
  name,
  items,
  orderId,
}: SendPurchaseConfirmationParams): Promise<SendPurchaseConfirmationResult> {
  const resendClient = getResendClient()
  if (!resendClient) {
    logger.error('[Email] RESEND_API_KEY is not configured')
    logger.error('[Email] Please set RESEND_API_KEY and RESEND_FROM_EMAIL in .env.local')
    if (process.env.NODE_ENV === 'development') {
      logger.debug('📧 [DEV] Purchase confirmation email would be sent to:', email)
      logger.debug('📧 [DEV] Items:', items.map(i => i.title).join(', '))
      logger.warn('⚠️ [DEV] ВНИМАНИЕ: Письмо НЕ было отправлено! В production это приведет к ошибке.')
      // В dev режиме возвращаем success: true, но с предупреждением
      // Это позволяет тестировать без реальной отправки
      return { success: true, warning: 'Email service not configured (development mode)' }
    }
    return { success: false, error: 'Email service is not configured' }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.ru'

  // Форматируем дату окончания срока действия ссылки
  const formatExpiresAt = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return '30 дней'
    }
  }

  // Формируем список товаров для письма
  const itemsHtml = items
    .map((item) => {
      const expiresAtFormatted = formatExpiresAt(item.expiresAt)
      return `
        <div style="background-color: #f9f9f9; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 12px 0; color: #3D4461; font-size: 18px; font-weight: 600;">
            ${item.title}
          </h3>
          <p style="margin: 0 0 16px 0; color: #3D4461; font-size: 14px; line-height: 1.6;">
            Ссылка действительна до: <strong>${expiresAtFormatted}</strong><br>
            Лимит скачиваний: <strong>3 раза</strong>
          </p>
          <div style="text-align: center;">
            <a href="${item.downloadUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #8B7FD6 0%, #7DD3E0 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px;">
              Скачать ${item.type === 'book' ? 'книгу' : 'гайд'}
            </a>
          </div>
        </div>
      `
    })
    .join('')

  const itemsText = items
    .map((item) => {
      const expiresAtFormatted = formatExpiresAt(item.expiresAt)
      return `
${item.title}
Ссылка: ${item.downloadUrl}
Срок действия: ${expiresAtFormatted}
Лимит скачиваний: 3 раза
      `.trim()
    })
    .join('\n\n')

  console.log('📧 [Email] Отправка письма с подтверждением покупки:', {
    email,
    name,
    itemsCount: items.length,
    orderId,
  })

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Без |Паузы <noreply@bezpauzy.ru>'
    logger.debug('📧 [Email] Отправка с адреса:', fromEmail)
    logger.debug('📧 [Email] Получатель:', email)
    logger.debug('📧 [Email] RESEND_FROM_EMAIL из env:', process.env.RESEND_FROM_EMAIL)
    
    // Проверяем, что fromEmail содержит правильный домен
    if (fromEmail.includes('yandex.com')) {
      logger.error('[Email] ОШИБКА: В RESEND_FROM_EMAIL используется yandex.com!')
      logger.error('[Email] Используйте email с домена bezpauzy.ru')
      return { success: false, error: 'RESEND_FROM_EMAIL должен использовать домен bezpauzy.ru, а не yandex.com' }
    }
    
    const { data, error } = await resendClient.emails.send({
      from: fromEmail,
      to: email,
      subject: `Ваш заказ принят! Ссылки на скачивание ${items.length > 1 ? `(${items.length} товаров)` : ''}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Подтверждение покупки</title>
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
                          Спасибо за покупку! 🎉
                        </h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <p style="margin: 0 0 20px 0; color: #3D4461; font-size: 16px; line-height: 1.6;">
                          Здравствуйте, ${name}!
                        </p>
                        
                        <p style="margin: 0 0 20px 0; color: #3D4461; font-size: 16px; line-height: 1.6;">
                          Ваш заказ успешно оплачен.${orderId ? ` Номер заказа: <strong>#${orderId}</strong>` : ''}
                        </p>

                        <p style="margin: 0 0 30px 0; color: #3D4461; font-size: 16px; line-height: 1.6;">
                          Ниже вы найдете ссылки для скачивания ваших товаров:
                        </p>

                        ${itemsHtml}

                        <div style="background-color: #FFF3CD; border-left: 4px solid #FFC107; padding: 16px; margin: 30px 0; border-radius: 8px;">
                          <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                            <strong>Важно:</strong> Ссылки действительны 30 дней. Каждый файл можно скачать до 3 раз. 
                            Рекомендуем сохранить файлы на ваше устройство сразу после получения.
                          </p>
                        </div>

                        <div style="text-align: center; margin: 30px 0;">
                          <a href="${siteUrl}" style="display: inline-block; padding: 14px 32px; background-color: #E8E5F2; color: #8B7FD6; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px;">
                            Перейти на сайт
                          </a>
                        </div>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 30px; background-color: #E8E5F2; text-align: center; border-top: 1px solid #e0e0e0;">
                        <p style="margin: 0 0 10px 0; color: #3D4461; font-size: 14px; line-height: 1.6;">
                          Если у вас возникли вопросы, напишите нам на{' '}
                          <a href="mailto:bez-pauzy@yandex.com" style="color: #8B7FD6; text-decoration: underline;">
                            bez-pauzy@yandex.com
                          </a>
                        </p>
                        <p style="margin: 0; color: #3D4461; font-size: 12px; line-height: 1.6;">
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
Спасибо за покупку!

Здравствуйте, ${name}!

Ваш заказ успешно оплачен.${orderId ? ` Номер заказа: #${orderId}` : ''}

Ниже вы найдете ссылки для скачивания ваших товаров:

${itemsText}

Важно: Ссылки действительны 30 дней. Каждый файл можно скачать до 3 раз. Рекомендуем сохранить файлы на ваше устройство сразу после получения.

Перейти на сайт: ${siteUrl}

Если у вас возникли вопросы, напишите нам на bez-pauzy@yandex.com

© ${new Date().getFullYear()} Без |Паузы. Все права защищены.
      `.trim(),
    })

    if (error) {
      logger.error('[Email] Ошибка отправки письма:', error)
      logger.error('[Email] Детали ошибки:', JSON.stringify(error, null, 2))
      return { success: false, error: error.message || 'Failed to send email' }
    }

    logger.debug('✅ [Email] Письмо успешно отправлено на:', email)
    logger.debug('✅ [Email] ID письма в Resend:', data?.id)
    return { success: true }
  } catch (error: any) {
    logger.error('[Email] Неожиданная ошибка при отправке письма:', error)
    logger.error('[Email] Stack trace:', error.stack)
    return { success: false, error: error.message || 'Failed to send email' }
  }
}
