/**
 * Инструмент search_doctors для AI Agent1 (поиск врачей)
 * Поиск врачей в базе данных menohub_experts
 */

import { createServiceRoleClient } from '@/lib/supabase/server'
import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'

export const searchDoctorsTool = new DynamicStructuredTool({
  name: 'search_doctors',
  description: `Поиск врачей в базе данных по специальности и городу.

КРИТИЧНО: ВСЕ ДАННЫЕ УЖЕ ЕСТЬ! НЕ СПРАШИВАЙ ИХ СНОВА!

Принимает:
- query (string) - специальности для поиска (например: "гинеколог эндокринолог")
- filter (object) - фильтры поиска {city?: string}

Возвращает список врачей с контактами:
- ФИО
- Специальность
- Специализация
- Ссылка на запись
- Рейтинг (если есть)

Примеры использования:
search_doctors(query="гинеколог сомнолог", filter={city: "Москва"})
search_doctors(query="кардиолог", filter={city: "Санкт-Петербург"})`,

  schema: z.object({
    query: z.string().describe('Специальности для поиска (через пробел)'),
    filter: z
      .object({
        city: z.string().optional().describe('Город для фильтрации'),
      })
      .optional()
      .describe('Фильтры поиска'),
  }),

  func: async ({ query, filter }) => {
    try {
      const supabase = createServiceRoleClient()

      // Разбиваем query на ключевые слова (специальности)
      const keywords = query.toLowerCase().split(/\s+/)

      // Строим запрос к БД
      let dbQuery = supabase
        .from('menohub_experts')
        .select('id, name, specialty, specialization, consultation_url, rating, reviews_count, city, credentials, photo_url')
        .eq('published', true)

      // Фильтр по городу (если указан)
      if (filter?.city) {
        dbQuery = dbQuery.ilike('city', `%${filter.city}%`)
      }

      // Поиск по специальностям (ищем хотя бы одно совпадение)
      const orConditions = keywords
        .map(keyword => `specialty.ilike.%${keyword}%,specialization.ilike.%${keyword}%`)
        .join(',')

      dbQuery = dbQuery.or(orConditions)

      // Сортировка по рейтингу
      dbQuery = dbQuery.order('rating', { ascending: false, nullsFirst: false }).limit(10)

      const { data: doctors, error } = await dbQuery

      if (error) {
        console.error('❌ [search_doctors] Error:', error)
        return JSON.stringify({
          success: false,
          doctors: [],
          message: 'Ошибка поиска врачей в базе данных',
        })
      }

      if (!doctors || doctors.length === 0) {
        console.log('⚠️ [search_doctors] No doctors found for:', query, filter)
        return JSON.stringify({
          success: true,
          doctors: [],
          message: 'Врачи не найдены в базе данных',
          query,
          filter,
        })
      }

      // Форматируем результат
      const formattedDoctors = doctors.map(doc => ({
        name: doc.name,
        specialty: doc.specialty,
        specialization: doc.specialization,
        city: doc.city,
        credentials: doc.credentials,
        rating: doc.rating,
        reviews_count: doc.reviews_count,
        consultation_url: doc.consultation_url,
        photo_url: doc.photo_url,
      }))

      console.log('✅ [search_doctors] Found:', {
        count: formattedDoctors.length,
        query,
        filter,
      })

      return JSON.stringify({
        success: true,
        doctors: formattedDoctors,
        count: formattedDoctors.length,
        query,
        filter,
      })
    } catch (error) {
      console.error('❌ [search_doctors] Exception:', error)
      return JSON.stringify({
        success: false,
        doctors: [],
        message: 'Произошла ошибка при поиске врачей',
      })
    }
  },
})
