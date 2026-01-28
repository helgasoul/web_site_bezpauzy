/**
 * Инструмент Update_city для AI Agent
 * Обновляет город пользователя в базе данных
 *
 * Используется, когда пользователь сообщает свой город
 */

import { createServiceRoleClient } from '@/lib/supabase/server'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'

export const updateCityTool = new DynamicStructuredTool({
  name: 'Update_city',
  description: `Используй этот инструмент, когда от пользователя приходит название города.
НЕ используй при таком сообщении другие инструменты, кроме инструмента Structured Output Parser для правильного вывода ответа.

ВАЖНО: Город записывай в строку city точно так, как сказал пользователь (с заглавной буквы, на русском языке).

Примеры городов:
- Москва
- Санкт-Петербург
- Екатеринбург
- Новосибирск
- Казань
- Минск
- Киев
- Алматы

Input:
- userId (number) - ID пользователя
- city (string) - название города

Output: {success: boolean, message: string}`,

  schema: z.object({
    userId: z.number().describe('ID пользователя в системе'),
    city: z.string().describe('Название города (с заглавной буквы, на русском)'),
  }),

  func: async ({ userId, city }) => {
    try {
      const supabase = createServiceRoleClient()

      // Нормализуем город: первая буква заглавная, остальные строчные
      const normalizedCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase()

      const { error } = await supabase
        .from('menohub_users')
        .update({ city: normalizedCity })
        .eq('id', userId)

      if (error) {
        console.error('❌ [Update_city] Error:', error)
        return JSON.stringify({
          success: false,
          message: 'Не удалось сохранить город',
        })
      }

      console.log('✅ [Update_city] Updated:', {
        userId,
        city: normalizedCity,
      })

      return JSON.stringify({
        success: true,
        message: `Город "${normalizedCity}" успешно сохранен`,
      })
    } catch (error) {
      console.error('❌ [Update_city] Exception:', error)
      return JSON.stringify({
        success: false,
        message: 'Произошла ошибка при сохранении города',
      })
    }
  },
})
