/**
 * Типы для базы знаний
 */

export type KnowledgeBaseCategorySlug = 'symptoms' | 'stages' | 'treatment' | 'myths'

export type KnowledgeBaseTopicSlug = 
  // Symptoms
  | 'prilivy' | 'son' | 'nastroenie' | 'libido' | 'ves-metabolizm' | 'kozha-volosy' | 'kosti-sustavy' | 'serdtse-sosudy'
  // Stages
  | 'perimenopauza' | 'menopauza' | 'postmenopauza'
  // Treatment
  | 'zgt' | 'alternativy' | 'obraz-zhizni'
  // Myths
  | 'razvenchanie-mifov'

export type ContentType = 'article' | 'quiz' | 'podcast' | 'interactive_card'

export interface KnowledgeBaseCategory {
  id: string
  slug: KnowledgeBaseCategorySlug
  title: string
  description: string
  icon: string // название иконки из lucide-react
  orderIndex: number
  gradientFrom: string // Tailwind gradient класс
  gradientTo: string
  topics: KnowledgeBaseTopic[]
}

export interface KnowledgeBaseTopic {
  id: string
  slug: KnowledgeBaseTopicSlug
  title: string
  description: string
  categorySlug: KnowledgeBaseCategorySlug
  stats?: {
    percentage?: number
    text: string
  }
  orderIndex: number
  // Связи с контентом (будут заполняться динамически)
  articleSlugs?: string[] // slug статей из блога
  quizIds?: string[] // ID квизов
  podcastIds?: string[] // ID подкастов (когда появятся)
  tags?: string[] // Теги для связи с гайдами и видео
  shortContent?: string // Краткая информация для карточки
  image?: string // Изображение для карточки и страницы симптома
}

export interface KnowledgeBaseTopicContent {
  topicId: string
  contentType: ContentType
  contentId: string // ID статьи, квиза, подкаста
  orderIndex: number
}

