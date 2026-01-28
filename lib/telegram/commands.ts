/**
 * Обработка команд Telegram бота
 * 
 * Команды из n8n workflow:
 * - /start - приветствие и согласие на обработку данных
 * - /export_my_data - экспорт данных пользователя
 * - /delete_my_data - удаление всех данных пользователя
 * - /cancel_subscription - отмена подписки
 * - /history - история запросов пользователя
 */

import { createClient } from '@/lib/supabase/server'
import { sendTelegramBotMessage } from './bot'

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
 * Обработчик команд
 */
export async function handleCommand(
  command: string,
  message: TelegramMessage
): Promise<void> {
  const chatId = message.chat.id
  const userId = message.from.id

  switch (command.toLowerCase()) {
    case 'start':
      await handleStartCommand(chatId, userId, message.text)
      break

    case 'export_my_data':
      await handleExportDataCommand(chatId, userId)
      break

    case 'delete_my_data':
      await handleDeleteDataCommand(chatId, userId)
      break

    case 'cancel_subscription':
      await handleCancelSubscriptionCommand(chatId, userId)
      break

    case 'history':
      await handleHistoryCommand(chatId, userId)
      break

    default:
      await sendTelegramBotMessage(chatId, 'Неизвестная команда. Используйте /start для начала работы.')
  }
}

/**
 * Обработка команды /start
 * Отправляет приветствие и запрашивает согласие на обработку данных
 */
async function handleStartCommand(
  chatId: number,
  userId: number,
  startParam?: string
): Promise<void> {
  const consentMessage = `👋 Добро пожаловать в "Без |Паузы"!

📋 СОГЛАСИЕ НА ОБРАБОТКУ ПЕРСОНАЛЬНЫХ ДАННЫХ

Для работы бота необходимо ваше согласие на обработку данных согласно ФЗ-152.

Что мы обрабатываем:
- Telegram ID и username
- Текст ваших запросов и ответов
- Возрастная группа 
- Данные о подписке (через ЮKassa)
- История запросов

Мы НЕ собираем:
❌ Email, телефон, имя, фамилию, паспортные данные, ИНН

Где хранятся данные:
🇷🇺 Россия (Beget) — основное хранение

Ваши права:
✅ Получить копию данных: /export_my_data
✅ Удалить все данные: /delete_my_data
✅ Отменить подписку: /cancel_subscription

📖 Полная версия документа:
https://docs.google.com/document/d/1fStbtSHh-prCmIEPR4mdcbk-g-LpahB8k2nyDLdizIc/edit?usp=sharing 

Нажимая "Согласен", вы подтверждаете, что:
- Прочитали условия обработки данных
- Понимаете цели и способы обработки
- Достигли возраста 18 лет

Согласие можно отозвать в любой момент через команду /delete_my_data или написав на my@bez-pauzy.ru`

  await sendTelegramBotMessage(chatId, consentMessage, {
    buttons: [
      [
        { text: 'Согласен', callbackData: 'consent_agree' },
        { text: 'Отказаться', callbackData: 'consent_decline' },
      ],
    ],
  })

  // Обработка start параметра (если есть)
  // Например, если пользователь перешел по ссылке с сайта
  if (startParam) {
    // Можно сохранить источник перехода
    console.log('🔗 [Telegram] Start parameter:', startParam)
  }
}

/**
 * Обработка команды /export_my_data
 * Экспортирует все данные пользователя в текстовый файл
 */
async function handleExportDataCommand(
  chatId: number,
  userId: number
): Promise<void> {
  const supabase = await createClient()

  // Получаем данные пользователя
  const { data: user, error: userError } = await supabase
    .from('menohub_users')
    .select('*')
    .eq('telegram_id', userId)
    .single()

  if (userError || !user) {
    await sendTelegramBotMessage(
      chatId,
      'Пользователь не найден. Используйте /start для регистрации.'
    )
    return
  }

  // Получаем историю запросов
  const { data: queries } = await supabase
    .from('menohub_queries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Формируем текст для экспорта
  let exportText = `Экспорт данных пользователя\n`
  exportText += `Дата экспорта: ${new Date().toLocaleString('ru-RU')}\n`
  exportText += `\n=== ДАННЫЕ ПОЛЬЗОВАТЕЛЯ ===\n`
  exportText += `Telegram ID: ${user.telegram_id}\n`
  exportText += `Дата регистрации: ${user.created_at}\n`
  exportText += `Статус подписки: ${user.subscription_status || 'нет'}\n`
  exportText += `Возрастная группа: ${user.age_group || 'не указана'}\n`
  exportText += `Город: ${user.city || 'не указан'}\n`

  if (queries && queries.length > 0) {
    exportText += `\n=== ИСТОРИЯ ЗАПРОСОВ (${queries.length}) ===\n\n`
    queries.forEach((query, index) => {
      exportText += `Запрос #${index + 1}\n`
      exportText += `Дата: ${new Date(query.created_at).toLocaleString('ru-RU')}\n`
      exportText += `Вопрос: ${query.query_text}\n`
      exportText += `Ответ: ${query.response_text}\n`
      exportText += `Статус: ${query.query_status}\n`
      exportText += `------------------------\n\n`
    })
  } else {
    exportText += `\n=== ИСТОРИЯ ЗАПРОСОВ ===\n`
    exportText += `Запросов пока нет.\n`
  }

  // Отправляем как документ
  // TODO: Реализовать отправку файла через Telegram Bot API
  // Пока отправляем как текст (если текст не слишком длинный)
  if (exportText.length < 4000) {
    await sendTelegramBotMessage(chatId, exportText)
  } else {
    // Если текст длинный, нужно отправить как файл
    // Это требует дополнительной реализации
    await sendTelegramBotMessage(
      chatId,
      'Ваши данные готовы к экспорту. Функция отправки файла будет реализована в ближайшее время.'
    )
    console.log('📄 [Telegram] Export data (too long for message):', exportText.substring(0, 500))
  }
}

/**
 * Обработка команды /delete_my_data
 * Удаляет все данные пользователя
 */
async function handleDeleteDataCommand(
  chatId: number,
  userId: number
): Promise<void> {
  const supabase = await createClient()

  // Получаем пользователя
  const { data: user } = await supabase
    .from('menohub_users')
    .select('id')
    .eq('telegram_id', userId)
    .single()

  if (!user) {
    await sendTelegramBotMessage(
      chatId,
      'Пользователь не найден.'
    )
    return
  }

  // Удаляем все данные пользователя
  // ВАЖНО: Проверьте, что в Supabase настроены правильные каскадные удаления
  await supabase
    .from('menohub_queries')
    .delete()
    .eq('user_id', user.id)

  await supabase
    .from('menohub_users')
    .delete()
    .eq('id', user.id)

  await sendTelegramBotMessage(
    chatId,
    '✅ Все ваши данные удалены. Вы можете начать заново с команды /start.'
  )
}

/**
 * Обработка команды /cancel_subscription
 * Отменяет подписку пользователя
 */
async function handleCancelSubscriptionCommand(
  chatId: number,
  userId: number
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('menohub_users')
    .update({
      subscription_status: 'cancelled',
      subscription_cancelled_at: new Date().toISOString(),
    })
    .eq('telegram_id', userId)

  if (error) {
    await sendTelegramBotMessage(
      chatId,
      '❌ Произошла ошибка при отмене подписки. Пожалуйста, обратитесь в поддержку.'
    )
    return
  }

  await sendTelegramBotMessage(
    chatId,
    '✅ Ваша подписка отменена. Вы можете возобновить её в любое время.'
  )
}

/**
 * Обработка команды /history
 * Показывает историю последних запросов
 */
async function handleHistoryCommand(
  chatId: number,
  userId: number
): Promise<void> {
  const supabase = await createClient()

  // Получаем пользователя
  const { data: user } = await supabase
    .from('menohub_users')
    .select('id')
    .eq('telegram_id', userId)
    .single()

  if (!user) {
    await sendTelegramBotMessage(
      chatId,
      'Пользователь не найден. Используйте /start для регистрации.'
    )
    return
  }

  // Получаем последние 10 запросов
  const { data: queries } = await supabase
    .from('menohub_queries')
    .select('query_text, response_text, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  if (!queries || queries.length === 0) {
    await sendTelegramBotMessage(
      chatId,
      '📝 История запросов пуста. Начните общение с Евой!'
    )
    return
  }

  let historyText = `📝 История ваших запросов (последние ${queries.length}):\n\n`
  queries.forEach((query, index) => {
    historyText += `${index + 1}. ${new Date(query.created_at).toLocaleDateString('ru-RU')}\n`
    historyText += `   В: ${query.query_text.substring(0, 50)}${query.query_text.length > 50 ? '...' : ''}\n`
    historyText += `   О: ${query.response_text.substring(0, 50)}${query.response_text.length > 50 ? '...' : ''}\n\n`
  })

  // Если текст слишком длинный, отправляем частями
  if (historyText.length < 4000) {
    await sendTelegramBotMessage(chatId, historyText)
  } else {
    // Отправляем первые запросы
    const shortHistory = queries.slice(0, 5)
    let shortText = `📝 Последние 5 запросов:\n\n`
    shortText += shortHistory
      .map(
        (q, i) =>
          `${i + 1}. ${new Date(q.created_at).toLocaleDateString('ru-RU')}\n   ${q.query_text.substring(0, 40)}...`
      )
      .join('\n\n')
    await sendTelegramBotMessage(chatId, shortText)
  }
}
