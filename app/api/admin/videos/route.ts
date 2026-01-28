import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/middleware'
import { createServiceRoleClient } from '@/lib/supabase/server'

// GET /api/admin/videos - Get all videos with filters
export async function GET(request: NextRequest) {
  try {
    const { admin, error } = await requireAdmin(request)
    if (!admin || error) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      )
    }

    // Проверяем доступ (content_manager или super_admin)
    if (admin.role !== 'super_admin' && admin.role !== 'content_manager') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const supabase = createServiceRoleClient()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const contentType = searchParams.get('contentType') || ''
    const category = searchParams.get('category') || ''
    const published = searchParams.get('published') || ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const offset = (page - 1) * limit

    // Строим запрос
    let query = supabase
      .from('menohub_video_content')
      .select('id, title, slug, description, content_type, video_type, video_url, thumbnail_url, duration, category, category_name, access_level, published, published_at, views_count, created_at, podcast_series, guest_expert_name, topic, doctor_name, doctor_specialty', { count: 'exact' })

    // Поиск по названию, описанию, эксперту, доктору
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,guest_expert_name.ilike.%${search}%,doctor_name.ilike.%${search}%,topic.ilike.%${search}%`)
    }

    // Фильтр по типу контента
    if (contentType) {
      query = query.eq('content_type', contentType)
    }

    // Фильтр по категории
    if (category) {
      query = query.eq('category', category)
    }

    // Фильтр по статусу публикации
    if (published === 'true') {
      query = query.eq('published', true)
    } else if (published === 'false') {
      query = query.eq('published', false)
    }

    // Сортировка
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    const { data: videos, error: queryError, count } = await query

    if (queryError) {
      console.error('❌ [Admin Videos] Query error:', queryError)
      return NextResponse.json(
        { error: 'Database query failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      videos: videos || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('❌ [Admin Videos] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/videos - Create new video
export async function POST(request: NextRequest) {
  try {
    const { admin, error } = await requireAdmin(request)
    if (!admin || error) {
      return NextResponse.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      )
    }

    if (admin.role !== 'super_admin' && admin.role !== 'content_manager') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const supabase = createServiceRoleClient()

    // Validate required fields
    const {
      title,
      slug,
      description,
      content_type,
      video_url,
      video_type,
      thumbnail_url,
      duration,
      category,
      category_name,
      access_level = 'free'
    } = body

    if (!title || !slug || !description || !content_type || !video_url || !thumbnail_url || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Insert video
    const { data: video, error: insertError } = await supabase
      .from('menohub_video_content')
      .insert({
        title,
        slug,
        description,
        content_type,
        video_url,
        video_type: video_type || 'youtube',
        video_id: body.video_id || null,
        storage_bucket: body.storage_bucket || null,
        storage_path: body.storage_path || null,
        thumbnail_url,
        duration: duration || 0,
        category,
        category_name,
        meta_title: body.meta_title || null,
        meta_description: body.meta_description || null,
        meta_keywords: body.meta_keywords || null,
        access_level,
        published: body.published || false,
        published_at: body.published ? new Date().toISOString() : null,
        tags: body.tags || [],
        transcript: body.transcript || null,
        timestamps: body.timestamps || null,
        related_articles: body.related_articles || null,
        related_videos: body.related_videos || null,
        // Podcast fields
        podcast_series: body.podcast_series || null,
        guest_expert_id: body.guest_expert_id || null,
        guest_expert_name: body.guest_expert_name || null,
        guest_expert_role: body.guest_expert_role || null,
        guest_expert_avatar: body.guest_expert_avatar || null,
        host_name: body.host_name || null,
        // Eva explains
        topic: body.topic || null,
        // Doctors explain
        doctor_id: body.doctor_id || null,
        doctor_name: body.doctor_name || null,
        doctor_specialty: body.doctor_specialty || null,
        doctor_credentials: body.doctor_credentials || null,
        doctor_avatar: body.doctor_avatar || null,
        created_by: admin.id,
      })
      .select()
      .single()

    if (insertError) {
      console.error('❌ [Admin Videos] Insert error:', insertError)
      return NextResponse.json(
        { error: insertError.message || 'Failed to create video' },
        { status: 500 }
      )
    }

    return NextResponse.json({ video }, { status: 201 })
  } catch (error: any) {
    console.error('❌ [Admin Videos] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
