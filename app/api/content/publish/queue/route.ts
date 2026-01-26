import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

/**
 * GET /api/content/publish/queue
 * Получить задачи из очереди публикации
 * 
 * Query params:
 * - limit: количество задач (по умолчанию 10)
 * - status: фильтр по статусу (по умолчанию 'pending')
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const status = searchParams.get('status') || 'pending'

    const supabase = createServiceRoleClient()

    const { data: queue, error } = await supabase
      .from('menohub_content_publish_queue')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('Error fetching publish queue:', error)
      return NextResponse.json(
        { error: 'Ошибка при получении очереди' },
        { status: 500 }
      )
    }

    return NextResponse.json({ queue: queue || [] })
  } catch (error: any) {
    console.error('Error in publish queue API:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/content/publish/queue/process
 * Обработать задачи из очереди публикации
 * Этот endpoint можно вызывать периодически (через cron или вручную)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // Получаем задачи со статусом 'pending'
    const { data: queue, error: queueError } = await supabase
      .from('menohub_content_publish_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10)

    if (queueError) {
      console.error('Error fetching publish queue:', queueError)
      return NextResponse.json(
        { error: 'Ошибка при получении очереди' },
        { status: 500 }
      )
    }

    if (!queue || queue.length === 0) {
      return NextResponse.json({ processed: 0, message: 'Нет задач для обработки' })
    }

    let processed = 0
    let failed = 0

    for (const task of queue) {
      try {
        // Обновляем статус на 'processing'
        await supabase
          .from('menohub_content_publish_queue')
          .update({ status: 'processing' })
          .eq('id', task.id)

        // Вызываем API публикации
        const publishUrl = `${siteUrl}/api/content/publish`
        const response = await fetch(publishUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contentType: task.content_type,
            contentId: task.content_id,
          }),
        })

        const result = await response.json()

        if (response.ok && result.success) {
          // Успешно обработано
          await supabase
            .from('menohub_content_publish_queue')
            .update({
              status: 'completed',
              processed_at: new Date().toISOString(),
            })
            .eq('id', task.id)

          processed++
        } else {
          // Ошибка обработки
          await supabase
            .from('menohub_content_publish_queue')
            .update({
              status: 'failed',
              error_message: result.error || 'Неизвестная ошибка',
              processed_at: new Date().toISOString(),
              retry_count: task.retry_count + 1,
            })
            .eq('id', task.id)

          failed++
        }
      } catch (err: any) {
        console.error(`Error processing task ${task.id}:`, err)
        
        await supabase
          .from('menohub_content_publish_queue')
          .update({
            status: 'failed',
            error_message: err.message || 'Неизвестная ошибка',
            processed_at: new Date().toISOString(),
            retry_count: task.retry_count + 1,
          })
          .eq('id', task.id)

        failed++
      }
    }

    return NextResponse.json({
      processed,
      failed,
      total: queue.length,
    })
  } catch (error: any) {
    console.error('Error in process queue API:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера', details: error.message },
      { status: 500 }
    )
  }
}

