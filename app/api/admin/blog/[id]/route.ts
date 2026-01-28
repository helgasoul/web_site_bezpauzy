import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/middleware'
import { createServiceRoleClient } from '@/lib/supabase/server'

// GET /api/admin/blog/[id] - Получение статьи по ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const postId = params.id

    // Получаем статью
    const { data: post, error } = await supabase
      .from('menohub_blog_posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (error) {
      console.error('Error fetching blog post:', error)
      return NextResponse.json(
        { error: 'Статья не найдена' },
        { status: 404 }
      )
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('❌ [Admin Blog] GET Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/admin/blog/[id] - Обновление статьи
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const postId = params.id
    const body = await request.json()

    // Получаем текущую статью
    const { data: currentPost, error: fetchError } = await supabase
      .from('menohub_blog_posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (fetchError || !currentPost) {
      return NextResponse.json(
        { error: 'Статья не найдена' },
        { status: 404 }
      )
    }

    // Проверка уникальности slug если он изменился
    if (body.slug && body.slug !== currentPost.slug) {
      const { data: existingPost } = await supabase
        .from('menohub_blog_posts')
        .select('id')
        .eq('slug', body.slug)
        .single()

      if (existingPost) {
        return NextResponse.json(
          { error: 'Статья с таким slug уже существует' },
          { status: 400 }
        )
      }
    }

    // Подготовка обновлений
    const updates: any = {
      ...body,
      updated_at: new Date().toISOString(),
    }

    // Если публикуем статью впервые
    if (body.published && !currentPost.published && !currentPost.published_at) {
      updates.published_at = new Date().toISOString()
    }

    // Если снимаем публикацию
    if (body.published === false && currentPost.published) {
      updates.published_at = null
    }

    // Пересчитываем read_time если изменился content
    if (body.content && body.content !== currentPost.content) {
      const wordCount = body.content.split(/\s+/).length
      updates.read_time = Math.max(1, Math.ceil(wordCount / 200))
    }

    // Обновляем статью
    const { data: updatedPost, error: updateError } = await supabase
      .from('menohub_blog_posts')
      .update(updates)
      .eq('id', postId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating blog post:', updateError)
      return NextResponse.json(
        { error: 'Ошибка обновления статьи' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      post: updatedPost,
    })
  } catch (error) {
    console.error('❌ [Admin Blog] PATCH Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/blog/[id] - Удаление статьи
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { admin, error: authError } = await requireAdmin(request)
    if (!admin || authError) {
      return NextResponse.json(
        { error: authError || 'Unauthorized' },
        { status: 401 }
      )
    }

    // Проверка прав доступа (только super_admin может удалять)
    if (admin.role !== 'super_admin') {
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

    const postId = params.id

    // Удаляем статью
    const { error: deleteError } = await supabase
      .from('menohub_blog_posts')
      .delete()
      .eq('id', postId)

    if (deleteError) {
      console.error('Error deleting blog post:', deleteError)
      return NextResponse.json(
        { error: 'Ошибка удаления статьи' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Статья успешно удалена',
    })
  } catch (error) {
    console.error('❌ [Admin Blog] DELETE Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export const dynamic = 'force-dynamic'
