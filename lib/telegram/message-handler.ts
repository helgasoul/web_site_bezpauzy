/**
 * Обработчик обычных текстовых сообщений из Telegram
 * 
 * Этот файл обрабатывает сообщения от пользователей в Telegram боте.
 * Сообщения сохраняются в menohub_queries и обрабатываются через единую систему.
 */

import { createClient } from '@/lib/supabase/server'
import { sendTelegramBotMessage } from './bot'
import { processMessage } from '@/lib/ai/message-processor'

interface TelegramMessage {
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
}

/**
 * Обработка обычного текстового сообщения из Telegram
 */
export async function handleMessage(message: TelegramMessage): Promise<void> {
  const chatId = message.chat.id
  const userId = message.from.id
  const messageText = message.text

  if (!messageText) {
    // Игнорируем сообщения без текста (фото, стикеры и т.д.)
    // Можно добавить обработку медиа в будущем
    return
  }

  const supabase = await createClient()

  // Находим пользователя по telegram_id
  const { data: user, error: userError } = await supabase
    .from('menohub_users')
    .select('id, telegram_id, subscription_status')
    .eq('telegram_id', userId)
    .single()

  if (userError || !user) {
    // Пользователь не найден - отправляем приглашение зарегистрироваться
    await sendTelegramBotMessage(
      chatId,
      '👋 Добро пожаловать! Для начала работы используйте команду /start'
    )
    return
  }

  // Проверяем подписку
  if (user.subscription_status !== 'active') {
    await sendTelegramBotMessage(
      chatId,
      '❌ Для общения с Евой необходима активная подписка.\n\nИспользуйте /start для получения информации о подписках.'
    )
    return
  }

  // Отправляем индикатор "печатает..."
  // Это улучшает UX, показывая, что бот обрабатывает запрос
  try {
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendChatAction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        action: 'typing',
      }),
    })
  } catch (e) {
    // Игнорируем ошибки отправки typing статуса
  }

  // Сохраняем запрос в БД
  const { data: queryRecord, error: queryError } = await supabase
    .from('menohub_queries')
    .insert({
      user_id: user.id,
      query_text: messageText,
      query_status: 'processing',
      response_text: 'processing',
      source: 'telegram', // Указываем источник
      telegram_message_id: message.message_id, // Сохраняем ID сообщения в Telegram
    })
    .select()
    .single()

  if (queryError || !queryRecord) {
    console.error('❌ [Telegram] Error saving query:', queryError)
    await sendTelegramBotMessage(
      chatId,
      '❌ Произошла ошибка при сохранении вашего запроса. Пожалуйста, попробуйте еще раз.'
    )
    return
  }

  try {
    // Обрабатываем сообщение через единую систему
    // Эта функция будет создана в lib/ai/message-processor.ts
    const response = await processMessage({
      userId: user.id,
      message: messageText,
      source: 'telegram',
      queryId: queryRecord.id,
    })

    // Обновляем запрос с ответом
    await supabase
      .from('menohub_queries')
      .update({
        query_status: 'completed',
        response_text: response,
        updated_at: new Date().toISOString(),
      })
      .eq('id', queryRecord.id)

    // Отправляем ответ в Telegram
    await sendTelegramBotMessage(chatId, response, {
      parseMode: 'HTML',
    })
  } catch (error) {
    console.error('❌ [Telegram] Error processing message:', error)

    // Обновляем статус на ошибку
    await supabase
      .from('menohub_queries')
      .update({
        query_status: 'failed',
        response_text: 'Произошла ошибка при обработке запроса.',
      })
      .eq('id', queryRecord.id)

    await sendTelegramBotMessage(
      chatId,
      '❌ Произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте еще раз позже.'
    )
  }
}
