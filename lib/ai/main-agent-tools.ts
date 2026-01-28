/**
 * Инструменты для основного агента (AI Agent)
 *
 * Аналогично инструментам из n8n workflow:
 * - Vector_store: Поиск в векторной базе знаний (menohub_documents)
 * - Get_user_age: Получение возраста пользователя
 * - Update_city: Обновление города пользователя
 */

import { DynamicStructuredTool } from '@langchain/core/tools'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase'
import { OpenAIEmbeddings } from '@langchain/openai'
import { getUserAgeTool } from './tools/get-user-age'
import { updateCityTool } from './tools/update-city'

/**
 * Инструмент для поиска в векторной базе знаний
 * 
 * Использует таблицу menohub_documents с векторными embeddings
 */
export const vectorStoreTool = new DynamicStructuredTool({
  name: 'Vector_store',
  description: `Инструмент для поиска в Векторной базе данных информации для ответа пользователю.

ИСПОЛЬЗУЙ ЭТОТ ИНСТРУМЕНТ В ПЕРВУЮ ОЧЕРЕДЬ при каждом запросе пользователя!

ВАЖНО:
- Запрос должен быть на АНГЛИЙСКОМ языке
- Обязательно указывай возрастную группу: "40-45", "46-50", или "51+"
- Формат запроса: "[ключевые слова на английском], Age group: [возрастная группа]"

Примеры:
- "hot flashes menopause symptoms, Age group: 46-50"
- "hormone replacement therapy benefits, Age group: 51+"
- "perimenopause weight gain, Age group: 40-45"`,
  schema: z.object({
    query: z.string().describe('Поисковый запрос на английском языке с указанием возрастной группы'),
  }),
  func: async ({ query }) => {
    try {
      if (!process.env.OPENAI_API_KEY) {
        return 'Ошибка: OPENAI_API_KEY не установлен'
      }

      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return 'Ошибка: Supabase credentials не установлены'
      }

      // Создаем Supabase клиент с service role key для векторного поиска
      const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
      
      const supabaseClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            persistSession: false,
          },
        }
      )

      // Создаем векторный store для поиска
      const vectorStore = await SupabaseVectorStore.fromExistingIndex(
        new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
        }),
        {
          client: supabaseClient,
          tableName: 'menohub_documents',
          queryName: 'match_menohub_documents',
        }
      )

      // Поиск в векторной базе (top 10 результатов)
      const results = await vectorStore.similaritySearch(query, 10)

      if (!results || results.length === 0) {
        return 'Информация по запросу не найдена в базе знаний.'
      }

      // Форматируем результаты
      const formattedResults = results
        .map((doc, index) => {
          const content = doc.pageContent.substring(0, 500) // Первые 500 символов
          const metadata = doc.metadata
          return `[Документ ${index + 1}]
${content}...
${metadata.title ? `Источник: ${metadata.title}` : ''}
${metadata.category ? `Категория: ${metadata.category}` : ''}`
        })
        .join('\n\n---\n\n')

      return `Найдено ${results.length} релевантных документов в базе знаний:\n\n${formattedResults}`
    } catch (error) {
      console.error('❌ [Main Agent Tool] Error in Vector_store:', error)
      return 'Произошла ошибка при поиске в базе знаний.'
    }
  },
})

/**
 * Инструмент для получения возраста пользователя
 * 
 * ОБЯЗАТЕЛЬНО вызывать ПЕРЕД формированием ответа
 */
export const getUserAgeTool = new DynamicStructuredTool({
  name: 'Get_user_age',
  description: `Получение возраста пользователя из базы данных для персонализации ответа.

ОБЯЗАТЕЛЬНО вызывай этот инструмент ПЕРЕД формированием ответа!

Параметры:
- telegram_id: Telegram ID пользователя (уже есть во входных данных)

Возвращает возраст пользователя или null, если не указан.`,
  schema: z.object({
    telegram_id: z.number().describe('Telegram ID пользователя'),
  }),
  func: async ({ telegram_id }) => {
    try {
      const supabase = await createClient()

      const { data: user, error } = await supabase
        .from('menohub_users')
        .select('age_group, age')
        .eq('telegram_id', telegram_id)
        .single()

      if (error || !user) {
        return 'Пользователь не найден в базе данных.'
      }

      if (user.age) {
        // Определяем возрастную группу
        let ageGroup = '40-50'
        if (user.age >= 40 && user.age <= 45) {
          ageGroup = '40-45'
        } else if (user.age >= 46 && user.age <= 50) {
          ageGroup = '46-50'
        } else if (user.age >= 51) {
          ageGroup = '51+'
        }

        return `Возраст пользователя: ${user.age} лет. Возрастная группа: ${ageGroup}.`
      }

      if (user.age_group) {
        return `Возрастная группа пользователя: ${user.age_group}.`
      }

      return 'Возраст пользователя не указан в базе данных. Используй общую информацию для возраста 40-50 лет.'
    } catch (error) {
      console.error('❌ [Main Agent Tool] Error in Get_user_age:', error)
      return 'Произошла ошибка при получении возраста пользователя.'
    }
  },
})

/**
 * Инструмент для обновления города пользователя
 * 
 * Используется когда пользователь сообщает свой город
 */
export const updateCityTool = new DynamicStructuredTool({
  name: 'Update_city',
  description: `Обновление города пользователя в базе данных.

Используй этот инструмент ТОЛЬКО когда пользователь сообщает название города.

Параметры:
- user_id: ID пользователя в базе данных
- city: Название города

ВАЖНО: Если пользователь написал только название города, используй этот инструмент и ответь "Спасибо, информация добавлена!" без дополнительного текста.`,
  schema: z.object({
    user_id: z.number().describe('ID пользователя в базе данных'),
    city: z.string().describe('Название города'),
  }),
  func: async ({ user_id, city }) => {
    try {
      const supabase = await createClient()

      const { error } = await supabase
        .from('menohub_users')
        .update({ city: city })
        .eq('id', user_id)

      if (error) {
        console.error('❌ [Main Agent Tool] Error updating city:', error)
        return 'Ошибка при обновлении города в базе данных.'
      }

      return 'Город успешно обновлен в базе данных.'
    } catch (error) {
      console.error('❌ [Main Agent Tool] Error in Update_city:', error)
      return 'Произошла ошибка при обновлении города.'
    }
  },
})
