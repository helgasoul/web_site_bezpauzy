import { getRelatedArticles } from '@/lib/blog/get-articles'
import { RelatedArticlesClient } from './RelatedArticlesClient'

interface RelatedArticlesProps {
  currentSlug: string
  category: 'gynecologist' | 'mammologist' | 'nutritionist'
}

/**
 * Server Component для получения данных связанных статей
 * Передаёт данные в Client Component для рендеринга с анимациями
 */
export async function RelatedArticles({ currentSlug, category }: RelatedArticlesProps) {
  // Получаем связанные статьи из Supabase
  const relatedArticles = await getRelatedArticles(currentSlug, category, 3)

  // Передаём данные в клиентский компонент
  return <RelatedArticlesClient articles={relatedArticles || []} />
}
