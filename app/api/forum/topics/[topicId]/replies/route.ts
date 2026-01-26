import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sanitizeInput, sanitizeText } from '@/lib/utils/sanitize'
import * as z from 'zod'

const createReplySchema = z.object({
  author_email: z.string().email(),
  author_name: z.string().min(2).max(100),
  content: z.string().min(5).max(3000),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { topicId: string } }
) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('menohub_forum_replies')
      .select('*')
      .eq('topic_id', params.topicId)
      .eq('is_approved', true)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      throw new Error('Ошибка при загрузке ответов')
    }

    return NextResponse.json({ replies: data || [] }, { status: 200 })
  } catch (error) {
    console.error('Forum replies GET error:', error)
    return NextResponse.json(
      { error: 'Произошла ошибка при загрузке ответов' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { topicId: string } }
) {
  try {
    const body = await request.json()
    const validatedData = createReplySchema.parse(body)

    const supabase = await createClient()

    // Санитизация пользовательского контента перед сохранением
    const sanitizedData = {
      topic_id: params.topicId,
      author_email: validatedData.author_email.toLowerCase().trim(),
      author_name: sanitizeText(validatedData.author_name),
      content: sanitizeInput(validatedData.content, 3000),
    }

    const { data: newReply, error } = await supabase
      .from('menohub_forum_replies')
      .insert(sanitizedData)
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      throw new Error('Ошибка при создании ответа')
    }

    return NextResponse.json(
      { success: true, reply: newReply },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Детали валидации можно показывать, но только в development для безопасности
      return NextResponse.json(
        {
          error: 'Неверные данные',
          ...(process.env.NODE_ENV === 'development' && { details: error.errors }),
        },
        { status: 400 }
      )
    }

    console.error('Forum reply POST error:', error)
    return NextResponse.json(
      { error: 'Произошла ошибка при создании ответа' },
      { status: 500 }
    )
  }
}

const updateReplySchema = z.object({
  content: z.string().trim().min(5, 'Комментарий должен содержать минимум 5 символов').max(3000, 'Комментарий слишком длинный'),
  author_email: z.string().email().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { topicId: string } }
) {
  try {
    const url = new URL(request.url)
    const replyId = url.searchParams.get('replyId')
    
    if (!replyId) {
      return NextResponse.json(
        { error: 'ID комментария обязателен' },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Проверяем, что content существует и является строкой
    if (!body.content || typeof body.content !== 'string') {
      return NextResponse.json(
        { error: 'Содержимое комментария обязательно' },
        { status: 400 }
      )
    }

    // Trim перед валидацией
    const trimmedContent = body.content.trim()
    if (trimmedContent.length < 5) {
      return NextResponse.json(
        { error: 'Комментарий должен содержать минимум 5 символов' },
        { status: 400 }
      )
    }

    const validatedData = updateReplySchema.parse({
      content: trimmedContent,
      author_email: body.author_email,
    })
    
    // Получаем email из localStorage через клиентскую часть или из cookie
    // В этом API мы будем проверять авторство через Supabase
    const supabase = await createClient()

    // Сначала получаем текущий комментарий для проверки авторства
    const { data: currentReply, error: fetchError } = await supabase
      .from('menohub_forum_replies')
      .select('author_email, topic_id')
      .eq('id', replyId)
      .single()

    if (fetchError || !currentReply) {
      return NextResponse.json(
        { error: 'Комментарий не найден' },
        { status: 404 }
      )
    }

    // Проверяем, что комментарий принадлежит данной теме
    if (currentReply.topic_id !== params.topicId) {
      return NextResponse.json(
        { error: 'Неверный ID темы' },
        { status: 400 }
      )
    }

    // Для проверки авторства нужно получить email пользователя
    // Из тела запроса или из сессии (если есть авторизация)
    const userEmail = body.author_email || url.searchParams.get('author_email')
    
    if (!userEmail || currentReply.author_email.toLowerCase() !== userEmail.toLowerCase()) {
      return NextResponse.json(
        { error: 'Вы можете редактировать только свои комментарии' },
        { status: 403 }
      )
    }

    // Санитизация контента
    const sanitizedContent = sanitizeInput(validatedData.content, 3000)
    
    // Проверяем, что после санитизации контент не стал слишком коротким
    if (sanitizedContent.trim().length < 5) {
      return NextResponse.json(
        { error: 'Комментарий должен содержать минимум 5 символов после обработки' },
        { status: 400 }
      )
    }

    const { data: updatedReply, error: updateError } = await supabase
      .from('menohub_forum_replies')
      .update({ 
        content: sanitizedContent,
        updated_at: new Date().toISOString()
      })
      .eq('id', replyId)
      .eq('author_email', userEmail.toLowerCase())
      .select()
      .single()

    if (updateError) {
      console.error('Supabase update error:', updateError)
      return NextResponse.json(
        { error: 'Ошибка при обновлении комментария' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, reply: updatedReply },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Неверные данные',
          ...(process.env.NODE_ENV === 'development' && { details: error.errors }),
        },
        { status: 400 }
      )
    }

    console.error('Forum reply PUT error:', error)
    return NextResponse.json(
      { error: 'Произошла ошибка при обновлении комментария' },
      { status: 500 }
    )
  }
}
