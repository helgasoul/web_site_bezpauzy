/**
 * Типы для отзывов/рекомендаций пользователей
 */

export type TestimonialStatus = 'pending' | 'approved' | 'rejected'
export type TestimonialSource = 'bot' | 'website' | 'telegram' | 'email' | 'other'

export interface Testimonial {
  id: string
  quote: string
  author_name: string
  author_age: number | null
  author_location: string | null
  author_role: string | null
  rating: number | null // 1-5
  source: TestimonialSource | null
  verified: boolean
  user_id: number | null
  avatar_url: string | null
  status: TestimonialStatus
  featured: boolean
  meta_keywords: string[] | null
  created_at: string
  updated_at: string
  published_at: string | null
  moderated_by: number | null
  moderated_at: string | null
  moderation_notes: string | null
}

export interface TestimonialFilters {
  status?: TestimonialStatus
  featured?: boolean
  rating?: number
  limit?: number
  offset?: number
}

