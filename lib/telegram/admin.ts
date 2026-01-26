/**
 * Библиотека для работы с Telegram Admin Chat API
 * Отправка сообщений в админ чат проекта
 */

import { sendTelegramBotMessage } from './bot'

/**
 * Отправка сообщения в админ чат проекта
 * @param message - Текст сообщения
 * @param options - Дополнительные опции
 */
export async function sendTelegramAdminMessage(
  message: string,
  options?: {
    parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2'
    disablePreview?: boolean
  }
): Promise<{ success: boolean; messageId?: number; error?: string }> {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID

  if (!adminChatId) {
    console.error('❌ [Telegram Admin] TELEGRAM_ADMIN_CHAT_ID не установлен')
    return { success: false, error: 'TELEGRAM_ADMIN_CHAT_ID не установлен' }
  }

  return sendTelegramBotMessage(adminChatId, message, {
    parseMode: options?.parseMode || 'HTML',
    disablePreview: options?.disablePreview ?? false,
  })
}
