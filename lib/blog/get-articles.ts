import { createClient } from '@/lib/supabase/server'

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: 'gynecologist' | 'mammologist' | 'nutritionist'
  categoryName: string
  authorId?: number | null
  authorName: string
  authorRole: string
  authorAvatar?: string | null
  image: string
  published: boolean
  publishedAt?: string | null
  updatedAt: string
  readTime?: number | null
  keyTakeaways?: string[] | null
  articleReferences?: Array<{ id: number; text: string }> | null
  metaTitle?: string | null
  metaDescription?: string | null
  metaKeywords?: string[] | null
  createdAt: string
}

/**
 * Маппинг данных из Supabase в BlogPost
 * Supabase возвращает snake_case, конвертируем в camelCase
 */
function mapBlogPost(row: any): BlogPost {
  // Type guard для category
  const validCategories = ['gynecologist', 'mammologist', 'nutritionist'] as const
  const category = validCategories.includes(row.category) 
    ? row.category 
    : 'gynecologist' // Fallback
  
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    content: row.content,
    category: category as 'gynecologist' | 'mammologist' | 'nutritionist',
    categoryName: row.category_name || row.categoryName || '', // Поддержка обоих форматов
    authorId: row.author_id || row.authorId,
    authorName: row.author_name || row.authorName || '',
    authorRole: row.author_role || row.authorRole || '',
    authorAvatar: row.author_avatar || row.authorAvatar,
    image: row.image || '',
    published: row.published || false,
    publishedAt: row.published_at || row.publishedAt,
    updatedAt: row.updated_at || row.updatedAt || row.created_at || new Date().toISOString(),
    readTime: row.read_time || row.readTime,
    keyTakeaways: row.key_takeaways || row.keyTakeaways,
    articleReferences: row.article_references || row.articleReferences,
    metaTitle: row.meta_title || row.metaTitle,
    metaDescription: row.meta_description || row.metaDescription,
    metaKeywords: row.meta_keywords || row.metaKeywords,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  }
}

/**
 * Получить все опубликованные статьи
 */
export async function getPublishedArticles(limit?: number): Promise<BlogPost[]> {
  try {
    const supabase = await createClient()
    
    let query = supabase
      .from('menohub_blog_posts')
      .select('*')
      .eq('published', true)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
    
    if (limit) {
      query = query.limit(limit)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching published articles:', error)
      return []
    }
    
    if (!data) {
      return []
    }
    
    return data.map(mapBlogPost)
  } catch (error) {
    console.error('Error in getPublishedArticles:', error)
    return []
  }
}

/**
 * Получить статью по slug
 */
export async function getArticleBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('menohub_blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .lte('published_at', new Date().toISOString())
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    console.error('Error fetching article by slug:', error)
    return null
  }
  
  return mapBlogPost(data)
}

/**
 * Получить статьи по категории
 */
export async function getArticlesByCategory(
  category: 'gynecologist' | 'mammologist' | 'nutritionist',
  limit?: number
): Promise<BlogPost[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('menohub_blog_posts')
    .select('*')
    .eq('published', true)
    .eq('category', category)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
  
  if (limit) {
    query = query.limit(limit)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching articles by category:', error)
    return []
  }
  
  return (data || []).map(mapBlogPost)
}

/**
 * Получить связанные статьи (той же категории, исключая текущую)
 * Если статей той же категории недостаточно, дополняет статьями из других категорий
 */
export async function getRelatedArticles(
  currentSlug: string,
  category: 'gynecologist' | 'mammologist' | 'nutritionist',
  limit: number = 3
): Promise<BlogPost[]> {
  const supabase = await createClient()
  
  // Сначала получаем статьи той же категории
  const { data: sameCategory, error: sameCategoryError } = await supabase
    .from('menohub_blog_posts')
    .select('*')
    .eq('published', true)
    .eq('category', category)
    .neq('slug', currentSlug)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(limit)
  
  if (sameCategoryError) {
    console.error('Error fetching related articles:', sameCategoryError)
  }
  
  const relatedArticles = (sameCategory || []).map(mapBlogPost)
  
  // Если статей той же категории недостаточно, дополняем статьями из других категорий
  if (relatedArticles.length < limit) {
    const remaining = limit - relatedArticles.length
    const excludeSlugs = [currentSlug, ...relatedArticles.map(a => a.slug)]
    
    // Получаем статьи из других категорий, исключая уже выбранные
    // Используем фильтр для исключения slug'ов
    let otherQuery = supabase
      .from('menohub_blog_posts')
      .select('*')
      .eq('published', true)
      .neq('category', category)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false })
      .limit(remaining)
    
    // Исключаем slug'и по одному (Supabase не поддерживает NOT IN с массивом напрямую)
    for (const slug of excludeSlugs) {
      otherQuery = otherQuery.neq('slug', slug)
    }
    
    const { data: otherCategory, error: otherCategoryError } = await otherQuery
    
    if (otherCategoryError) {
      console.error('Error fetching other category articles:', otherCategoryError)
    } else {
      relatedArticles.push(...(otherCategory || []).map(mapBlogPost))
    }
  }
  
  return relatedArticles.slice(0, limit)
}
