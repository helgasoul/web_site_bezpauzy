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

// getUserAgeTool и updateCityTool импортируются из ./tools/
// Экспортируем их для использования в main-agent.ts
export { getUserAgeTool, updateCityTool }
