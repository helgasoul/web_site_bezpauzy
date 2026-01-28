/**
 * Интеграция с Claude API для генерации ответов
 * 
 * Использует Anthropic Claude для генерации ответов Евы
 */

import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface GenerateResponseOptions {
  userId: number
  conversationHistory?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  knowledgeBaseContext?: string
}

/**
 * Генерация ответа через Claude API
 */
export async function generateResponse(
  userMessage: string,
  options: GenerateResponseOptions
): Promise<string> {
  const { userId, conversationHistory = [], knowledgeBaseContext = '' } = options

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY не установлен')
  }

  // Формируем системный промпт
  const systemPrompt = `Ты Ева — медицинский ассистент для женщин в период менопаузы. Твоя задача — предоставлять научно обоснованную поддержку и информацию.

Ключевые принципы:
- Отвечай на основе научных данных и медицинских источников
- Будь эмпатичной, поддерживающей и понимающей
- НЕ давай медицинские диагнозы или назначения
- Рекомендуй консультацию с врачом при необходимости
- Используй контекст из базы знаний для более точных ответов
- Персонализируй ответы на основе истории разговора

${knowledgeBaseContext ? `\nКонтекст из базы знаний:\n${knowledgeBaseContext}\n` : ''}

Важно: Всегда подчеркивай, что твои ответы носят информационный характер и не заменяют консультацию врача.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        ...conversationHistory,
        {
          role: 'user',
          content: userMessage,
        },
      ],
    })

    // Извлекаем текст ответа
    const responseText = message.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as any).text)
      .join('\n')

    return responseText || 'Извините, не удалось сгенерировать ответ. Пожалуйста, попробуйте еще раз.'
  } catch (error: any) {
    console.error('❌ [Claude] Error generating response:', error)
    
    // Обработка различных типов ошибок
    if (error.status === 429) {
      throw new Error('Превышен лимит запросов. Пожалуйста, попробуйте позже.')
    }
    
    if (error.status === 401) {
      throw new Error('Ошибка аутентификации API. Обратитесь к администратору.')
    }

    throw new Error('Произошла ошибка при генерации ответа. Пожалуйста, попробуйте еще раз.')
  }
}
