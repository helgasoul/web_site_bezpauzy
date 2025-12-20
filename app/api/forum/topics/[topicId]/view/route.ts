import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { topicId: string } }
) {
  try {
    const supabase = await createClient()

    // Increment views count
    const { error } = await supabase.rpc('increment_topic_views', {
      topic_id: params.topicId,
    })

    // If RPC doesn't exist, use update
    if (error) {
      const { data: topic } = await supabase
        .from('menohub_forum_topics')
        .select('views_count')
        .eq('id', params.topicId)
        .single()

      if (topic) {
        await supabase
          .from('menohub_forum_topics')
          .update({ views_count: (topic.views_count || 0) + 1 })
          .eq('id', params.topicId)
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Topic view increment error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

