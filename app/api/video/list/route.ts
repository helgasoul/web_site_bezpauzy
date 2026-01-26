import { NextRequest, NextResponse } from 'next/server'
import { getPublishedVideos } from '@/lib/video/get-videos'
import type { VideoContentType, VideoCategory, VideoAccessLevel } from '@/lib/video/get-videos'

// Явно указываем, что этот route динамический (использует searchParams)
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') as VideoContentType | null
    const category = searchParams.get('category') as VideoCategory | null
    const access = searchParams.get('access') as VideoAccessLevel | null
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined

    const videos = await getPublishedVideos({
      contentType: type || undefined,
      category: category || undefined,
      accessLevel: access || undefined,
      limit,
    })

    return NextResponse.json({ videos })
  } catch (error) {
    console.error('Error in /api/video/list:', error)
    return NextResponse.json(
      { error: 'Internal server error', videos: [] },
      { status: 500 }
    )
  }
}

