export type VideoContentType = 'podcast' | 'eva_explains'
export type VideoType = 'youtube' | 'mave' | 'supabase' | 'vimeo' | 'direct' | 'telegram'
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

export interface VideoTimestamp {
  time: number // seconds
  title: string
}

export interface VideoContent {
  id: string
  title: string
  slug: string
  description: string
  content_type: VideoContentType
  video_type: VideoType
  video_url: string | null
  video_id: string | null
  storage_bucket: string | null
  storage_path: string | null
  thumbnail_url: string
  duration: number // seconds
  category: VideoCategory
  category_name: string
  meta_title: string | null
  meta_description: string | null
  meta_keywords: string[] | null
  access_level: VideoAccessLevel
  published: boolean
  published_at: string | null
  views_count: number
  likes_count: number
  tags: string[]
  transcript: string | null
  timestamps: VideoTimestamp[] | null
  related_articles: string[] | null
  related_videos: string[] | null
  created_at: string
  updated_at: string

  // Podcast-specific fields
  podcast_series?: string | null
  guest_expert_id?: number | null
  guest_expert_name?: string | null
  guest_expert_role?: string | null
  guest_expert_avatar?: string | null
  host_name?: string | null

  // Eva explains specific fields
  topic?: string | null
}

export interface PodcastEpisode extends VideoContent {
  content_type: 'podcast'
  video_type: 'youtube' | 'mave'
}

export interface EvaExplainsVideo extends VideoContent {
  content_type: 'eva_explains'
  video_type: 'supabase'
  storage_bucket: string
  storage_path: string
}

export interface VideoContentFilters {
  content_type?: VideoContentType
  category?: VideoCategory
  access_level?: VideoAccessLevel
  tags?: string[]
  search?: string
  limit?: number
  offset?: number
}

