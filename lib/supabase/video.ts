import { createClient } from '@/lib/supabase/server'
import type { VideoContent, VideoContentFilters, PodcastEpisode, EvaExplainsVideo } from '@/lib/types/video'
import { logger } from '@/lib/logger'
import { getSupabaseVideoUrl } from '@/lib/utils/video'

/**
 * Get signed URL for Supabase Storage video (for paid content)
 */
export async function getSupabaseSignedUrl(bucket: string, path: string, expiresIn: number = 3600): Promise<string | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    if (error) {
      logger.error('Error creating signed URL:', error.message)
      return null
    }

    return data.signedUrl
  } catch (e: any) {
    logger.error('Unexpected error creating signed URL:', e.message)
    return null
  }
}

/**
 * Map database row to VideoContent type
 */
function mapVideoContent(row: any): VideoContent {
  // Generate video_url for Supabase Storage if needed
  let videoUrl = row.video_url
  if (row.video_type === 'supabase' && row.storage_bucket && row.storage_path) {
    try {
      videoUrl = getSupabaseVideoUrl(row.storage_bucket, row.storage_path)
    } catch (error) {
      logger.error('Error generating Supabase video URL:', error)
      // Fallback to null if URL generation fails
      videoUrl = null
    }
  }

  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    content_type: row.content_type,
    video_type: row.video_type,
    video_url: videoUrl,
    video_id: row.video_id,
    storage_bucket: row.storage_bucket,
    storage_path: row.storage_path,
    thumbnail_url: row.thumbnail_url,
    duration: row.duration,
    category: row.category,
    category_name: row.category_name,
    meta_title: row.meta_title,
    meta_description: row.meta_description,
    meta_keywords: row.meta_keywords,
    access_level: row.access_level,
    published: row.published,
    published_at: row.published_at,
    views_count: row.views_count,
    likes_count: row.likes_count,
    tags: row.tags || [],
    transcript: row.transcript,
    timestamps: row.timestamps,
    related_articles: row.related_articles,
    related_videos: row.related_videos,
    created_at: row.created_at,
    updated_at: row.updated_at,
    podcast_series: row.podcast_series,
    guest_expert_id: row.guest_expert_id,
    guest_expert_name: row.guest_expert_name,
    guest_expert_role: row.guest_expert_role,
    guest_expert_avatar: row.guest_expert_avatar,
    host_name: row.host_name,
    topic: row.topic,
  }
}

/**
 * Get all published video content with filters
 */
export async function getVideoContent(filters: VideoContentFilters = {}) {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('menohub_video_content')
      .select('*')
      .eq('published', true)
    
    // Order by published_at (nulls will be handled by database)
    query = query.order('published_at', { ascending: false })

    if (filters.content_type) {
      query = query.eq('content_type', filters.content_type)
    }

    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    if (filters.access_level) {
      query = query.eq('access_level', filters.access_level)
    }

    if (filters.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags)
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Error fetching video content:', error.message)
      return { data: [], error: error.message }
    }

    if (!data || data.length === 0) {
      return { data: [], error: null }
    }

    const videos: VideoContent[] = data.map((row) => {
      try {
        return mapVideoContent(row)
      } catch (e: any) {
        logger.error('Error mapping video content:', e.message)
        return null
      }
    }).filter((video): video is VideoContent => video !== null)

    return { data: videos, error: null }
  } catch (e: any) {
    logger.error('Unexpected error in getVideoContent:', e.message)
    return { data: [], error: 'Failed to fetch video content due to an unexpected error.' }
  }
}

/**
 * Get podcast episodes (noPause)
 */
export async function getPodcastEpisodes(limit?: number) {
  const result = await getVideoContent({
    content_type: 'podcast',
    limit,
  })

  return {
    data: result.data as PodcastEpisode[],
    error: result.error,
  }
}

/**
 * Get Eva explains videos
 */
export async function getEvaExplainsVideos(limit?: number) {
  const result = await getVideoContent({
    content_type: 'eva_explains',
    limit,
  })

  return {
    data: result.data as EvaExplainsVideo[],
    error: result.error,
  }
}

/**
 * Get a single video by slug
 */
export async function getVideoBySlug(slug: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('menohub_video_content')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (error && error.code !== 'PGRST116') {
      logger.error(`Error fetching video by slug "${slug}":`, error.message)
      return { data: null, error: error.message }
    }

    if (!data) {
      return { data: null, error: 'Video not found' }
    }

    const video = mapVideoContent(data)

    return { data: video, error: null }
  } catch (e: any) {
    logger.error(`Unexpected error in getVideoBySlug "${slug}":`, e.message)
    return { data: null, error: 'Failed to fetch video due to an unexpected error.' }
  }
}

/**
 * Get videos by category
 */
export async function getVideosByCategory(category: string, content_type?: VideoContentFilters['content_type']) {
  return getVideoContent({
    category: category as any,
    content_type,
  })
}

