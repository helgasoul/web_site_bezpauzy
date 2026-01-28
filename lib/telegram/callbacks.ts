/**
 * Обработка callback queries (нажатий кнопок) в Telegram боте
 *
 * Все callback_data из n8n workflow:
 * - consent_agree / consent_decline - согласие на обработку данных
 * - 40-45 / 46-50 / 50+ - выбор возраста
 * - free_topic_hot_flashes / free_topic_sleep / free_topic_mood / free_topic_weight - бесплатные темы
 * - doctor - спасибо после рекомендации врача
 * - pay / oplata - информация об оплате
 * - select_another_topic - задать еще вопрос
 * - Thank_you - все понятно, завершение
 * - listen_podcast - смотреть видео врачей
 */

import { createServiceRoleClient } from '@/lib/supabase/server'
import { sendTelegramBotMessage } from './bot'
import { getFreeTopicTemplate, getAfterTopicButtons } from './free-topic-templates'

export interface TelegramCallbackQuery {
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

/**
 * Главный обработчик callback queries
 */
export async function handleCallbackQuery(callbackQuery: TelegramCallbackQuery): Promise<void> {
  const chatId = callbackQuery.message?.chat.id
  const userId = callbackQuery.from.id
  const callbackData = callbackQuery.data

  if (!chatId) {
    console.error('❌ [Telegram Callbacks] No chat ID in callback query')
    return
  }

  // Отправляем подтверждение нажатия кнопки (убирает "часики" в Telegram)
  await answerCallbackQuery(callbackQuery.id)

  try {
    // Маршрутизация по callback_data
    switch (true) {
      // Согласие на обработку данных
      case callbackData === 'consent_agree':
        await handleConsentAgree(chatId, userId)
        break

      case callbackData === 'consent_decline':
        await handleConsentDecline(chatId, userId)
        break

      // Выбор возраста
      case callbackData === '40-45':
      case callbackData === '46-50':
      case callbackData === '50+':
        await handleAgeSelection(chatId, userId, callbackData as '40-45' | '46-50' | '50+')
        break

      // Бесплатные темы
      case callbackData === 'free_topic_hot_flashes':
        await handleFreeTopic(chatId, userId, 'hot_flashes')
        break

      case callbackData === 'free_topic_sleep':
        await handleFreeTopic(chatId, userId, 'sleep')
        break

      case callbackData === 'free_topic_mood':
        await handleFreeTopic(chatId, userId, 'mood')
        break

      case callbackData === 'free_topic_weight':
        await handleFreeTopic(chatId, userId, 'weight')
        break

      // Действия после ответа
      case callbackData === 'doctor':
        await handleDoctorThanks(chatId)
        break

      case callbackData === 'select_another_topic':
        await handleSelectAnotherTopic(chatId)
        break

      case callbackData === 'Thank_you':
        await handleThankYou(chatId)
        break

      // Оплата
      case callbackData === 'pay':
      case callbackData === 'oplata':
        await handlePaymentInfo(chatId)
        break

      // Видео врачей
      case callbackData === 'listen_podcast':
        await handleDoctorsVideos(chatId, userId)
        break

      // Выбор конкретного видео (формат: video_<uuid>)
      case callbackData.startsWith('video_'):
        const videoId = callbackData.replace('video_', '')
        await handleVideoSelection(chatId, userId, videoId)
        break

      default:
        console.warn('⚠️ [Telegram Callbacks] Unknown callback_data:', callbackData)
    }
  } catch (error) {
    console.error('❌ [Telegram Callbacks] Error handling callback:', error)
    await sendTelegramBotMessage(
      chatId,
      '❌ Произошла ошибка при обработке вашего действия. Пожалуйста, попробуйте еще раз.'
    )
  }
}

/**
 * Отправить подтверждение нажатия кнопки
 */
async function answerCallbackQuery(callbackQueryId: string, text?: string): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN

  if (!botToken) return

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text: text || undefined,
      }),
    })
  } catch (error) {
    console.error('❌ [Telegram] Error answering callback query:', error)
  }
}

/**
 * СОГЛАСИЕ НА ОБРАБОТКУ ДАННЫХ
 */
async function handleConsentAgree(chatId: number, userId: number): Promise<void> {
  const supabase = createServiceRoleClient()

  // Проверяем, существует ли пользователь
  const { data: existingUser } = await supabase
    .from('menohub_users')
    .select('id, telegram_id')
    .eq('telegram_id', userId)
    .single()

  if (!existingUser) {
    // Создаем нового пользователя
    const { error } = await supabase
      .from('menohub_users')
      .insert({
        telegram_id: userId,
        is_subscribed: false,
        subscription_plan: 'free',
        consent_given_at: new Date().toISOString(),
      })

    if (error) {
      console.error('❌ [Telegram] Error creating user:', error)
      await sendTelegramBotMessage(
        chatId,
        '❌ Произошла ошибка при регистрации. Пожалуйста, попробуйте позже или обратитесь в поддержку: my@bez-pauzy.ru'
      )
      return
    }
  } else {
    // Обновляем согласие для существующего пользователя
    await supabase
      .from('menohub_users')
      .update({ consent_given_at: new Date().toISOString() })
      .eq('id', existingUser.id)
  }

  // Отправляем вопрос о возрасте
  await sendTelegramBotMessage(
    chatId,
    '✅ Спасибо за согласие!\n\nДля персонализации советов укажите, пожалуйста, ваш возраст:',
    {
      buttons: [
        [
          { text: '40-45 лет', callbackData: '40-45' },
          { text: '46-50 лет', callbackData: '46-50' },
        ],
        [{ text: '50+ лет', callbackData: '50+' }],
      ],
    }
  )
}

/**
 * ОТКАЗ ОТ СОГЛАСИЯ
 */
async function handleConsentDecline(chatId: number, userId: number): Promise<void> {
  await sendTelegramBotMessage(
    chatId,
    `Понимаю ваше решение 🌸

К сожалению, без согласия на обработку данных я не могу предоставить персонализированные рекомендации.

Если передумаете, используйте команду /start для начала работы.

Будьте здоровы! 💜`
  )
}

/**
 * ВЫБОР ВОЗРАСТА
 */
async function handleAgeSelection(
  chatId: number,
  userId: number,
  ageRange: '40-45' | '46-50' | '50+'
): Promise<void> {
  const supabase = createServiceRoleClient()

  // Находим пользователя
  const { data: user } = await supabase
    .from('menohub_users')
    .select('id')
    .eq('telegram_id', userId)
    .single()

  if (!user) {
    await sendTelegramBotMessage(chatId, 'Пользователь не найден. Используйте /start для регистрации.')
    return
  }

  // Сохраняем возраст
  await supabase.from('menohub_users').update({ age_range: ageRange }).eq('id', user.id)

  // Отправляем бесплатные темы
  const websiteUrl = `https://bez-pauzy.ru?tg_id=${userId}`

  await sendTelegramBotMessage(
    chatId,
    `Отлично! Информация сохранена 📝

Вы можете выбрать одну из популярных тем для быстрого ознакомления или сразу задать свой вопрос:`,
    {
      buttons: [
        [
          { text: '🌡️ Приливы', callbackData: 'free_topic_hot_flashes' },
          { text: '😴 Сон', callbackData: 'free_topic_sleep' },
        ],
        [
          { text: '🌈 Настроение', callbackData: 'free_topic_mood' },
          { text: '⚖️ Вес', callbackData: 'free_topic_weight' },
        ],
        [{ text: '💬 Задать свой вопрос', callbackData: 'select_another_topic' }],
        [{ text: '🌐 Перейти на сайт', url: websiteUrl }],
      ],
    }
  )
}

/**
 * БЕСПЛАТНАЯ ТЕМА
 */
async function handleFreeTopic(
  chatId: number,
  userId: number,
  topic: 'hot_flashes' | 'sleep' | 'mood' | 'weight'
): Promise<void> {
  const supabase = createServiceRoleClient()

  // Получаем возраст пользователя
  const { data: user } = await supabase
    .from('menohub_users')
    .select('age_range')
    .eq('telegram_id', userId)
    .single()

  const ageRange = user?.age_range as '40-45' | '46-50' | '50+' | null

  // Получаем шаблон
  const template = getFreeTopicTemplate(topic, ageRange)

  // Отправляем ответ с кнопками
  await sendTelegramBotMessage(chatId, template, {
    parseMode: 'HTML',
    buttons: getAfterTopicButtons(),
  })
}

/**
 * СПАСИБО ПОСЛЕ РЕКОМЕНДАЦИИ ВРАЧА
 */
async function handleDoctorThanks(chatId: number): Promise<void> {
  await sendTelegramBotMessage(
    chatId,
    `Рада помочь! 💜

Если у вас появятся еще вопросы, смело пишите. Я всегда на связи!

Здоровья вам! 🌸`,
    {
      buttons: [
        [
          { text: 'Задать еще вопрос', callbackData: 'select_another_topic' },
          { text: '👍 Спасибо', callbackData: 'Thank_you' },
        ],
      ],
    }
  )
}

/**
 * ЗАДАТЬ ЕЩЕ ВОПРОС
 */
async function handleSelectAnotherTopic(chatId: number): Promise<void> {
  await sendTelegramBotMessage(
    chatId,
    `Конечно! Задавайте свой вопрос, и я постараюсь помочь 💜

Вы можете спросить о:
• Симптомах менопаузы
• Гормональной терапии
• Питании и образе жизни
• Рекомендациях врачей
• И многом другом!

Просто напишите ваш вопрос 👇`
  )
}

/**
 * ВСЁ ПОНЯТНО (завершение)
 */
async function handleThankYou(chatId: number): Promise<void> {
  // Получаем telegram_id пользователя из chatId (они совпадают в приватном чате)
  const websiteUrl = `https://bez-pauzy.ru?tg_id=${chatId}`

  await sendTelegramBotMessage(
    chatId,
    `Рада была помочь! 🌸

Если у вас появятся новые вопросы, я всегда на связи. Просто напишите мне в любое время!

Будьте здоровы и берегите себя! 💜

<i>Полезные команды:</i>
/history - история ваших вопросов
/export_my_data - экспорт ваших данных
/delete_my_data - удалить все данные`,
    {
      parseMode: 'HTML',
      buttons: [[{ text: '🌐 Перейти на сайт', url: websiteUrl }]],
    }
  )
}

/**
 * ИНФОРМАЦИЯ ОБ ОПЛАТЕ
 */
async function handlePaymentInfo(chatId: number): Promise<void> {
  await sendTelegramBotMessage(
    chatId,
    `💳 <b>Подписка на "Без |Паузы"</b>

Получите доступ к:
✨ Неограниченным вопросам персональной помощнице Еве
📚 Эксклюзивным материалам и гайдам
🎥 Видео от врачей с подробными объяснениями
📖 Полной базе знаний о женском здоровье

<b>Тарифы:</b>
• Месяц — 800₽
• 3 месяца — 2100₽ (экономия 300₽)
• Год — 7200₽ (экономия 2400₽)

Оформить подписку можно на сайте:
🔗 https://bez-pauzy.ru/pricing

После оплаты доступ активируется автоматически!

Есть вопросы? Напишите нам: my@bez-pauzy.ru`,
    {
      parseMode: 'HTML',
      buttons: [
        [{ text: '💳 Оформить подписку', url: 'https://bez-pauzy.ru/pricing' }],
        [{ text: '← Назад', callbackData: 'select_another_topic' }],
      ],
    }
  )
}

/**
 * ВИДЕО ВРАЧЕЙ (ПЛАТНЫЙ КОНТЕНТ)
 */
async function handleDoctorsVideos(chatId: number, userId: number): Promise<void> {
  const supabase = createServiceRoleClient()

  // Проверяем подписку пользователя
  const { data: user } = await supabase
    .from('menohub_users')
    .select('is_subscribed, subscription_plan')
    .eq('telegram_id', userId)
    .single()

  if (!user?.is_subscribed || user.subscription_plan === 'free') {
    // Пользователь без подписки - показываем информацию
    await sendTelegramBotMessage(
      chatId,
      `🎥 <b>Видео "Врачи Объясняют"</b>

Эксклюзивный контент от ведущих специалистов:
• Гинекологи-эндокринологи
• Кардиологи
• Неврологи
• Диетологи
• И другие эксперты

Видео доступны по подписке! 💜

Каждое видео — это подробный разбор важных тем с практическими рекомендациями от врачей с опытом 10+ лет.`,
      {
        parseMode: 'HTML',
        buttons: [
          [{ text: '💳 Оформить подписку', callbackData: 'pay' }],
          [{ text: '← Назад', callbackData: 'select_another_topic' }],
        ],
      }
    )
    return
  }

  // У пользователя есть подписка - показываем список видео
  const { data: videos } = await supabase
    .from('menohub_video_content')
    .select('id, title, description, doctor_name, doctor_specialty, thumbnail_url, duration')
    .eq('content_type', 'doctors_explain')
    .eq('published', true)
    .eq('access_level', 'paid1') // или paid2, в зависимости от подписки
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(10)

  if (!videos || videos.length === 0) {
    await sendTelegramBotMessage(
      chatId,
      '📹 Видео от врачей скоро появятся! Мы работаем над контентом.\n\nА пока вы можете задать любой вопрос Еве 💜'
    )
    return
  }

  // Формируем список видео с кнопками
  let message = `🎥 <b>Видео "Врачи Объясняют"</b>\n\nВыберите видео для просмотра:\n\n`

  const buttons: Array<Array<{ text: string; callbackData?: string; url?: string }>> = []

  videos.forEach((video, index) => {
    message += `${index + 1}. <b>${video.title}</b>\n`
    message += `   ${video.doctor_name} • ${video.doctor_specialty}\n`
    message += `   ⏱ ${Math.floor(video.duration / 60)} мин\n\n`

    buttons.push([
      {
        text: `▶️ ${index + 1}. ${video.title.substring(0, 30)}${video.title.length > 30 ? '...' : ''}`,
        callbackData: `video_${video.id}`,
      },
    ])
  })

  buttons.push([{ text: '← Назад', callbackData: 'select_another_topic' }])

  await sendTelegramBotMessage(chatId, message, {
    parseMode: 'HTML',
    buttons,
  })
}

/**
 * ВЫБОР КОНКРЕТНОГО ВИДЕО
 */
async function handleVideoSelection(chatId: number, userId: number, videoId: string): Promise<void> {
  const supabase = createServiceRoleClient()

  // Проверяем подписку
  const { data: user } = await supabase
    .from('menohub_users')
    .select('is_subscribed, subscription_plan')
    .eq('telegram_id', userId)
    .single()

  if (!user?.is_subscribed || user.subscription_plan === 'free') {
    await sendTelegramBotMessage(chatId, '❌ Доступ к видео доступен только по подписке.', {
      buttons: [[{ text: '💳 Оформить подписку', callbackData: 'pay' }]],
    })
    return
  }

  // Получаем видео
  const { data: video } = await supabase
    .from('menohub_video_content')
    .select('*')
    .eq('id', videoId)
    .single()

  if (!video) {
    await sendTelegramBotMessage(chatId, '❌ Видео не найдено.')
    return
  }

  // Формируем ссылку на видео на сайте
  const videoUrl = `https://bez-pauzy.ru/videos/doctors-explain/${video.slug}`

  // Отправляем информацию о видео
  let message = `🎥 <b>${video.title}</b>\n\n`
  message += `👨‍⚕️ <b>${video.doctor_name}</b>\n`
  message += `${video.doctor_specialty}\n`
  if (video.doctor_credentials) {
    message += `${video.doctor_credentials}\n`
  }
  message += `\n⏱ Длительность: ${Math.floor(video.duration / 60)} мин\n\n`
  message += `📝 ${video.description}\n`

  await sendTelegramBotMessage(chatId, message, {
    parseMode: 'HTML',
    buttons: [
      [{ text: '▶️ Смотреть видео', url: videoUrl }],
      [
        { text: '← К списку', callbackData: 'listen_podcast' },
        { text: '💬 Задать вопрос', callbackData: 'select_another_topic' },
      ],
    ],
  })

  // Увеличиваем счетчик просмотров
  await supabase.rpc('increment_video_views', { video_id: videoId })
}
