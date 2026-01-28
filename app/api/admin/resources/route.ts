import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/middleware'
import { createServiceRoleClient } from '@/lib/supabase/server'

// GET /api/admin/resources - Получение списка ресурсов
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
      console.warn('Admin resources: Supabase service role not configured')
      return NextResponse.json({
        resources: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      })
    }

    // Получение query параметров
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const resourceType = searchParams.get('resourceType') || ''
    const published = searchParams.get('published') || ''
    const sortBy = searchParams.get('sortBy') || 'order_index'
    const sortOrder = searchParams.get('sortOrder') || 'asc'

    // Вычисляем offset
    const offset = (page - 1) * limit

    // Базовый запрос
    let query = supabase
      .from('menohub_resources')
      .select(
        'id, resource_type, title, slug, description, icon_name, cover_image, pdf_source, pdf_file_path, pdf_filename, category, published, coming_soon, download_count, view_count, order_index, created_at, updated_at',
        { count: 'exact' }
      )

    // Поиск
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`
      )
    }

    // Фильтры
    if (resourceType) {
      query = query.eq('resource_type', resourceType)
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

    const { data: resources, error, count } = await query

    if (error) {
      console.error('Error fetching resources:', error)
      return NextResponse.json(
        { error: 'Ошибка загрузки ресурсов' },
        { status: 500 }
      )
    }

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      resources: resources || [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  } catch (error) {
    console.error('❌ [Admin Resources] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/resources - Создание нового ресурса
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
      resource_type,
      title,
      slug,
      description,
      icon_name,
      cover_image,
      pdf_source,
      pdf_file_path,
      pdf_filename,
      category,
      tags,
      order_index,
      published,
      coming_soon,
      meta_title,
      meta_description,
      meta_keywords,
    } = body

    // Валидация обязательных полей
    if (!resource_type || !title || !slug || !description || !pdf_source || !pdf_file_path || !pdf_filename) {
      return NextResponse.json(
        { error: 'Все обязательные поля должны быть заполнены' },
        { status: 400 }
      )
    }

    // Проверка уникальности slug
    const { data: existingResource } = await supabase
      .from('menohub_resources')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingResource) {
      return NextResponse.json(
        { error: 'Ресурс с таким slug уже существует' },
        { status: 400 }
      )
    }

    // Подготовка данных для вставки
    const resourceData: any = {
      resource_type,
      title,
      slug,
      description,
      icon_name,
      cover_image,
      pdf_source,
      pdf_file_path,
      pdf_filename,
      category,
      tags: tags || [],
      order_index: order_index || 0,
      published: published || false,
      coming_soon: coming_soon || false,
      meta_title: meta_title || title,
      meta_description: meta_description || description,
      meta_keywords: meta_keywords || [],
    }

    // Устанавливаем published_at если ресурс публикуется
    if (published) {
      resourceData.published_at = new Date().toISOString()
    }

    // Вставка ресурса
    const { data: newResource, error: insertError } = await supabase
      .from('menohub_resources')
      .insert(resourceData)
      .select()
      .single()

    if (insertError) {
      console.error('Error creating resource:', insertError)
      return NextResponse.json(
        { error: 'Ошибка создания ресурса' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      resource: newResource,
    }, { status: 201 })
  } catch (error) {
    console.error('❌ [Admin Resources] POST Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
