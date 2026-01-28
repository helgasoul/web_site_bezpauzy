/**
 * Инструмент Get_user_age для AI Agent
 * Получает возраст пользователя из базы данных
 *
 * Используется в main-agent для персонализации ответов
 */

import { createServiceRoleClient } from '@/lib/supabase/server'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'

export const getUserAgeTool = new DynamicStructuredTool({
  name: 'Get_user_age',
  description: `ОБЯЗАТЕЛЬНЫЙ ПЕРВЫЙ ШАГ: Получает возраст пользователя из базы данных.
ВСЕГДА вызывай этот инструмент ПЕРЕД формированием ответа!

Возвращает возрастную группу:
- "40-45" - подготовка к изменениям (перименопауза пока не наступила)
- "46-50" - перименопауза и управление симптомами
- "50+" - менопауза и постменопауза, долгосрочные риски здоровья
- null - возраст не указан (используй общую информацию для возраста 40-50 лет)

Input: userId (number) - ID пользователя в системе
Output: {age_range: string | null, city: string | null, telegram_id: number}`,

  schema: z.object({
    userId: z.number().describe('ID пользователя в системе'),
  }),

  func: async ({ userId }) => {
    try {
      const supabase = createServiceRoleClient()

      const { data: user, error } = await supabase
        .from('menohub_users')
        .select('age_range, city, telegram_id')
        .eq('id', userId)
        .single()

      if (error || !user) {
        console.error('❌ [Get_user_age] Error:', error)
        return JSON.stringify({
          age_range: null,
          city: null,
          telegram_id: userId,
          error: 'User not found',
        })
      }

      console.log('✅ [Get_user_age] Retrieved:', {
        userId,
        age_range: user.age_range,
        city: user.city,
      })

      return JSON.stringify({
        age_range: user.age_range,
        city: user.city,
        telegram_id: user.telegram_id,
      })
    } catch (error) {
      console.error('❌ [Get_user_age] Exception:', error)
      return JSON.stringify({
        age_range: null,
        city: null,
        error: 'Failed to retrieve user age',
      })
    }
  },
})
