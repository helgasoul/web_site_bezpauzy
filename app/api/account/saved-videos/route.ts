import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'

// Явно указываем, что этот route динамический (использует cookies)
export const dynamic = 'force-dynamic'

/**
 * GET: Получает сохраненные видео пользователя (только существующие опубликованные видео/подкасты)
 * POST: Добавляет видео/подкаст в подборку пользователя
 */
export async function GET(request: NextRequest) {
  try {
    // Проверяем сессию
    const sessionData = await getSession()

    if (!sessionData) {
      return NextResponse.json(
        { error: 'Необходимо войти в аккаунт' },
        { status: 401 }
      )
    }

    const userId = sessionData.userId
    const supabase = await createClient()

    // Получаем сохраненные видео пользователя
    const { data: savedVideos, error: savedError } = await supabase
      .from('user_saved_videos')
      .select('id, video_id, saved_at')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false })

    if (savedError) {
      if (savedError.code === '42P01' || savedError.message?.includes('does not exist')) {
        return NextResponse.json({
          videos: [],
          count: 0,
          message: 'Таблица сохраненных видео еще не создана'
        })
      }
      
      console.error('[saved-videos] Error fetching saved videos:', savedError)
      return NextResponse.json(
        { error: 'Ошибка при загрузке видео' },
        { status: 500 }
      )
    }

    if (!savedVideos || savedVideos.length === 0) {
      return NextResponse.json({
        videos: [],
        count: 0
      })
    }

    // Получаем информацию о видео из menohub_video_content (только существующие опубликованные)
    const videoIds = savedVideos.map(sv => sv.video_id)
    const { data: videos, error: videosError } = await supabase
      .from('menohub_video_content')
      .select('id, title, slug, description, content_type, thumbnail_url, duration, category_name, video_url')
      .in('id', videoIds)
      .eq('published', true)
      .not('published_at', 'is', null)

    if (videosError) {
      console.error('[saved-videos] Error fetching video content:', videosError)
      return NextResponse.json(
        { error: 'Ошибка при загрузке видео' },
        { status: 500 }
      )
    }

    // Создаем мапу для быстрого поиска
    const savedAtMap = new Map(savedVideos.map(sv => [sv.video_id, sv.saved_at]))
    const savedIdMap = new Map(savedVideos.map(sv => [sv.video_id, sv.id]))

    // Формируем результат (только существующие видео)
    const result = (videos || [])
      .map(video => ({
        id: savedIdMap.get(video.id) || '',
        video_id: video.id,
        title: video.title,
        description: video.description,
        thumbnail_url: video.thumbnail_url,
        duration: video.duration,
        category: video.category_name,
        content_type: video.content_type,
        video_url: video.content_type === 'podcast' 
          ? `/podcasts/nopause/${video.slug}`
          : `/videos/eva-explains/${video.slug}`,
        saved_at: savedAtMap.get(video.id) || new Date().toISOString(),
      }))
      .sort((a, b) => new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime())

    return NextResponse.json({
      videos: result,
      count: result.length
    })
  } catch (error: any) {
    console.error('[saved-videos] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

/**
 * POST: Добавляет видео/подкаст в подборку пользователя
 */
export async function POST(request: NextRequest) {
  try {
    // Проверяем сессию
    const sessionData = await getSession()

    if (!sessionData) {
      return NextResponse.json(
        { error: 'Необходимо войти в аккаунт' },
        { status: 401 }
      )
    }

    const userId = sessionData.userId
    const body = await request.json()
    const { video_id } = body

    if (!video_id) {
      return NextResponse.json(
        { error: 'Не указан video_id' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Проверяем, что видео существует и опубликовано
    const { data: video, error: videoError } = await supabase
      .from('menohub_video_content')
      .select('id, title, description, thumbnail_url, duration, category_name, video_url, slug, content_type')
      .eq('id', video_id)
      .eq('published', true)
      .single()

    if (videoError || !video) {
      return NextResponse.json(
        { error: 'Видео не найдено или не опубликовано' },
        { status: 404 }
      )
    }

    // Добавляем видео в подборку
    const { data: savedVideo, error: saveError } = await supabase
      .from('user_saved_videos')
      .insert({
        user_id: userId,
        video_id: video.id,
        title: video.title,
        description: video.description,
        thumbnail_url: video.thumbnail_url,
        duration: video.duration,
        category: video.category_name,
        video_url: video.content_type === 'podcast' 
          ? `/podcasts/nopause/${video.slug}`
          : `/videos/eva-explains/${video.slug}`,
      })
      .select()
      .single()

    if (saveError) {
      // Если видео уже в подборке (UNIQUE constraint violation)
      if (saveError.code === '23505') {
        return NextResponse.json(
          { error: 'Видео уже добавлено в подборку', already_saved: true },
          { status: 409 }
        )
      }
      
      console.error('[saved-videos] Error saving video:', saveError)
      return NextResponse.json(
        { error: 'Ошибка при сохранении видео' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Видео добавлено в подборку',
      video: savedVideo
    }, { status: 201 })
  } catch (error: any) {
    console.error('[saved-videos] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}