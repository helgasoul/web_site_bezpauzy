/**
 * Инструменты для LangChain агента
 * 
 * Все данные берутся ТОЛЬКО из базы данных Supabase
 * Интернет-поиск не используется
 */

import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

/**
 * Инструмент для поиска врачей в базе данных
 * 
 * ЕДИНСТВЕННЫЙ источник данных - база данных Supabase
 * Если врач не найден, честно сообщи об этом пользователю
 */
export const searchDoctorsTool = new DynamicStructuredTool({
  name: 'search_doctors',
  description: `Поиск врачей по специальности и городу в базе данных.

Используй этот инструмент когда пользователь просит найти врача, специалиста или клинику.

ВАЖНО: 
- Все данные берутся ТОЛЬКО из базы данных
- Если врач не найден - честно сообщи об этом
- НЕ предлагай искать в интернете или других источниках

Параметры:
- query: Специальность врача (например: "гинеколог", "сомнолог", "психотерапевт")
- city: Город пользователя (например: "Москва", "Санкт-Петербург")

Возвращает список врачей с контактами и рейтингами из базы данных.`,
  schema: z.object({
    query: z.string().describe('Специальность врача для поиска'),
    city: z.string().optional().describe('Город для поиска врачей'),
  }),
  func: async ({ query, city }) => {
    try {
      const supabase = await createClient()

      // Поиск врачей в базе данных (таблица menohub_experts)
      let queryBuilder = supabase
        .from('menohub_experts')
        .select('id, name, specialty, specialization, city, credentials, rating, reviews_count, consultation_url, photo_url')
        .eq('published', true)
        .limit(10)

      // Фильтр по специальности (текстовый поиск)
      if (query) {
        queryBuilder = queryBuilder.or(`specialty.ilike.%${query}%,specialization.ilike.%${query}%,name.ilike.%${query}%`)
      }

      // Фильтр по городу
      if (city) {
        queryBuilder = queryBuilder.ilike('city', `%${city}%`)
      }

      // Сортировка по рейтингу
      queryBuilder = queryBuilder.order('rating', { ascending: false, nullsFirst: false })

      const { data: doctors, error } = await queryBuilder

      if (error) {
        console.error('❌ [Agent Tool] Error searching doctors:', error)
        return 'Ошибка при поиске врачей в базе данных.'
      }

      if (!doctors || doctors.length === 0) {
        return `К сожалению, врачи по запросу "${query}"${city ? ` в городе ${city}` : ''} не найдены в нашей базе данных. Рекомендую обратиться к вашему лечащему врачу или поискать специалиста через официальные медицинские порталы.`
      }

      // Форматируем результат
      const result = doctors
        .map((doctor, index) => {
          let formatted = `${index + 1}. **${doctor.name || 'Имя не указано'}** - ${doctor.specialty || 'Специальность не указана'}`

          if (doctor.specialization) formatted += `\n   Специализация: ${doctor.specialization}`
          if (doctor.credentials) formatted += `\n   ${doctor.credentials}`
          if (doctor.city) formatted += `\n   Город: ${doctor.city}`
          if (doctor.rating && doctor.reviews_count) {
            formatted += `\n   Рейтинг: ${doctor.rating}/5 (${doctor.reviews_count} отзывов)`
          } else if (doctor.rating) {
            formatted += `\n   Рейтинг: ${doctor.rating}/5`
          }
          if (doctor.consultation_url) formatted += `\n   Записаться: ${doctor.consultation_url}`

          return formatted
        })
        .join('\n\n')

      return `Найдено врачей: ${doctors.length}\n\n${result}`
    } catch (error) {
      console.error('❌ [Agent Tool] Error in search_doctors:', error)
      return 'Произошла ошибка при поиске врачей.'
    }
  },
})

