import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

/**
 * GET /api/resources/purchase/[orderId]
 * Получить информацию о покупке по ID заказа
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> | { orderId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const { orderId } = resolvedParams

    if (!orderId) {
      return NextResponse.json(
        { error: 'ID заказа не указан' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Получаем информацию о покупке с данными ресурса
    const { data: purchase, error } = await supabase
      .from('menohub_resource_purchases')
      .select(`
        id,
        download_token,
        download_count,
        max_downloads,
        download_token_expires_at,
        status,
        resource:menohub_resources(
          title
        )
      `)
      .eq('id', orderId)
      .single()

    if (error || !purchase) {
      return NextResponse.json(
        { error: 'Заказ не найден' },
        { status: 404 }
      )
    }

    // Проверяем статус оплаты
    if (purchase.status !== 'paid') {
      return NextResponse.json(
        { error: 'Оплата не завершена' },
        { status: 403 }
      )
    }

    // Обрабатываем resource - может быть массивом или объектом
    const resource = Array.isArray(purchase.resource) 
      ? purchase.resource[0] 
      : purchase.resource
    
    return NextResponse.json({
      id: purchase.id,
      resourceTitle: resource?.title || 'Гайд',
      downloadToken: purchase.download_token,
      downloadCount: purchase.download_count,
      maxDownloads: purchase.max_downloads,
      expiresAt: purchase.download_token_expires_at,
    })
  } catch (error: any) {
    console.error('Error fetching purchase:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

