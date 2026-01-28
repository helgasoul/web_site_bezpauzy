/**
 * Единый обработчик сообщений для Telegram и сайта
 * 
 * Эта функция обрабатывает все сообщения одинаково, независимо от источника.
 * Обеспечивает единую логику и синхронизацию между каналами.
 */

import { createClient } from '@/lib/supabase/server'
import { checkPromptSafety } from './lakera'
import { generateResponse } from './claude'
import { getRAGContext } from './rag'
import { runAgent } from './agent' // Агент для поиска врачей
import { runMainAgent } from './main-agent' // Основной агент для ответов на вопросы

interface ProcessMessageOptions {
  userId: number | string
  message: string
  source: 'telegram' | 'website'
  queryId?: string | number
  conversationHistory?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

/**
 * Единая функция обработки сообщений
 * 
 * Flow:
 * 1. Проверка безопасности (Lakera)
 * 2. Определение типа запроса (поиск врачей или обычный вопрос)
 * 3. Выбор агента:
 *    - Агент для поиска врачей (AI Agent1) - если нужен поиск врачей
 *    - Основной агент (AI Agent) - для ответов на вопросы
 * 4. Обработка через выбранный агент
 * 5. Возврат ответа
 * 
 * Аналогично n8n workflow с двумя агентами
 */
export async function processMessage(
  options: ProcessMessageOptions
): Promise<string> {
  const { userId, message, source, queryId, conversationHistory } = options

  // 1. Проверка безопасности (защита от промпт-инжекции)
  const safetyCheck = await checkPromptSafety(message)
  
  if (!safetyCheck.safe || safetyCheck.flagged) {
    return 'Понимаю ваш интерес, но этот вопрос вне моей специализации 🌸 Я фокусируюсь на поддержке женщин в период менопаузы — это важная тема, требующая внимания. Есть ли что-то по этому направлению, с чем я могу помочь?'
  }

  // 2. Определяем тип запроса
  const isDoctorSearch = shouldUseDoctorAgent(message)
  const userIdNumber = typeof userId === 'string' ? parseInt(userId, 10) : userId

  if (isDoctorSearch) {
    // Используем агента для поиска врачей (AI Agent1 из n8n)
    const user = await getUserContext(userId)
    
    const response = await runAgent(message, {
      userId: userIdNumber,
      city: user?.city || undefined,
      conversationHistory: conversationHistory || await getConversationHistory(userId),
    })

    return response
  }

  // Используем основной агент для ответов на вопросы (AI Agent из n8n)
  // Этот агент использует векторную базу знаний и инструменты
  const user = await getUserContext(userId)
  
  const response = await runMainAgent(message, {
    userId: userIdNumber,
    telegramId: user?.telegramId || userIdNumber,
    conversationHistory: conversationHistory || await getConversationHistory(userId),
  })

  return response
}

/**
 * Определяет, нужен ли агент для поиска врачей
 * (AI Agent1 из n8n - только для поиска врачей)
 */
function shouldUseDoctorAgent(message: string): boolean {
  const lowerMessage = message.toLowerCase()
  
  // Ключевые слова, которые требуют поиска врачей
  const doctorSearchKeywords = [
    'найди врача',
    'найти врача',
    'поиск врача',
    'рекомендуй врача',
    'специалист',
    'клиника',
    'записаться к врачу',
    'врач в городе',
    'нужен врач',
    'хочу к врачу',
  ]

  return doctorSearchKeywords.some(keyword => lowerMessage.includes(keyword))
}

/**
 * Получение контекста пользователя (город, telegram_id и т.д.)
 */
async function getUserContext(
  userId: number | string
): Promise<{ city?: string; telegramId?: number } | null> {
  const supabase = await createClient()

  const { data: user } = await supabase
    .from('menohub_users')
    .select('city, telegram_id')
    .eq('id', userId)
    .single()

  return user ? {
    city: user.city || undefined,
    telegramId: user.telegram_id || undefined,
  } : null
}

/**
 * Получение истории разговора пользователя
 */
async function getConversationHistory(
  userId: number | string
): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
  const supabase = await createClient()

  // Получаем последние 10 пар вопрос-ответ для контекста
  const { data: queries } = await supabase
    .from('menohub_queries')
    .select('query_text, response_text, created_at')
    .eq('user_id', userId)
    .eq('query_status', 'completed')
    .not('response_text', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10)

  if (!queries || queries.length === 0) {
    return []
  }

  // Формируем историю в формате для Claude
  const history: Array<{ role: 'user' | 'assistant'; content: string }> = []

  // Обрабатываем в обратном порядке (от старых к новым)
  queries.reverse().forEach((query) => {
    if (query.query_text) {
      history.push({
        role: 'user',
        content: query.query_text,
      })
    }
    if (query.response_text && query.response_text !== 'processing') {
      history.push({
        role: 'assistant',
        content: query.response_text,
      })
    }
  })

  return history
}
