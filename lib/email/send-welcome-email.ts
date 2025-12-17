import { Resend } from 'resend'
import { render } from '@react-email/render'
import React from 'react'
import { WelcomeEmail } from './welcome-email'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

interface SendWelcomeEmailParams {
  to: string
  name: string
}

export async function sendWelcomeEmail({ to, name }: SendWelcomeEmailParams) {
  try {
    if (!resend || !process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not set, skipping email send')
      return { success: false, error: 'Email service not configured' }
    }

    const emailHtml = await render(React.createElement(WelcomeEmail, { name }))

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Без паузы <onboarding@resend.dev>',
      to: [to],
      subject: 'Добро пожаловать в сообщество «Без паузы»! 🎉',
      html: emailHtml,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error }
    }

    console.log('Welcome email sent successfully to:', to)
    return { success: true, data }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { success: false, error }
  }
}
