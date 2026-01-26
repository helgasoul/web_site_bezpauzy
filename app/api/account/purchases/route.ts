import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'
import { logger } from '@/lib/logger'

/**
 * GET /api/account/purchases
 * Получает все купленные товары (книги и ресурсы) пользователя
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // Получаем все оплаченные заказы книг пользователя
    const { data: bookOrders, error: bookError } = await supabase
      .from('menohub_book_orders')
      .select('id, order_number, amount_kopecks, status, download_token, download_token_expires_at, paid_at, created_at')
      .eq('user_id', session.userId)
      .eq('status', 'paid')
      .order('paid_at', { ascending: false })

    if (bookError) {
      logger.error('[API] Ошибка получения заказов книг:', bookError)
    }

    // Получаем все оплаченные покупки ресурсов пользователя
    const { data: resourcePurchases, error: resourceError } = await supabase
      .from('menohub_resource_purchases')
      .select(`
        id,
        order_number,
        amount_kopecks,
        status,
        download_token,
        download_token_expires_at,
        paid_at,
        created_at,
        download_count,
        max_downloads,
        resource_id,
        menohub_resources!inner(
          id,
          title,
          description,
          slug,
          thumbnail_url
        )
      `)
      .eq('user_id', session.userId)
      .eq('status', 'paid')
      .order('paid_at', { ascending: false })

    if (resourceError) {
      logger.error('[API] Ошибка получения покупок ресурсов:', resourceError)
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'

    // Форматируем книги
    const books = (bookOrders || []).map((order) => ({
      id: order.id,
      type: 'book' as const,
      title: 'Менопауза: Новое видение',
      description: 'Электронная версия (EPUB). Доступна сразу после оплаты.',
      thumbnail_url: '/oblozhka.png',
      orderNumber: order.order_number || null,
      purchaseDate: order.paid_at || order.created_at,
      downloadToken: order.download_token || null,
      downloadUrl: order.download_token ? `${siteUrl}/api/book/download/${order.download_token}` : null,
      expiresAt: order.download_token_expires_at || null,
      priceKopecks: order.amount_kopecks,
      downloadCount: 0, // Для книг не отслеживаем количество скачиваний отдельно
      maxDownloads: 3, // Стандартный лимит
    }))

    // Форматируем ресурсы
    const resources = (resourcePurchases || []).map((purchase: any) => ({
      id: purchase.id,
      type: 'resource' as const,
      title: purchase.menohub_resources?.title || 'Гайд',
      description: purchase.menohub_resources?.description || null,
      thumbnail_url: purchase.menohub_resources?.thumbnail_url || null,
      slug: purchase.menohub_resources?.slug || null,
      orderNumber: purchase.order_number || null,
      purchaseDate: purchase.paid_at || purchase.created_at,
      downloadToken: purchase.download_token || null,
      downloadUrl: purchase.download_token ? `${siteUrl}/api/resources/download/${purchase.download_token}` : null,
      expiresAt: purchase.download_token_expires_at || null,
      priceKopecks: purchase.amount_kopecks,
      downloadCount: purchase.download_count || 0,
      maxDownloads: purchase.max_downloads || 1,
    }))

    // Объединяем и сортируем по дате покупки
    const allPurchases = [...books, ...resources].sort((a, b) => {
      const dateA = new Date(a.purchaseDate).getTime()
      const dateB = new Date(b.purchaseDate).getTime()
      return dateB - dateA
    })

    return NextResponse.json({
      purchases: allPurchases,
      count: allPurchases.length,
    })
  } catch (error: any) {
    logger.error('[API] Ошибка получения покупок:', error)
    return NextResponse.json(
      { error: error.message || 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
