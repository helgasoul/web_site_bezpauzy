/**
 * Библиотека для работы с Telegram Bot API
 * Отправка сообщений в бот "Без |Паузы" (ассистент Ева)
 */

interface TelegramBotMessage {
  text: string
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2'
  disable_web_page_preview?: boolean
  reply_markup?: {
    inline_keyboard?: Array<Array<{ text: string; url?: string; callback_data?: string }>>
  }
}

/**
 * Отправка сообщения в Telegram бот
 * @param chatId - ID чата (может быть ID пользователя или группы)
 * @param message - Текст сообщения
 * @param options - Дополнительные опции (кнопки, форматирование)
 */
export async function sendTelegramBotMessage(
  chatId: string | number,
  message: string,
  options?: {
    parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2'
    disablePreview?: boolean
    buttons?: Array<Array<{ text: string; url?: string; callbackData?: string }>>
  }
): Promise<{ success: boolean; messageId?: number; error?: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN

  if (!botToken) {
    console.error('❌ [Telegram Bot] TELEGRAM_BOT_TOKEN не установлен')
    return { success: false, error: 'TELEGRAM_BOT_TOKEN не установлен' }
  }

  const payload: TelegramBotMessage = {
    text: message,
    parse_mode: options?.parseMode || 'HTML',
    disable_web_page_preview: options?.disablePreview ?? false,
  }

  if (options?.buttons && options.buttons.length > 0) {
    payload.reply_markup = {
      inline_keyboard: options.buttons.map((row) =>
        row.map((btn) => ({
          text: btn.text,
          url: btn.url,
          callback_data: btn.callbackData,
        }))
      ),
    }
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        ...payload,
      }),
    })

    const data = await response.json()

    if (!response.ok || !data.ok) {
      console.error('❌ [Telegram Bot] Ошибка отправки сообщения:', {
        status: response.status,
        error: data.description,
        data,
      })
      return { success: false, error: data.description || 'Ошибка отправки сообщения' }
    }

    console.log('✅ [Telegram Bot] Сообщение отправлено:', {
      chatId,
      messageId: data.result.message_id,
    })

    return { success: true, messageId: data.result.message_id }
  } catch (error: any) {
    console.error('❌ [Telegram Bot] Ошибка при отправке сообщения:', error)
    return { success: false, error: error.message || 'Неизвестная ошибка' }
  }
}

/**
 * Отправка сообщения всем подписчикам бота (broadcast)
 * Требует получения списка пользователей из базы данных
 */
export async function broadcastToBotSubscribers(
  message: string,
  options?: {
    parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2'
    disablePreview?: boolean
    buttons?: Array<Array<{ text: string; url?: string; callbackData?: string }>>
  }
): Promise<{ success: boolean; sent: number; failed: number; errors?: string[] }> {
  // Эта функция должна получать список chat_id из базы данных
  // Пока возвращаем заглушку
  console.warn('⚠️ [Telegram Bot] broadcastToBotSubscribers требует реализации получения списка пользователей')
  return { success: false, sent: 0, failed: 0, errors: ['Функция не реализована'] }
}

