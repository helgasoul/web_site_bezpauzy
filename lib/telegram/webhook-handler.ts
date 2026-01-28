/**
 * Обработчик Telegram Webhook событий
 * 
 * Этот файл обрабатывает все события от Telegram Bot API:
 * - message (обычные сообщения)
 * - callback_query (нажатия кнопок)
 * - edited_message (редактированные сообщения)
 * 
 * Маршрутизирует события к соответствующим обработчикам
 */

import { handleMessage } from './message-handler'
import { handleCallbackQuery } from './callbacks'
import { handleCommand } from './commands'

export interface TelegramWebhookUpdate {
  update_id: number
  message?: {
    message_id: number
    from: {
      id: number
      is_bot: boolean
      first_name: string
      username?: string
    }
    chat: {
      id: number
      type: 'private' | 'group' | 'supergroup' | 'channel'
    }
    date: number
    text?: string
    entities?: Array<{
      type: string
      offset: number
      length: number
    }>
  }
  callback_query?: {
    id: string
    from: {
      id: number
      is_bot: boolean
      first_name: string
      username?: string
    }
    message?: {
      message_id: number
      chat: {
        id: number
      }
      text?: string
    }
    data: string
  }
  edited_message?: {
    message_id: number
    from: {
      id: number
    }
    chat: {
      id: number
    }
    text?: string
  }
}

/**
 * Главный обработчик webhook событий
 * Определяет тип события и маршрутизирует к соответствующему обработчику
 */
export async function handleTelegramWebhook(update: TelegramWebhookUpdate): Promise<void> {
  try {
    // Обработка callback_query (нажатия кнопок)
    if (update.callback_query) {
      await handleCallbackQuery(update.callback_query)
      return
    }

    // Обработка обычных сообщений
    if (update.message) {
      const message = update.message
      
      // Проверяем, является ли сообщение командой
      if (message.text && message.text.startsWith('/')) {
        const command = message.text.split(' ')[0].substring(1) // Убираем '/'
        await handleCommand(command, message)
        return
      }

      // Обычное текстовое сообщение
      if (message.text) {
        await handleMessage(message)
        return
      }
    }

    // Обработка отредактированных сообщений (опционально)
    if (update.edited_message) {
      // Можно обработать как обычное сообщение или игнорировать
      console.log('📝 [Telegram] Edited message received:', update.edited_message.message_id)
    }

    // Если событие не распознано, логируем
    console.log('⚠️ [Telegram] Unhandled update type:', Object.keys(update))
  } catch (error) {
    console.error('❌ [Telegram Webhook Handler] Error processing update:', error)
    // Не пробрасываем ошибку дальше, чтобы не прерывать работу webhook
  }
}
