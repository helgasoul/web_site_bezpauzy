import { createServiceRoleClient } from '@/lib/supabase/server'
import { getPublishedArticles, getArticlesByCategory } from '@/lib/blog/get-articles'

export interface Expert {
  id: string
  category: 'gynecologist' | 'mammologist' | 'nutritionist'
  category_name: string
  name: string
  specialization: string
  role: string
  description: string
  image?: string
  cv?: string
  cv_html?: string
  bio?: string
  bot_command?: string
  telegram_bot_link?: string
  order_index: number
}

/** Статичные данные экспертов, если в menohub_experts ещё нет записей (страница /doctors) */
const STATIC_EXPERTS: Record<'gynecologist' | 'mammologist' | 'nutritionist', Expert> = {
  mammologist: {
    id: '1',
    category: 'mammologist',
    category_name: 'Кабинет маммолога',
    name: 'Пучкова Ольга',
    specialization: 'Маммолог-онколог, врач-рентгенолог, сертифицированный специалист EUSOBI',
    role: 'Маммолог',
    description: 'Ведущий маммолог-онколог с опытом более 20 лет. Единственный в России врач, сертифицированный Европейской ассоциацией радиологов EUSOBI. Руководитель Маммологического центра К+31. Соавтор книг профессора László Tabár — мирового эксперта в диагностике рака молочной железы. Прошла стажировки в Швеции (центр им. Tabar), Израиле (Hadassah Medical Center), обучалась у ведущих международных специалистов. Эксперт государственной программы скрининга рака молочной железы. Специализируется на ранней диагностике с использованием маммографии, УЗИ, МРТ и томосинтеза.',
    image: '/puchkova-olga.png',
    order_index: 0,
  },
  gynecologist: {
    id: '2',
    category: 'gynecologist',
    category_name: 'Кабинет гинеколога',
    name: 'Шамугия Натия',
    specialization: 'Гинеколог-эндокринолог, кандидат медицинских наук',
    role: 'Гинеколог',
    description: 'Кандидат медицинских наук с опытом более 13 лет. Защитила диссертацию под руководством академика РАН, профессора Л.В. Адамян. Практикует в ведущих клиниках Москвы: Ильинская больница, Клиника Чайка. Эксперт в области менопаузальной гормональной терапии и anti-aging терапии. Международный диплом по эндоскопической хирургии (Université d\'Auvergne, Франция). Автор более 10 научных публикаций. Специализируется на индивидуальном подборе ЗГТ, эндоскопической хирургии, лечении миомы матки органосохраняющими методами. Помогает женщинам разобраться в симптомах менопаузы и найти оптимальное решение для сохранения качества жизни.',
    image: '/shamugia-natiya.jpg',
    order_index: 1,
  },
  nutritionist: {
    id: '3',
    category: 'nutritionist',
    category_name: 'Кухня нутрициолога',
    name: 'Климкова Марина',
    specialization: 'Врач превентивной, интегративной и anti-age медицины, Нутрициолог, диетолог',
    role: 'Нутрициолог',
    description: 'Врач с уникальным опытом более 20 лет, объединяющий клиническую медицину и превентивный подход. Международный диплом по нутрициологии (Leibniz Institute of Nutrition, Germany) — одно из ведущих научных учреждений Европы. Выпускница PreventAge Institute, специалист по медицине долголетия (Diploma in Longevity Medicine, 2024). Практикует в клиниках EMC, МЕДСИ, Патера, К+31. Единственный врач в России, сочетающий знания кардиологии, лучевой диагностики, нутрициологии и биохимии в холистическом подходе. Создаёт индивидуальные стратегии здоровья, учитывающие взаимодействие гормонов, питания, нервной системы и образа жизни. Помогает женщинам вернуть энергию, контроль веса и предотвратить возрастные изменения.',
    image: '/marina-klimkova.jpg',
    order_index: 2,
  },
}

export interface ExpertPageData {
  expert: Expert
  articles: Array<{
    id: string
    title: string
    slug: string
    excerpt: string
    image: string
    published_at: string
    read_time?: number
  }>
  videos: Array<{
    id: string
    title: string
    slug: string
    description: string
    thumbnail_url: string
    video_url: string
    duration: number
    content_type: 'podcast' | 'eva_explains'
    published_at: string
  }>
}

/**
 * Получить данные эксперта по категории
 */
export async function getExpertByCategory(
  category: 'gynecologist' | 'mammologist' | 'nutritionist'
): Promise<Expert | null> {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('menohub_experts')
    .select('*')
    .eq('category', category)
    .single()

  if (error || !data) {
    console.error('Error fetching expert:', error)
    return null
  }

  // Логирование для отладки - проверяем что данные загружаются
  console.log(`[Expert ${category}] Data loaded:`, {
    name: data.name,
    hasImage: !!data.image,
    image: data.image || 'NULL',
    hasCv: !!data.cv,
    hasBio: !!data.bio,
    cvLength: data.cv?.length || 0,
    imageValue: data.image,
    cvValue: data.cv ? `${data.cv.substring(0, 50)}...` : 'NULL',
  })

  return data as Expert
}

/**
 * Получить все данные для страницы эксперта (эксперт + статьи + видео).
 * Если в menohub_experts нет записи — используем статичные данные со страницы «Эксперты проекта».
 */
export async function getExpertPageData(
  category: 'gynecologist' | 'mammologist' | 'nutritionist'
): Promise<ExpertPageData | null> {
  let expert = await getExpertByCategory(category)
  if (!expert) {
    expert = STATIC_EXPERTS[category]
  }

  // Получаем статьи эксперта (по категории)
  const allArticles = await getArticlesByCategory(category)
  const expertArticles = allArticles
    .map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      image: article.image,
      published_at: article.publishedAt || article.createdAt,
      read_time: article.readTime ?? undefined,
    }))
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())

  // Получаем видео с участием эксперта
  const supabase = createServiceRoleClient()
  
  // Сначала получаем все опубликованные видео
  const { data: allVideos, error: videosError } = await supabase
    .from('menohub_video_content')
    .select('*')
    .eq('published', true)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })

  if (videosError) {
    console.error('Error fetching videos:', videosError)
  }

  // Фильтруем видео по эксперту
  const expertVideos = (allVideos || [])
    .filter((video) => {
      // Проверяем, упоминается ли эксперт как гость
      const isGuest = video.guest_expert_name?.toLowerCase().includes(expert.name.toLowerCase())
      
      // Для подкастов фильтруем по имени гостя
      if (video.content_type === 'podcast') {
        return isGuest
      }
      
      // Для "Ева объясняет" фильтруем по категории видео
      // Связываем категорию эксперта с категорией видео
      if (category === 'nutritionist' && video.category === 'nutrition') {
        return true
      }
      if (category === 'gynecologist' && (video.category === 'hormones' || video.category === 'menopause')) {
        return true
      }
      if (category === 'mammologist' && video.category === 'general') {
        return true
      }
      
      return false
    })
    .map((video) => ({
      id: video.id,
      title: video.title,
      slug: video.slug,
      description: video.description,
      thumbnail_url: video.thumbnail_url,
      video_url: video.video_url,
      duration: video.duration,
      content_type: video.content_type as 'podcast' | 'eva_explains',
      published_at: video.published_at || video.created_at,
    }))

  return {
    expert,
    articles: expertArticles,
    videos: expertVideos,
  }
}

/**
 * Получить все эксперты
 */
export async function getAllExperts(): Promise<Expert[]> {
  const supabase = createServiceRoleClient()

  const { data, error } = await supabase
    .from('menohub_experts')
    .select('*')
    .order('order_index', { ascending: true })

  if (error || !data) {
    console.error('Error fetching experts:', error)
    return []
  }

  return data as Expert[]
}

