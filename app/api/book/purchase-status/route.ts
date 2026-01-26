import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

// Явно указываем, что этот route динамический (использует searchParams)
export const dynamic = 'force-dynamic'

/**
 * GET /api/book/purchase-status
 * Проверяет, куплена ли книга пользователем с указанным email
 */
export async function GET(request: NextRequest) {
  try {
    // Получаем email из query параметров
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')?.trim().toLowerCase()

    if (!email) {
      return NextResponse.json(
        { error: 'Email не указан' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Ищем покупку книги по email
    const { data: purchase, error } = await supabase
      .from('menohub_book_orders')
      .select('*')
      .eq('email', email)
      .eq('status', 'paid')
      .eq('book_type', 'digital')
      .order('paid_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      logger.error('Error checking book purchase status:', error)
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
    const expiresAt = purchase.download_token_expires_at
      ? new Date(purchase.download_token_expires_at)
      : null
    const isExpired = expiresAt ? expiresAt < new Date() : false

    // Проверяем лимит скачиваний
    const maxDownloads = purchase.max_downloads || 10
    const downloadCount = purchase.download_count || 0
    const limitReached = downloadCount >= maxDownloads

    return NextResponse.json({
      purchased: true,
      canDownload: !isExpired && !limitReached && !!purchase.download_token,
      downloadCount,
      maxDownloads,
      expiresAt: purchase.download_token_expires_at,
      isExpired,
      limitReached,
      downloadToken: purchase.download_token,
      purchaseId: purchase.id,
    })
  } catch (error: any) {
    logger.error('Error in book purchase-status API:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

