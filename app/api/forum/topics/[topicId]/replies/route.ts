import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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

    const { data: newReply, error } = await supabase
      .from('menohub_forum_replies')
      .insert({
        topic_id: params.topicId,
        author_email: validatedData.author_email,
        author_name: validatedData.author_name,
        content: validatedData.content,
      })
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
      return NextResponse.json(
        { error: 'Неверные данные', details: error.errors },
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

