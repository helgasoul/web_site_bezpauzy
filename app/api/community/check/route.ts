import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import * as z from 'zod'

const checkEmailSchema = z.object({
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = checkEmailSchema.parse(body)

    const supabase = await createClient()

    // Check if email exists in community
    const { data: member, error } = await supabase
      .from('menohub_community_members')
      .select('id, email, name, status, joined_at')
      .eq('email', validatedData.email)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error
      throw new Error('Ошибка при проверке данных')
    }

    if (member && member.status === 'active') {
      return NextResponse.json(
        {
          isMember: true,
          member: {
            id: member.id,
            email: member.email,
            name: member.name,
            joinedAt: member.joined_at,
          },
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        isMember: false,
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Неверный формат email', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Community check error:', error)
    return NextResponse.json(
      { error: 'Произошла ошибка при проверке. Пожалуйста, попробуйте позже.' },
      { status: 500 }
    )
  }
}

