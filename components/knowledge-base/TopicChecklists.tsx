import Image from 'next/image'
import { ListChecks } from 'lucide-react'
import { getPublishedResources, type Resource } from '@/lib/supabase/resources'
import { DownloadResourceButton } from '@/components/resources/DownloadResourceButton'

interface TopicChecklistsProps {
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
    'анализы': ['анализы', 'лабораторные анализы', 'подготовка к врачу'],
    'гинеколог': ['гинеколог', 'визит к врачу', 'подготовка'],
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
 * Получить чек-листы по теме (по тегам)
 */
async function getChecklistsForTopic(topicSlug: string, topicTags?: string[]): Promise<Resource[]> {
  try {
    const allChecklists = await getPublishedResources('checklist')
    
    if (!allChecklists || !Array.isArray(allChecklists) || allChecklists.length === 0) {
      return []
    }

    // Используем теги из конфига, если они переданы
    const keywords = (topicTags && Array.isArray(topicTags) && topicTags.length > 0) 
      ? topicTags.filter((tag): tag is string => typeof tag === 'string' && tag.length > 0)
      : []
    
    // Также добавляем общие ключевые слова для чек-листов
    const generalKeywords = ['анализы', 'подготовка к врачу', 'гинеколог', 'менопауза']
    const allKeywords = [...keywords, ...generalKeywords]
    
    if (!allKeywords || allKeywords.length === 0) {
      return []
    }
    
    // Ищем чек-листы, которые имеют общие теги с темой
    const matchingChecklists = allChecklists.filter(checklist => {
      if (!checklist || !checklist.tags || !Array.isArray(checklist.tags) || checklist.tags.length === 0) {
        return false
      }
      
      // Проверяем, есть ли хотя бы одно совпадение тегов
      return checklist.tags.some((checklistTag: string | null | undefined) => {
        if (!checklistTag) return false
        return allKeywords.some(keyword => tagsMatch(checklistTag, keyword))
      })
    })

    // Сортируем по релевантности (количество совпадений тегов)
    const sortedChecklists = matchingChecklists.sort((a, b) => {
      const aMatches = (a.tags || []).filter((aTag: string | null | undefined) => {
        if (!aTag) return false
        return allKeywords.some(keyword => tagsMatch(aTag, keyword))
      }).length
      const bMatches = (b.tags || []).filter((bTag: string | null | undefined) => {
        if (!bTag) return false
        return allKeywords.some(keyword => tagsMatch(bTag, keyword))
      }).length
      
      return bMatches - aMatches // Больше совпадений - выше в списке
    })

    return sortedChecklists.slice(0, 6) // Максимум 6 чек-листов
  } catch (error) {
    console.error('Error fetching checklists for topic:', error)
    return []
  }
}

export async function TopicChecklists({ topicSlug, topicTags }: TopicChecklistsProps) {
  try {
    const checklists = await getChecklistsForTopic(topicSlug, topicTags)

    if (!checklists || !Array.isArray(checklists) || checklists.length === 0) {
      return <></>
    }

  return (
    <section className="py-12 bg-soft-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-h3 font-bold text-deep-navy mb-2 flex items-center gap-3">
            <ListChecks className="w-6 h-6 text-primary-purple" />
            Чек-листы
          </h2>
          <p className="text-body text-deep-navy/70">
            Практические чек-листы для подготовки к визитам и отслеживания симптомов
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {checklists.map((checklist) => (
            <div key={checklist.id} className="group block h-full">
                <div className="bg-soft-white rounded-card overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 h-full flex flex-col border border-lavender-bg">
                  {/* Cover Image */}
                  {checklist.coverImage && (
                    <div className="w-full h-48 relative overflow-hidden bg-lavender-bg">
                      <Image
                        src={checklist.coverImage}
                        alt={checklist.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute top-3 left-3 z-10">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-primary-purple text-body-small font-semibold rounded-full shadow-sm">
                          Чек-лист
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-5 flex-grow flex flex-col">
                    <h3 className="text-h6 font-semibold text-deep-navy mb-2 hover:text-primary-purple transition-colors line-clamp-2">
                      {checklist.title}
                    </h3>
                    <p className="text-body-small text-deep-navy/70 mb-4 flex-grow line-clamp-2">
                      {checklist.description}
                    </p>

                    {/* Download Button - используем компонент с обработкой ошибок */}
                    <div className="pt-4 border-t border-lavender-bg mt-auto">
                      <DownloadResourceButton 
                        resource={checklist} 
                        label="Скачать бесплатно"
                        variant="link"
                      />
                    </div>
                  </div>
                </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    )
  } catch (error) {
    console.error('Error in TopicChecklists component:', error)
    return <></>
  }
}
