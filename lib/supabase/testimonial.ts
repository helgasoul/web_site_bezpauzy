import { createClient } from '@/lib/supabase/server'
import type { Testimonial, TestimonialFilters } from '@/lib/types/testimonial'
import { logger } from '@/lib/logger'

/**
 * Получить опубликованные отзывы
 */
export async function getPublishedTestimonials(filters: TestimonialFilters = {}): Promise<{
  data: Testimonial[] | null
  error: Error | null
}> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('menohub_testimonials')
      .select('*')
      .eq('status', 'approved')
      .not('published_at', 'is', null)
      .order('featured', { ascending: false })
      .order('published_at', { ascending: false })

    if (filters.featured !== undefined) {
      query = query.eq('featured', filters.featured)
    }

    if (filters.rating) {
      query = query.eq('rating', filters.rating)
    }

    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Error fetching testimonials:', error.message)
      return { data: null, error: new Error(error.message) }
    }

    return { data: data as Testimonial[], error: null }
  } catch (e: any) {
    logger.error('Unexpected error fetching testimonials:', e.message)
    return { data: null, error: e }
  }
}

/**
 * Получить отзывы для главной страницы (featured)
 */
export async function getFeaturedTestimonials(limit: number = 3): Promise<{
  data: Testimonial[] | null
  error: Error | null
}> {
  return getPublishedTestimonials({ featured: true, limit })
}

