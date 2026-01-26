import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/resources/recommended
 * Возвращает рекомендуемые ресурсы для upsell в корзине
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '3', 10)
    const type = searchParams.get('type') // 'book' или null для ресурсов

    const supabase = await createClient()

    if (type === 'book') {
      // Возвращаем информацию о книге
      return NextResponse.json({
        book: {
          id: 'book-menopauza-novoe-videnie',
          slug: 'book',
          title: 'Менопауза: Новое видение',
          description: 'Электронная версия (EPUB). Доступна сразу после оплаты.',
          thumbnailUrl: '/oblozhka.png',
          priceKopecks: 120000,
        },
      })
    }

    // Получаем популярные платные ресурсы (гайды)
    const { data: resources, error } = await supabase
      .from('menohub_resources')
      .select('id, slug, title, description, cover_image, price_kopecks')
      .eq('is_paid', true)
      .eq('published', true)
      .not('price_kopecks', 'is', null)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Ошибка загрузки рекомендуемых ресурсов:', error)
      return NextResponse.json({ resources: [] })
    }

    const formattedResources = (resources || []).map((resource) => ({
      id: resource.id,
      slug: resource.slug,
      title: resource.title,
      description: resource.description || '',
      thumbnailUrl: resource.cover_image || undefined,
      priceKopecks: resource.price_kopecks || 39900,
    }))

    return NextResponse.json({ resources: formattedResources })
  } catch (error: any) {
    console.error('Ошибка API recommended:', error)
    return NextResponse.json({ resources: [] }, { status: 500 })
  }
}
