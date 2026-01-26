/**
 * Библиотека для работы с Telegram Channel API
 * Публикация сообщений в канал "Без |Паузы"
 */

interface TelegramChannelMessage {
  text: string
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2'
  disable_web_page_preview?: boolean
  disable_notification?: boolean
}

/**
 * Отправка сообщения в Telegram канал
 * @param channelUsername - Username канала (например, @bezpauzy_channel) или chat_id
 * @param message - Текст сообщения
 * @param options - Дополнительные опции
 */
export async function sendTelegramChannelMessage(
  channelUsername: string,
  message: string,
  options?: {
    parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2'
    disablePreview?: boolean
    disableNotification?: boolean
  }
): Promise<{ success: boolean; messageId?: number; error?: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN

  if (!botToken) {
    console.error('❌ [Telegram Channel] TELEGRAM_BOT_TOKEN не установлен')
    return { success: false, error: 'TELEGRAM_BOT_TOKEN не установлен' }
  }

  // Убеждаемся, что channelUsername начинается с @
  const channelId = channelUsername.startsWith('@') ? channelUsername : `@${channelUsername}`

  const payload: TelegramChannelMessage = {
    text: message,
    parse_mode: options?.parseMode || 'HTML',
    disable_web_page_preview: options?.disablePreview ?? false,
    disable_notification: options?.disableNotification ?? false,
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: channelId,
        ...payload,
      }),
    })

    const data = await response.json()

    if (!response.ok || !data.ok) {
      console.error('❌ [Telegram Channel] Ошибка отправки сообщения:', {
        status: response.status,
        error: data.description,
        channelId,
        data,
      })
      return { success: false, error: data.description || 'Ошибка отправки сообщения' }
    }

    console.log('✅ [Telegram Channel] Сообщение отправлено:', {
      channelId,
      messageId: data.result.message_id,
    })

    return { success: true, messageId: data.result.message_id }
  } catch (error: any) {
    console.error('❌ [Telegram Channel] Ошибка при отправке сообщения:', error)
    return { success: false, error: error.message || 'Неизвестная ошибка' }
  }
}

/**
 * Отправка фото с подписью в канал
 */
export async function sendTelegramChannelPhoto(
  channelUsername: string,
  photoUrl: string,
  caption: string,
  options?: {
    parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2'
    disableNotification?: boolean
  }
): Promise<{ success: boolean; messageId?: number; error?: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN

  if (!botToken) {
    console.error('❌ [Telegram Channel] TELEGRAM_BOT_TOKEN не установлен')
    return { success: false, error: 'TELEGRAM_BOT_TOKEN не установлен' }
  }

  const channelId = channelUsername.startsWith('@') ? channelUsername : `@${channelUsername}`

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: channelId,
        photo: photoUrl,
        caption,
        parse_mode: options?.parseMode || 'HTML',
        disable_notification: options?.disableNotification ?? false,
      }),
    })

    const data = await response.json()

    if (!response.ok || !data.ok) {
      console.error('❌ [Telegram Channel] Ошибка отправки фото:', {
        status: response.status,
        error: data.description,
        channelId,
        data,
      })
      return { success: false, error: data.description || 'Ошибка отправки фото' }
    }

    console.log('✅ [Telegram Channel] Фото отправлено:', {
      channelId,
      messageId: data.result.message_id,
    })

    return { success: true, messageId: data.result.message_id }
  } catch (error: any) {
    console.error('❌ [Telegram Channel] Ошибка при отправке фото:', error)
    return { success: false, error: error.message || 'Неизвестная ошибка' }
  }
}

