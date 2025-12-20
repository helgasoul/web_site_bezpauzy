import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('menohub_forum_categories')
      .select('*')
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      throw new Error('Ошибка при загрузке категорий')
    }

    return NextResponse.json({ categories: data || [] }, { status: 200 })
  } catch (error) {
    console.error('Forum categories GET error:', error)
    return NextResponse.json(
      { error: 'Произошла ошибка при загрузке категорий' },
      { status: 500 }
    )
  }
}

