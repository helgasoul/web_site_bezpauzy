import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendTelegramAdminMessage } from '@/lib/telegram/admin'
import { logger } from '@/lib/logger'

/**
 * API Route для создания обращения в поддержку
 * Сохраняет обращение в Supabase и отправляет уведомление в Telegram админ чат
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message, pageUrl } = body

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Пожалуйста, заполните все обязательные поля' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Пожалуйста, введите корректный email адрес' },
        { status: 400 }
      )
    }

    // Save to Supabase
    const supabase = await createClient()

    // Get user ID if logged in (try to find by email)
    let userId: number | null = null
    try {
      const { data: menohubUser } = await supabase
        .from('menohub_users')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle()
      
      if (menohubUser && menohubUser.id) {
        userId = typeof menohubUser.id === 'string' ? parseInt(menohubUser.id, 10) : menohubUser.id
      }
    } catch (error) {
      // User might not exist or not logged in, continue without user_id
      logger.warn('⚠️ [Support Request] Не удалось получить user_id:', error)
    }
    const { data: supportRequest, error: dbError } = await supabase
      .from('menohub_support_requests')
      .insert({
        name,
        email: email.toLowerCase().trim(),
        phone: phone || null,
        subject: subject || null,
        message,
        user_id: userId || null,
        page_url: pageUrl || null,
        status: 'new',
      })
      .select()
      .single()

    if (dbError) {
      logger.error('[Support Request] Ошибка сохранения в БД:', dbError)
      return NextResponse.json(
        { error: 'Произошла ошибка при сохранении обращения' },
        { status: 500 }
      )
    }

    // Format message for Telegram
    const telegramMessage = `
🆘 <b>Новое обращение в поддержку</b>

<b>Имя:</b> ${name}
<b>Email:</b> ${email}
${phone ? `<b>Телефон:</b> ${phone}` : ''}
${subject ? `<b>Тема:</b> ${subject}` : ''}

<b>Сообщение:</b>
${message}

${pageUrl ? `<b>Страница:</b> ${pageUrl}` : ''}
${supportRequest.id ? `<b>ID обращения:</b> ${supportRequest.id}` : ''}
    `.trim()

    // Send to Telegram admin chat
    const telegramResult = await sendTelegramAdminMessage(telegramMessage, {
      parseMode: 'HTML',
    })

    // Update telegram_message_id if message was sent successfully
    if (telegramResult.success && telegramResult.messageId) {
      await supabase
        .from('menohub_support_requests')
        .update({ telegram_message_id: telegramResult.messageId })
        .eq('id', supportRequest.id)
    }

    if (!telegramResult.success) {
      logger.warn('⚠️ [Support Request] Не удалось отправить в Telegram:', telegramResult.error)
      // Don't fail the request if Telegram fails - the record is saved in DB
    }

    return NextResponse.json({
      success: true,
      id: supportRequest.id,
      message: 'Обращение успешно отправлено',
    })
  } catch (error: any) {
    logger.error('[Support Request] Ошибка:', error)
    return NextResponse.json(
      { error: error.message || 'Произошла ошибка при отправке обращения' },
      { status: 500 }
    )
  }
}
