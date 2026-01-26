import Image from 'next/image'
import { BookOpen } from 'lucide-react'
import { getPublishedResources, type Resource } from '@/lib/supabase/resources'
import { BuyResourceButton } from '@/components/resources/BuyResourceButton'
import { DownloadResourceButton } from '@/components/resources/DownloadResourceButton'

interface TopicGuidesProps {
  topicSlug: string
  topicTags?: string[]
}

/**
 * Нормализует тег для сравнения (lowercase, убирает пробелы, приводит к единому формату)
 */
function normalizeTag(tag: string | null | undefined): string {
  if (!tag || typeof tag !== 'string') {
    return ''
  }
  return tag.toLowerCase().trim().replace(/\s+/g, ' ')
}

/**
 * Проверяет, совпадают ли два тега (с учетом частичного совпадения и синонимов)
 */
function tagsMatch(tag1: string | null | undefined, tag2: string | null | undefined): boolean {
  if (!tag1 || !tag2) {
    return false
  }
  
  const normalized1 = normalizeTag(tag1)
  const normalized2 = normalizeTag(tag2)
  
  if (!normalized1 || !normalized2) {
    return false
  }
  
  // Точное совпадение
  if (normalized1 === normalized2) {
    return true
  }
  
  // Частичное совпадение (один тег содержит другой)
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    return true
  }
  
  // Синонимы (можно расширить)
  const synonyms: Record<string, string[]> = {
    'приливы': ['приливы', 'управление приливами', 'горячие приливы'],
    'сон': ['сон', 'бессонница', 'качество сна', 'улучшение сна'],
    'либидо': ['либидо', 'сексуальность', 'интимное здоровье', 'сексуальное здоровье'],
    'кожа': ['кожа', 'уход за кожей', 'изменения кожи'],
    'волосы': ['волосы', 'выпадение волос', 'уход за волосами'],
    'вес': ['вес', 'прибавка веса', 'похудение', 'контроль веса'],
    'метаболизм': ['метаболизм', 'обмен веществ', 'метаболическое здоровье'],
    'згт': ['згт', 'гормональная терапия', 'гормональная заместительная терапия'],
  }
  
  // Проверка через синонимы
  try {
    for (const [key, values] of Object.entries(synonyms)) {
      if (!key || !values || !Array.isArray(values)) {
        continue
      }
      if (values.includes(normalized1) && values.includes(normalized2)) {
        return true
      }
      if (normalized1 && normalized1.includes(key) && values.includes(normalized2)) {
        return true
      }
      if (values.includes(normalized1) && normalized2 && normalized2.includes(key)) {
        return true
      }
    }
  } catch (error) {
    // Если что-то пошло не так при проверке синонимов, возвращаем false
    return false
  }
  
  return false
}

/**
 * Получить гайды по теме (по тегам)
 */
async function getGuidesForTopic(topicSlug: string, topicTags?: string[]): Promise<Resource[]> {
  try {
    const allGuides = await getPublishedResources('guide')
    
    if (!allGuides || !Array.isArray(allGuides) || allGuides.length === 0) {
      return []
    }

    // Используем теги из конфига, если они переданы
    const keywords = (topicTags && Array.isArray(topicTags) && topicTags.length > 0)
      ? topicTags.filter((tag): tag is string => typeof tag === 'string' && tag.length > 0)
      : []
    
    if (!keywords || keywords.length === 0) {
      // Если теги не переданы, возвращаем пустой массив
      return []
    }
    
    // Ищем гайды, которые имеют общие теги с темой
    const matchingGuides = allGuides.filter(guide => {
      if (!guide || !guide.tags || !Array.isArray(guide.tags) || guide.tags.length === 0) {
        return false
      }
      
      // Проверяем, есть ли хотя бы одно совпадение тегов
      return guide.tags.some((guideTag: string | null | undefined) => {
        if (!guideTag) return false
        return keywords.some(keyword => tagsMatch(guideTag, keyword))
      })
    })

    // Сортируем по релевантности (количество совпадений тегов)
    const sortedGuides = matchingGuides.sort((a, b) => {
      const aMatches = (a.tags || []).filter((aTag: string | null | undefined) => {
        if (!aTag) return false
        return keywords.some(keyword => tagsMatch(aTag, keyword))
      }).length
      const bMatches = (b.tags || []).filter((bTag: string | null | undefined) => {
        if (!bTag) return false
        return keywords.some(keyword => tagsMatch(bTag, keyword))
      }).length
      
      return bMatches - aMatches // Больше совпадений - выше в списке
    })

    return sortedGuides.slice(0, 6) // Максимум 6 гайдов
  } catch (error) {
    console.error('Error fetching guides for topic:', error)
    return []
  }
}

export async function TopicGuides({ topicSlug, topicTags }: TopicGuidesProps) {
  try {
    const guides = await getGuidesForTopic(topicSlug, topicTags)

    if (!guides || !Array.isArray(guides) || guides.length === 0) {
      return <></>
    }

  return (
    <section className="py-12 bg-lavender-bg/50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-h3 font-bold text-deep-navy mb-2 flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-primary-purple" />
            Гайды и материалы
          </h2>
          <p className="text-body text-deep-navy/70">
            Практические руководства и чек-листы по теме
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide) => (
            <div key={guide.id} className="bg-soft-white rounded-card overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 h-full flex flex-col border border-lavender-bg">
              {/* Cover Image */}
              {guide.coverImage && (
                <div className="w-full h-48 relative overflow-hidden bg-lavender-bg">
                  <Image
                    src={guide.coverImage}
                    alt={guide.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  {guide.isPaid && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="px-3 py-1 bg-primary-purple text-white text-body-small font-semibold rounded-full shadow-sm">
                        {guide.priceKopecks ? `${(guide.priceKopecks / 100).toFixed(0)}₽` : 'Платно'}
                      </span>
                    </div>
                  )}
                  {!guide.isPaid && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="px-3 py-1 bg-ocean-wave-start text-white text-body-small font-semibold rounded-full shadow-sm">
                        Бесплатно
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-5 flex-grow flex flex-col">
                <h3 className="text-h6 font-semibold text-deep-navy mb-2 hover:text-primary-purple transition-colors line-clamp-2">
                  {guide.title}
                </h3>
                <p className="text-body-small text-deep-navy/70 mb-4 flex-grow line-clamp-2">
                  {guide.description}
                </p>

                {/* Download/Purchase Button */}
                {guide.isPaid ? (
                  <div className="pt-4 border-t border-lavender-bg mt-auto">
                    <BuyResourceButton resource={guide} variant="small" />
                  </div>
                ) : (
                  <div className="pt-4 border-t border-lavender-bg mt-auto">
                    <DownloadResourceButton 
                      resource={guide} 
                      label="Скачать бесплатно"
                      variant="link"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    )
  } catch (error) {
    console.error('Error in TopicGuides component:', error)
    return <></>
  }
}
