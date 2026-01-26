import { Resend } from 'resend'
import { render } from '@react-email/render'
import React from 'react'
import { WelcomeEmail } from './welcome-email'
import { logger } from '@/lib/logger'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

interface SendWelcomeEmailParams {
  to: string
  name: string
}

export async function sendWelcomeEmail({ to, name }: SendWelcomeEmailParams) {
  try {
    logger.debug('📧 [Email] Попытка отправить welcome email:', { to, name })
    
    if (!resend || !process.env.RESEND_API_KEY) {
      logger.error('[Email] RESEND_API_KEY не установлен')
      logger.error('[Email] Проверьте .env.local файл')
      return { success: false, error: 'Email service not configured' }
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'Без паузы <noreply@bezpauzy.ru>'
    logger.debug('📧 [Email] Отправка с адреса:', fromEmail)

    const emailHtml = await render(React.createElement(WelcomeEmail, { name }))
    logger.debug('📧 [Email] HTML письма сгенерирован, размер:', emailHtml.length, 'символов')

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: 'Добро пожаловать в сообщество «Без паузы»! 🎉',
      html: emailHtml,
    })

    if (error) {
      logger.error('[Email] Ошибка Resend API:', error)
      logger.error('[Email] Детали ошибки:', JSON.stringify(error, null, 2))
      return { success: false, error }
    }

    logger.debug('✅ [Email] Welcome email успешно отправлен на:', to)
    logger.debug('✅ [Email] ID письма в Resend:', data?.id)
    return { success: true, data }
  } catch (error: any) {
    logger.error('[Email] Неожиданная ошибка при отправке welcome email:', error)
    logger.error('[Email] Stack trace:', error.stack)
    return { success: false, error: error.message || 'Failed to send email' }
  }
}

