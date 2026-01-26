import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sanitizeInput, sanitizeText } from '@/lib/utils/sanitize'
import * as z from 'zod'

const createTopicSchema = z.object({
  category_id: z.string().uuid(),
  author_email: z.string().email(),
  author_name: z.string().min(2).max(100),
  title: z.string().min(5).max(200),
  content: z.string().min(10).max(5000),
})

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('category_id')

    let query = supabase
      .from('menohub_forum_topics')
      .select(`
        *,
        category:menohub_forum_categories(name, slug)
      `)
      .order('is_pinned', { ascending: false })
      .order('last_reply_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    const { data, error } = await query.limit(50)

    if (error) {
      console.error('Supabase error:', error)
      throw new Error('Ошибка при загрузке тем')
    }

    return NextResponse.json({ topics: data || [] }, { status: 200 })
  } catch (error) {
    console.error('Forum topics GET error:', error)
    return NextResponse.json(
      { error: 'Произошла ошибка при загрузке тем' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createTopicSchema.parse(body)

    const supabase = await createClient()

    // Санитизация пользовательского контента перед сохранением
    const sanitizedData = {
      category_id: validatedData.category_id,
      author_email: validatedData.author_email.toLowerCase().trim(),
      author_name: sanitizeText(validatedData.author_name),
      title: sanitizeInput(validatedData.title, 200),
      content: sanitizeInput(validatedData.content, 5000),
    }

    const { data: newTopic, error } = await supabase
      .from('menohub_forum_topics')
      .insert(sanitizedData)
      .select()
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      throw new Error('Ошибка при создании темы')
    }

    return NextResponse.json(
      { success: true, topic: newTopic },
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

    console.error('Forum topic POST error:', error)
    return NextResponse.json(
      { error: 'Произошла ошибка при создании темы' },
      { status: 500 }
    )
  }
}

