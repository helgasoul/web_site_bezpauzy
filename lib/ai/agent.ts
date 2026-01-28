/**
 * LangChain Agent для обработки запросов с инструментами
 * 
 * Реализация агента аналогичного n8n workflow:
 * - Поиск врачей (search_doctors) - только из базы данных
 * 
 * Все данные берутся исключительно из базы данных Supabase
 */

import { ChatOpenAI } from '@langchain/openai'
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { searchDoctorsTool } from './agent-tools'

/**
 * Создание агента с инструментами
 */
export async function createAgent() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY не установлен')
  }

  // Используем модель как в n8n (gpt-4o-mini или gpt-4o)
  const model = new ChatOpenAI({
    modelName: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature: 0.7,
    openAIApiKey: process.env.OPENAI_API_KEY,
  })

  // Инструменты агента (только поиск в базе данных)
  const tools = [
    searchDoctorsTool,
  ]

  // Системный промпт для агента (аналогично n8n)
  const systemPrompt = `Ты Ева — медицинский ассистент для женщин в период менопаузы.

Твоя задача — предоставлять научно обоснованную поддержку и информацию.

Ключевые принципы:
- Отвечай на основе научных данных и медицинских источников
- Будь эмпатичной, поддерживающей и понимающей
- НЕ давай медицинские диагнозы или назначения
- Рекомендуй консультацию с врачом при необходимости
- Используй инструменты для поиска информации, когда это необходимо

Инструменты:
- search_doctors: Поиск врачей по специальности и городу в базе данных

ВАЖНО: 
- Все данные берутся ТОЛЬКО из базы данных
- Если врач не найден в базе - честно сообщи об этом пользователю
- НЕ предлагай искать в интернете или других источниках
- Всегда подчеркивай, что твои ответы носят информационный характер и не заменяют консультацию врача
- Используй инструменты только когда это необходимо
- Если пользователь просит найти врача - используй search_doctors`

  // Промпт для агента
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', systemPrompt],
    ['human', '{input}'],
    new MessagesPlaceholder('agent_scratchpad'),
  ])

  // Создаем агента
  const agent = await createOpenAIFunctionsAgent({
    llm: model,
    tools,
    prompt,
  })

  // Создаем executor
  const agentExecutor = new AgentExecutor({
    agent,
    tools,
    verbose: process.env.NODE_ENV === 'development',
    maxIterations: 5, // Ограничиваем количество итераций
  })

  return agentExecutor
}

/**
 * Запуск агента с запросом пользователя
 */
export async function runAgent(
  userMessage: string,
  context?: {
    userId?: number
    city?: string
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
  }
): Promise<string> {
  try {
    const agent = await createAgent()

    // Формируем входные данные для агента
    let input = userMessage

    // Добавляем контекст, если есть
    if (context?.city) {
      input += `\n\nКонтекст: Пользователь находится в городе ${context.city}.`
    }

    // Запускаем агента
    const result = await agent.invoke({
      input,
      chat_history: context?.conversationHistory || [],
    })

    return result.output || 'Извините, не удалось обработать запрос.'
  } catch (error) {
    console.error('❌ [Agent] Error running agent:', error)
    throw new Error('Произошла ошибка при обработке запроса агентом.')
  }
}
