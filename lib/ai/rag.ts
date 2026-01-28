/**
 * RAG (Retrieval-Augmented Generation) система
 * 
 * Поиск релевантной информации из базы знаний для контекста ответа
 */

import { createClient } from '@/lib/supabase/server'

/**
 * Получение контекста из базы знаний для запроса пользователя
 */
export async function getRAGContext(query: string): Promise<string> {
  const supabase = await createClient()

  try {
    // Поиск в knowledge_base по релевантности
    // Используем textSearch для полнотекстового поиска
    const { data: knowledgeItems, error } = await supabase
      .from('knowledge_base')
      .select('content, title, category')
      .textSearch('content', query, {
        type: 'websearch',
        config: 'russian',
      })
      .limit(5) // Берем топ-5 наиболее релевантных документов

    if (error) {
      console.error('❌ [RAG] Error searching knowledge base:', error)
      return ''
    }

    if (!knowledgeItems || knowledgeItems.length === 0) {
      // Если ничего не найдено, можно попробовать поиск по категориям
      return ''
    }

    // Формируем контекст из найденных документов
    const context = knowledgeItems
      .map((item) => {
        // Берем первые 500 символов каждого документа для контекста
        const content = item.content.substring(0, 500)
        return `[${item.title}${item.category ? ` (${item.category})` : ''}]\n${content}...`
      })
      .join('\n\n---\n\n')

    return context
  } catch (error) {
    console.error('❌ [RAG] Error getting context:', error)
    return ''
  }
}

/**
 * Поиск по категориям, если прямой поиск не дал результатов
 */
export async function searchByCategory(category: string): Promise<string> {
  const supabase = await createClient()

  try {
    const { data } = await supabase
      .from('knowledge_base')
      .select('content, title')
      .eq('category', category)
      .limit(3)

    if (!data || data.length === 0) {
      return ''
    }

    return data
      .map((item) => `[${item.title}]\n${item.content.substring(0, 300)}...`)
      .join('\n\n---\n\n')
  } catch (error) {
    console.error('❌ [RAG] Error searching by category:', error)
    return ''
  }
}
