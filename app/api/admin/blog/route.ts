import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/middleware'
import { createServiceRoleClient } from '@/lib/supabase/server'

// GET /api/admin/blog - Получение списка статей
export async function GET(request: NextRequest) {
  try {
    const { admin, error: authError } = await requireAdmin(request)
    if (!admin || authError) {
      return NextResponse.json(
        { error: authError || 'Unauthorized' },
        { status: 401 }
      )
    }

    // Проверка прав доступа (super_admin и content_manager)
    if (admin.role !== 'super_admin' && admin.role !== 'content_manager') {
      return NextResponse.json(
        { error: 'Недостаточно прав доступа' },
        { status: 403 }
      )
    }

    let supabase
    try {
      supabase = createServiceRoleClient()
    } catch (e) {
      console.warn('Admin blog: Supabase service role not configured')
      return NextResponse.json({
        posts: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      })
    }

    // Получение query параметров
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const published = searchParams.get('published') || '' // 'true', 'false', or ''
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Вычисляем offset
    const offset = (page - 1) * limit

    // Базовый запрос
    let query = supabase
      .from('menohub_blog_posts')
      .select(
        'id, title, slug, excerpt, category, category_name, author_name, author_role, image, published, published_at, created_at, updated_at, read_time',
        { count: 'exact' }
      )

    // Поиск
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,excerpt.ilike.%${search}%,author_name.ilike.%${search}%`
      )
    }

    // Фильтры
    if (category) {
      query = query.eq('category', category)
    }

    if (published === 'true') {
      query = query.eq('published', true)
    } else if (published === 'false') {
      query = query.eq('published', false)
    }

    // Сортировка
    const ascending = sortOrder === 'asc'
    query = query.order(sortBy, { ascending })

    // Пагинация
    query = query.range(offset, offset + limit - 1)

    const { data: posts, error, count } = await query

    if (error) {
      console.error('Error fetching blog posts:', error)
      return NextResponse.json(
        { error: 'Ошибка загрузки статей' },
        { status: 500 }
      )
    }

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      posts: posts || [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  } catch (error) {
    console.error('❌ [Admin Blog] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/blog - Создание новой статьи
export async function POST(request: NextRequest) {
  try {
    const { admin, error: authError } = await requireAdmin(request)
    if (!admin || authError) {
      return NextResponse.json(
        { error: authError || 'Unauthorized' },
        { status: 401 }
      )
    }

    // Проверка прав доступа
    if (admin.role !== 'super_admin' && admin.role !== 'content_manager') {
      return NextResponse.json(
        { error: 'Недостаточно прав доступа' },
        { status: 403 }
      )
    }

    let supabase
    try {
      supabase = createServiceRoleClient()
    } catch (e) {
      return NextResponse.json(
        { error: 'Supabase service role not configured' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const {
      title,
      slug,
      excerpt,
      content,
      category,
      category_name,
      author_name,
      author_role,
      author_avatar,
      image,
      published,
      key_takeaways,
      article_references,
      meta_title,
      meta_description,
      meta_keywords,
    } = body

    // Валидация обязательных полей
    if (!title || !slug || !excerpt || !content || !category || !author_name || !author_role || !image) {
      return NextResponse.json(
        { error: 'Все обязательные поля должны быть заполнены' },
        { status: 400 }
      )
    }

    // Проверка уникальности slug
    const { data: existingPost } = await supabase
      .from('menohub_blog_posts')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingPost) {
      return NextResponse.json(
        { error: 'Статья с таким slug уже существует' },
        { status: 400 }
      )
    }

    // Подготовка данных для вставки
    const postData: any = {
      title,
      slug,
      excerpt,
      content,
      category,
      category_name,
      author_name,
      author_role,
      author_avatar,
      image,
      published: published || false,
      key_takeaways: key_takeaways || [],
      article_references: article_references || [],
      meta_title: meta_title || title,
      meta_description: meta_description || excerpt,
      meta_keywords: meta_keywords || [],
      created_by: null, // TODO: связать с admin.id если нужно
    }

    // Устанавливаем published_at если статья публикуется
    if (published) {
      postData.published_at = new Date().toISOString()
    }

    // Вычисляем read_time
    const wordCount = content.split(/\s+/).length
    postData.read_time = Math.max(1, Math.ceil(wordCount / 200))

    // Вставка статьи
    const { data: newPost, error: insertError } = await supabase
      .from('menohub_blog_posts')
      .insert(postData)
      .select()
      .single()

    if (insertError) {
      console.error('Error creating blog post:', insertError)
      return NextResponse.json(
        { error: 'Ошибка создания статьи' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      post: newPost,
    }, { status: 201 })
  } catch (error) {
    console.error('❌ [Admin Blog] POST Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
