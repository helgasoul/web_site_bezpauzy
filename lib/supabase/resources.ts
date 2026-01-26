import { createClient } from '@/lib/supabase/server'

export interface Resource {
  id: string
  resourceType: 'checklist' | 'guide'
  title: string
  slug: string
  description: string
  iconName?: string | null
  coverImage?: string | null
  pdfSource: 'static' | 'dynamic' | 'supabase_storage'
  pdfFilePath?: string | null
  pdfFilename?: string | null
  category?: string | null
  tags?: string[] | null
  orderIndex: number
  published: boolean
  comingSoon: boolean
  // Платные поля
  isPaid?: boolean | null
  priceKopecks?: number | null
  epubFilePath?: string | null
  downloadLimit?: number | null
  metaTitle?: string | null
  metaDescription?: string | null
  metaKeywords?: string[] | null
  downloadCount: number
  viewCount: number
  createdAt: string
  updatedAt: string
  publishedAt?: string | null
}

/**
 * Маппинг данных из Supabase в Resource
 */
function mapResource(row: any): Resource | null {
  if (!row || typeof row !== 'object') {
    return null
  }

  try {
    return {
      id: row.id || '',
      resourceType: row.resource_type || 'guide',
      title: row.title || '',
      slug: row.slug || '',
      description: row.description || '',
      iconName: row.icon_name || null,
      coverImage: row.cover_image || null,
      pdfSource: row.pdf_source || 'static',
      pdfFilePath: row.pdf_file_path || null,
      pdfFilename: row.pdf_filename || null,
      category: row.category || null,
      tags: Array.isArray(row.tags) ? row.tags.filter((tag: any): tag is string => typeof tag === 'string') : [],
      orderIndex: typeof row.order_index === 'number' ? row.order_index : 0,
      published: Boolean(row.published),
      comingSoon: Boolean(row.coming_soon),
      // Платные поля
      isPaid: Boolean(row.is_paid),
      priceKopecks: typeof row.price_kopecks === 'number' ? row.price_kopecks : null,
      epubFilePath: row.epub_file_path || null,
      downloadLimit: typeof row.download_limit === 'number' ? row.download_limit : 3,
      metaTitle: row.meta_title || null,
      metaDescription: row.meta_description || null,
      metaKeywords: Array.isArray(row.meta_keywords) ? row.meta_keywords.filter((kw: any): kw is string => typeof kw === 'string') : [],
      downloadCount: typeof row.download_count === 'number' ? row.download_count : 0,
      viewCount: typeof row.view_count === 'number' ? row.view_count : 0,
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
      publishedAt: row.published_at || null,
    }
  } catch (error) {
    console.error('Error mapping resource:', error)
    return null
  }
}

/**
 * Получить все опубликованные ресурсы (чек-листы или гайды)
 */
export async function getPublishedResources(
  resourceType?: 'checklist' | 'guide'
): Promise<Resource[]> {
  const supabase = await createClient()

  let query = supabase
    .from('menohub_resources')
    .select('*')
    .eq('published', true)
    .lte('published_at', new Date().toISOString())
    .order('order_index', { ascending: true })
    .order('published_at', { ascending: false })

  if (resourceType) {
    query = query.eq('resource_type', resourceType)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching resources:', error)
    return []
  }

  if (!data || !Array.isArray(data)) {
    return []
  }

  return data
    .map(mapResource)
    .filter((resource): resource is Resource => resource !== null)
}

/**
 * Получить ресурс по slug
 */
export async function getResourceBySlug(
  slug: string
): Promise<Resource | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('menohub_resources')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .lte('published_at', new Date().toISOString())
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching resource by slug:', error)
    return null
  }

  return mapResource(data)
}

/**
 * Увеличить счетчик просмотров
 */
export async function incrementViewCount(resourceId: string): Promise<void> {
  const supabase = await createClient()

  // Используем RPC функцию или прямой UPDATE через service role
  const { error } = await supabase.rpc('increment_resource_view_count', {
    resource_id: resourceId,
  })

  if (error) {
    // Если RPC функция не существует, используем прямой UPDATE
    // (требует service role или специальную политику)
    console.error('Error incrementing view count:', error)
  }
}

/**
 * Увеличить счетчик скачиваний
 */
export async function incrementDownloadCount(resourceId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase.rpc('increment_resource_download_count', {
    resource_id: resourceId,
  })

  if (error) {
    console.error('Error incrementing download count:', error)
  }
}

