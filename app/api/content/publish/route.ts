import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { sendTelegramChannelMessage, sendTelegramChannelPhoto } from '@/lib/telegram/channel'
import { sendTelegramBotMessage } from '@/lib/telegram/bot'
import { sendNewsletterEmail } from '@/lib/email/newsletter'
import { formatTelegramMessage, formatEmailHTML, formatEmailText } from '@/lib/content/formatter'

/**
 * POST /api/content/publish
 * Публикация контента в Telegram канал, бот и email рассылку
 * 
 * Body:
 * {
 *   contentType: 'blog' | 'video' | 'resource',
 *   contentId: string (UUID),
 *   skipTelegram?: boolean,
 *   skipEmail?: boolean
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contentType, contentId, skipTelegram = false, skipEmail = false } = body

    if (!contentType || !contentId) {
      return NextResponse.json(
        { error: 'contentType и contentId обязательны' },
        { status: 400 }
      )
    }

    if (!['blog', 'video', 'resource'].includes(contentType)) {
      return NextResponse.json(
        { error: 'contentType должен быть: blog, video или resource' },
        { status: 400 }
      )
    }

    const supabase = createServiceRoleClient()

    // Получаем контент из соответствующей таблицы
    let content: any = null
    let contentData: any = null

    switch (contentType) {
      case 'blog': {
        const { data, error } = await supabase
          .from('menohub_blog_posts')
          .select('*')
          .eq('id', contentId)
          .single()

        if (error || !data) {
          return NextResponse.json(
            { error: 'Статья не найдена' },
            { status: 404 }
          )
        }

        contentData = data
        content = {
          type: 'blog' as const,
          title: data.title,
          slug: data.slug,
          description: data.excerpt,
          excerpt: data.excerpt,
          image: data.image,
          category: data.category_name,
          author: data.author_name,
        }
        break
      }

      case 'video': {
        const { data, error } = await supabase
          .from('menohub_video_content')
          .select('*')
          .eq('id', contentId)
          .single()

        if (error || !data) {
          return NextResponse.json(
            { error: 'Видео не найдено' },
            { status: 404 }
          )
        }

        contentData = data
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'
        const videoUrl = data.content_type === 'eva_explains' 
          ? `${siteUrl}/videos/eva-explains/${data.slug}`
          : `${siteUrl}/videos/podcasts/${data.slug}`
        
        content = {
          type: 'video' as const,
          title: data.title,
          slug: data.slug,
          description: data.description,
          excerpt: data.description.substring(0, 200) + '...',
          image: data.thumbnail_url,
          category: data.category_name,
          author: data.guest_expert_name || data.host_name,
          url: videoUrl,
        }
        break
      }

      case 'resource': {
        const { data, error } = await supabase
          .from('menohub_resources')
          .select('*')
          .eq('id', contentId)
          .single()

        if (error || !data) {
          return NextResponse.json(
            { error: 'Ресурс не найден' },
            { status: 404 }
          )
        }

        contentData = data
        content = {
          type: 'resource' as const,
          title: data.title,
          slug: data.slug,
          description: data.description,
          excerpt: data.description,
          image: data.cover_image,
          category: data.category,
        }
        break
      }
    }

    // Проверяем, что контент опубликован
    if (!contentData.published) {
      return NextResponse.json(
        { error: 'Контент не опубликован' },
        { status: 400 }
      )
    }

    const results: {
      telegramChannel?: { success: boolean; error?: string }
      telegramBot?: { success: boolean; error?: string }
      email?: { success: boolean; sent?: number; failed?: number; errors?: string[] }
    } = {}

    // Публикация в Telegram канал
    if (!skipTelegram) {
      const telegramChannel = process.env.TELEGRAM_CHANNEL || '@bezpauzy_channel'
      const telegramMessage = formatTelegramMessage(content)

      // Если есть изображение, отправляем фото с подписью
      if (content.image) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'
        const imageUrl = content.image.startsWith('http') ? content.image : `${siteUrl}${content.image}`
        
        const photoResult = await sendTelegramChannelPhoto(telegramChannel, imageUrl, telegramMessage)
        results.telegramChannel = photoResult
      } else {
        const messageResult = await sendTelegramChannelMessage(telegramChannel, telegramMessage)
        results.telegramChannel = messageResult
      }

      // Публикация в бот (опционально, если нужно уведомлять пользователей)
      // Для бота можно использовать broadcast или отправку в конкретные чаты
      // Пока пропускаем, так как требуется список пользователей
      console.log('💡 [Publish] Публикация в бот требует дополнительной настройки (список пользователей)')
    }

    // Email рассылка
    if (!skipEmail) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bezpauzy.com'
      const subject = `Новое на сайте "Без |Паузы": ${content.title}`
      const htmlContent = formatEmailHTML(content)
      const textContent = formatEmailText(content)

      const emailResult = await sendNewsletterEmail({
        subject,
        htmlContent,
        textContent,
      })

      results.email = emailResult
    }

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error: any) {
    console.error('❌ [Publish] Ошибка публикации контента:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера', details: error.message },
      { status: 500 }
    )
  }
}

