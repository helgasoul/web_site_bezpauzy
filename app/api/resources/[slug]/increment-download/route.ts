import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getResourceBySlug } from '@/lib/supabase/resources'

/**
 * POST /api/resources/[slug]/increment-download
 * Увеличивает счетчик скачиваний для ресурса по slug
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const { slug } = resolvedParams

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug ресурса обязателен' },
        { status: 400 }
      )
    }

    // Получаем ресурс по slug, чтобы получить ID
    const resource = await getResourceBySlug(slug)
    
    if (!resource) {
      return NextResponse.json(
        { error: 'Ресурс не найден' },
        { status: 404 }
      )
    }

    const supabase = await createClient()

    // Используем RPC функцию для инкремента
    const { error } = await supabase.rpc('increment_resource_download_count', {
      resource_id: resource.id,
    })

    if (error) {
      console.error('Error incrementing download count:', error)
      // Не возвращаем ошибку, так как это не критично для пользователя
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in increment-download API:', error)
    // Не возвращаем ошибку, так как это не критично для пользователя
    return NextResponse.json({ success: false })
  }
}

