import { NextRequest, NextResponse } from 'next/server'
import { getResourceBySlug } from '@/lib/supabase/resources'

/**
 * GET /api/resources/[slug]
 * Получить информацию о ресурсе по slug (для превью в модальном окне)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolvedParams = typeof params === 'object' && 'then' in params 
      ? await params 
      : params as { slug: string }
    
    const { slug } = resolvedParams

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug не указан' },
        { status: 400 }
      )
    }

    const resource = await getResourceBySlug(slug)

    if (!resource) {
      return NextResponse.json(
        { error: 'Ресурс не найден' },
        { status: 404 }
      )
    }

    return NextResponse.json({ resource })
  } catch (error: any) {
    console.error('Error fetching resource:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
