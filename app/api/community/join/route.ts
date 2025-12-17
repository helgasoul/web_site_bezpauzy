import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
// import { sendWelcomeEmail } from '@/lib/email/send-welcome-email' // Отключено до настройки email-сервиса
import * as z from 'zod'

const communityJoinSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  age: z.string().min(1),
  location: z.string().optional(),
  interests: z.array(z.string()).optional(),
  consent: z.boolean().refine((val) => val === true),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = communityJoinSchema.parse(body)

    // Create Supabase client
    const supabase = await createClient()

    // Check if email already exists
    const { data: existingMember, error: checkError } = await supabase
      .from('menohub_community_members')
      .select('id, email')
      .eq('email', validatedData.email)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is fine
      throw new Error('Ошибка при проверке данных')
    }

    if (existingMember) {
      return NextResponse.json(
        { error: 'Этот email уже зарегистрирован в сообществе' },
        { status: 400 }
      )
    }

    // Insert new member
    const { data: newMember, error: insertError } = await supabase
      .from('menohub_community_members')
      .insert({
        name: validatedData.name,
        email: validatedData.email,
        age: validatedData.age,
        location: validatedData.location || null,
        interests: validatedData.interests || [],
        status: 'active',
        joined_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      console.error('Supabase insert error:', insertError)
      throw new Error('Ошибка при сохранении данных')
    }

    // TODO: Отправка приветственного письма
    // Раскомментируйте после настройки Resend или другого email-сервиса
    // sendWelcomeEmail({
    //   to: validatedData.email,
    //   name: validatedData.name,
    // }).catch((error) => {
    //   console.error('Failed to send welcome email:', error)
    // })

    return NextResponse.json(
      {
        success: true,
        message: 'Вы успешно присоединились к сообществу',
        member: {
          id: newMember.id,
          email: newMember.email,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Неверные данные формы', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Community join error:', error)
    return NextResponse.json(
      { error: 'Произошла ошибка при регистрации. Пожалуйста, попробуйте позже.' },
      { status: 500 }
    )
  }
}

