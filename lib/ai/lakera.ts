/**
 * Интеграция с Lakera AI для защиты от промпт-инжекции
 * 
 * Проверяет безопасность пользовательских запросов перед обработкой
 */

export interface LakeraSafetyCheck {
  safe: boolean
  flagged: boolean
  reasons?: string[]
}

/**
 * Проверка безопасности промпта через Lakera AI
 */
export async function checkPromptSafety(
  message: string
): Promise<LakeraSafetyCheck> {
  const lakeraApiKey = process.env.LAKERA_API_KEY

  if (!lakeraApiKey) {
    // Если ключ не настроен, пропускаем проверку (для development)
    console.warn('⚠️ [Lakera] LAKERA_API_KEY не установлен, пропускаем проверку безопасности')
    return {
      safe: true,
      flagged: false,
    }
  }

  try {
    const response = await fetch('https://api.lakera.ai/v2/guard', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lakeraApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: message,
          },
        ],
        project_id: 'project-9332211015',
        breakdown: true,
      }),
    })

    if (!response.ok) {
      console.error('❌ [Lakera] API error:', response.status, response.statusText)
      // В случае ошибки API считаем сообщение безопасным, чтобы не блокировать пользователей
      return {
        safe: true,
        flagged: false,
      }
    }

    const data = await response.json()

    // Проверяем результат
    const flagged = data.flagged === true

    // Извлекаем причины, если есть breakdown
    const reasons: string[] = []
    if (data.breakdown) {
      Object.keys(data.breakdown).forEach((category) => {
        if (data.breakdown[category] === true) {
          reasons.push(category)
        }
      })
    }

    return {
      safe: !flagged,
      flagged: flagged,
      reasons: reasons.length > 0 ? reasons : undefined,
    }
  } catch (error) {
    console.error('❌ [Lakera] Error checking prompt safety:', error)
    // В случае ошибки считаем сообщение безопасным
    return {
      safe: true,
      flagged: false,
    }
  }
}
