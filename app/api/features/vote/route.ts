import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { featureName, voteType } = body

    // Validate input
    if (!featureName || !voteType) {
      return NextResponse.json(
        { error: 'featureName and voteType are required' },
        { status: 400 }
      )
    }

    if (voteType !== 'up' && voteType !== 'down') {
      return NextResponse.json(
        { error: 'voteType must be "up" or "down"' },
        { status: 400 }
      )
    }

    // Get user session (optional - allow anonymous votes)
    const supabase = await createClient()
    
    // Try to get user_id from telegram session cookie
    let userId: number | null = null
    const cookieHeader = request.headers.get('cookie')
    
    if (cookieHeader) {
      const cookies = Object.fromEntries(
        cookieHeader.split('; ').map(c => {
          const [key, ...values] = c.split('=')
          return [key.trim(), values.join('=')]
        })
      )
      const telegramSession = cookies.telegram_session
      if (telegramSession) {
        try {
          const decoded = JSON.parse(decodeURIComponent(telegramSession))
          userId = decoded.userId || null
        } catch (e) {
          // Ignore parsing errors - allow anonymous votes
        }
      }
    }

    // Insert or update vote
    const { data, error } = await supabase
      .from('feature_votes')
      .upsert(
        {
          user_id: userId,
          feature_name: featureName,
          vote_type: voteType,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,feature_name',
        }
      )
      .select()
      .single()

    if (error) {
      // Логируем только в development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving vote:', error)
      }
      return NextResponse.json(
        {
          error: 'Failed to save vote',
          ...(process.env.NODE_ENV === 'development' && { details: error.message }),
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      vote: data,
      message: 'Голос сохранён. Спасибо за вашу обратную связь!',
    })
  } catch (error: any) {
    console.error('Error in vote API:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve vote statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featureName = searchParams.get('featureName')

    const supabase = await createClient()

    if (featureName) {
      // Get votes for specific feature
      const { data, error } = await supabase
        .from('feature_votes')
        .select('vote_type')
        .eq('feature_name', featureName)

      if (error) {
        console.error('Error fetching votes:', error)
        return NextResponse.json(
          { error: 'Failed to fetch votes' },
          { status: 500 }
        )
      }

      const upVotes = data.filter(v => v.vote_type === 'up').length
      const downVotes = data.filter(v => v.vote_type === 'down').length

      return NextResponse.json({
        featureName,
        upVotes,
        downVotes,
        totalVotes: data.length,
      })
    } else {
      // Get all votes grouped by feature
      const { data, error } = await supabase
        .from('feature_votes')
        .select('feature_name, vote_type')

      if (error) {
        console.error('Error fetching votes:', error)
        return NextResponse.json(
          { error: 'Failed to fetch votes' },
          { status: 500 }
        )
      }

      // Group by feature
      const stats = data.reduce((acc: any, vote) => {
        if (!acc[vote.feature_name]) {
          acc[vote.feature_name] = { upVotes: 0, downVotes: 0 }
        }
        if (vote.vote_type === 'up') {
          acc[vote.feature_name].upVotes++
        } else {
          acc[vote.feature_name].downVotes++
        }
        return acc
      }, {})

      return NextResponse.json({ stats })
    }
  } catch (error: any) {
    // Логируем только в development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in vote API:', error)
    }
    return NextResponse.json(
      {
        error: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { message: error.message }),
      },
      { status: 500 }
    )
  }
}

