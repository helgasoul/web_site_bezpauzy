import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getResourceBySlug } from '@/lib/supabase/resources'

/**
 * GET /api/resources/[slug]/purchase-status
 * Проверяет, куплен ли гайд пользователем с указанным email
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const { slug } = resolvedParams

    // Получаем email из query параметров
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')?.trim().toLowerCase()

    if (!email) {
      return NextResponse.json(
        { error: 'Email не указан' },
        { status: 400 }
      )
    }

    // Получаем ресурс по slug
    const resource = await getResourceBySlug(slug)
    if (!resource) {
      return NextResponse.json(
        { error: 'Ресурс не найден' },
        { status: 404 }
      )
    }

    // Проверяем, является ли ресурс платным
    if (!resource.isPaid || !resource.priceKopecks) {
      return NextResponse.json({
        purchased: false,
        message: 'Этот ресурс бесплатный',
      })
    }

    const supabase = createServiceRoleClient()

    // Ищем покупку по email и resource_id
    const { data: purchase, error } = await supabase
      .from('menohub_resource_purchases')
      .select('*')
      .eq('resource_id', resource.id)
      .eq('email', email)
      .eq('status', 'paid')
      .order('paid_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('Error checking purchase status:', error)
      return NextResponse.json(
        { error: 'Ошибка при проверке статуса покупки' },
        { status: 500 }
      )
    }

    if (!purchase) {
      return NextResponse.json({
        purchased: false,
        canDownload: false,
      })
    }

    // Проверяем срок действия токена
    const expiresAt = new Date(purchase.download_token_expires_at)
    const isExpired = expiresAt < new Date()

    // Проверяем лимит скачиваний
    const maxDownloads = purchase.max_downloads || 1 // Для платных гайдов: 1 скачивание
    const downloadCount = purchase.download_count || 0
    const limitReached = downloadCount >= maxDownloads

    return NextResponse.json({
      purchased: true,
      canDownload: !isExpired && !limitReached,
      downloadCount,
      maxDownloads,
      expiresAt: purchase.download_token_expires_at,
      isExpired,
      limitReached,
      downloadToken: purchase.download_token,
      purchaseId: purchase.id,
    })
  } catch (error: any) {
    console.error('Error in purchase-status API:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

