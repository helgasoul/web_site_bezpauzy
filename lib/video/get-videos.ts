import { createClient } from '@/lib/supabase/server'

export type VideoContentType = 'podcast' | 'eva_explains' | 'doctors_explain'
export type VideoAccessLevel = 'free' | 'paid1' | 'paid2'
export type VideoCategory = 
  | 'menopause' 
  | 'hormones' 
  | 'nutrition' 
  | 'sports' 
  | 'mental_health' 
  | 'sexual_health' 
  | 'bone_health' 
  | 'heart_health' 
  | 'sleep' 
  | 'skin_health' 
  | 'general'

export interface VideoContent {
  id: string
  title: string
  slug: string
  description: string
  contentType: VideoContentType
  
  // Podcast fields
  podcastSeries?: string | null
  guestExpertId?: number | null
  guestExpertName?: string | null
  guestExpertRole?: string | null
  guestExpertAvatar?: string | null
  hostName?: string | null
  
  // Eva explains fields
  topic?: string | null
  
  // Video metadata
  videoUrl: string
  videoType: 'youtube' | 'vimeo' | 'direct' | 'telegram'
  videoId?: string | null
  thumbnailUrl: string
  duration: number // in seconds
  
  // Categorization
  category: VideoCategory
  categoryName: string
  
  // SEO
  metaTitle?: string | null
  metaDescription?: string | null
  metaKeywords?: string[] | null
  
  // Access
  accessLevel: VideoAccessLevel
  
  // Status
  published: boolean
  publishedAt?: string | null
  
  // Stats
  viewsCount: number
  likesCount: number
  
  // Additional
  tags?: string[] | null
  transcript?: string | null
  timestamps?: Array<{ time: number; title: string }> | null
  relatedArticles?: string[] | null
  relatedVideos?: string[] | null
  
  // Timestamps
  createdAt: string
  updatedAt: string
}

/**
 * Get all published videos
 */
export async function getPublishedVideos(
  options?: {
    contentType?: VideoContentType
    category?: VideoCategory
    accessLevel?: VideoAccessLevel
    limit?: number
  }
): Promise<VideoContent[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('menohub_video_content')
    .select('*')
    .eq('published', true)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
  
  if (options?.contentType) {
    query = query.eq('content_type', options.contentType)
  }
  
  if (options?.category) {
    query = query.eq('category', options.category)
  }
  
  if (options?.accessLevel) {
    query = query.eq('access_level', options.accessLevel)
  }
  
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching published videos:', error)
    return []
  }
  
  // Transform snake_case to camelCase
  return (data || []).map(transformVideoData) as VideoContent[]
}

/**
 * Get video by slug
 */
export async function getVideoBySlug(slug: string): Promise<VideoContent | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('menohub_video_content')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .lte('published_at', new Date().toISOString())
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching video by slug:', error)
    return null
  }

  return transformVideoData(data) as VideoContent
}

/**
 * Get videos by content type (podcast or eva_explains)
 */
export async function getVideosByType(
  contentType: VideoContentType,
  limit?: number
): Promise<VideoContent[]> {
  return getPublishedVideos({ contentType, limit })
}

/**
 * Get related videos (same category, excluding current)
 */
export async function getRelatedVideos(
  currentSlug: string,
  category: VideoCategory,
  limit: number = 3
): Promise<VideoContent[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('menohub_video_content')
    .select('*')
    .eq('published', true)
    .eq('category', category)
    .neq('slug', currentSlug)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching related videos:', error)
    return []
  }

  return (data || []).map(transformVideoData) as VideoContent[]
}

/**
 * Transform database row (snake_case) to VideoContent (camelCase)
 */
function transformVideoData(row: any): Partial<VideoContent> {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    contentType: row.content_type,
    podcastSeries: row.podcast_series,
    guestExpertId: row.guest_expert_id,
    guestExpertName: row.guest_expert_name,
    guestExpertRole: row.guest_expert_role,
    guestExpertAvatar: row.guest_expert_avatar,
    hostName: row.host_name,
    topic: row.topic,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    doctorSpecialty: row.doctor_specialty,
    doctorCredentials: row.doctor_credentials,
    doctorAvatar: row.doctor_avatar,
    videoUrl: row.video_url,
    videoType: row.video_type,
    videoId: row.video_id,
    thumbnailUrl: row.thumbnail_url,
    duration: row.duration || 0,
    category: row.category,
    categoryName: row.category_name,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    metaKeywords: row.meta_keywords,
    accessLevel: row.access_level,
    published: row.published,
    publishedAt: row.published_at,
    viewsCount: row.views_count || 0,
    likesCount: row.likes_count || 0,
    tags: row.tags || [],
    transcript: row.transcript,
    timestamps: row.timestamps,
    relatedArticles: row.related_articles,
    relatedVideos: row.related_videos,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

