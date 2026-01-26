import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

/**
 * Сохраняет контент в подборку пользователя
 * 
 * Предполагаемая структура таблицы:
 * CREATE TABLE menohub_user_saved_content (
 *   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
 *   user_id BIGINT NOT NULL REFERENCES menohub_users(id),
 *   content_type TEXT NOT NULL, -- 'article', 'quiz', 'checklist'
 *   content_id TEXT NOT NULL, -- slug для статьи, id для квиза/чек-листа
 *   title TEXT NOT NULL,
 *   description TEXT,
 *   url TEXT NOT NULL, -- путь к контенту
 *   metadata JSONB, -- дополнительная информация (категория, автор и т.д.)
 *   saved_at TIMESTAMPTZ DEFAULT NOW(),
 *   UNIQUE(user_id, content_type, content_id)
 * );
 */

// POST - сохранить контент
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('telegram_session')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Необходимо войти в аккаунт' },
        { status: 401 }
      )
    }

    // Декодируем сессию
    let sessionData
    try {
      let decodedToken
      try {
        decodedToken = decodeURIComponent(sessionToken)
      } catch (e) {
        decodedToken = sessionToken
      }
      sessionData = JSON.parse(Buffer.from(decodedToken, 'base64').toString())
    } catch {
      return NextResponse.json(
        { error: 'Неверная сессия' },
        { status: 401 }
      )
    }

    const userId = typeof sessionData.userId === 'string' 
      ? parseInt(sessionData.userId, 10) 
      : sessionData.userId

    const body = await request.json()
    const { content_type, content_id, title, description, url, metadata } = body

    if (!content_type || !content_id || !title || !url) {
      return NextResponse.json(
        { error: 'Не все обязательные поля заполнены' },
        { status: 400 }
      )
    }

    if (!['article', 'quiz', 'checklist'].includes(content_type)) {
      return NextResponse.json(
        { error: 'Неверный тип контента' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Сохраняем контент
    const { data, error } = await supabase
      .from('menohub_user_saved_content')
      .upsert({
        user_id: userId,
        content_type,
        content_id,
        title,
        description: description || null,
        url,
        metadata: metadata || null,
        saved_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,content_type,content_id',
      })
      .select()
      .single()

    if (error) {
      // Если таблица не существует, возвращаем ошибку
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return NextResponse.json(
          { error: 'Таблица сохраненного контента еще не создана. Обратитесь к администратору.' },
          { status: 500 }
        )
      }

      console.error('[saved-content] Error saving content:', error)
      return NextResponse.json(
        { error: 'Ошибка при сохранении контента' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      saved_content: data,
    })
  } catch (error: any) {
    console.error('[saved-content] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

// GET - получить сохраненный контент
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('telegram_session')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Необходимо войти в аккаунт' },
        { status: 401 }
      )
    }

    // Декодируем сессию
    let sessionData
    try {
      let decodedToken
      try {
        decodedToken = decodeURIComponent(sessionToken)
      } catch (e) {
        decodedToken = sessionToken
      }
      sessionData = JSON.parse(Buffer.from(decodedToken, 'base64').toString())
    } catch {
      return NextResponse.json(
        { error: 'Неверная сессия' },
        { status: 401 }
      )
    }

    const userId = typeof sessionData.userId === 'string' 
      ? parseInt(sessionData.userId, 10) 
      : sessionData.userId

    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const contentType = searchParams.get('content_type') // опциональный фильтр

    let query = supabase
      .from('menohub_user_saved_content')
      .select('*')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false })

    if (contentType && ['article', 'quiz', 'checklist'].includes(contentType)) {
      query = query.eq('content_type', contentType)
    }

    const { data: savedContent, error } = await query

    if (error) {
      // Если таблица не существует, возвращаем пустой массив
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return NextResponse.json({
          saved_content: [],
          count: 0,
          message: 'Таблица сохраненного контента еще не создана'
        })
      }
      
      console.error('[saved-content] Error fetching content:', error)
      return NextResponse.json(
        { error: 'Ошибка при загрузке контента' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      saved_content: savedContent || [],
      count: savedContent?.length || 0
    })
  } catch (error: any) {
    console.error('[saved-content] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

// DELETE - удалить сохраненный контент
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get('telegram_session')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Необходимо войти в аккаунт' },
        { status: 401 }
      )
    }

    // Декодируем сессию
    let sessionData
    try {
      let decodedToken
      try {
        decodedToken = decodeURIComponent(sessionToken)
      } catch (e) {
        decodedToken = sessionToken
      }
      sessionData = JSON.parse(Buffer.from(decodedToken, 'base64').toString())
    } catch {
      return NextResponse.json(
        { error: 'Неверная сессия' },
        { status: 401 }
      )
    }

    const userId = typeof sessionData.userId === 'string' 
      ? parseInt(sessionData.userId, 10) 
      : sessionData.userId

    const searchParams = request.nextUrl.searchParams
    const contentId = searchParams.get('id')

    if (!contentId) {
      return NextResponse.json(
        { error: 'Не указан ID контента для удаления' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('menohub_user_saved_content')
      .delete()
      .eq('id', contentId)
      .eq('user_id', userId)

    if (error) {
      console.error('[saved-content] Error deleting content:', error)
      return NextResponse.json(
        { error: 'Ошибка при удалении контента' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[saved-content] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

