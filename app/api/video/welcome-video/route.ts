import { NextRequest, NextResponse } from 'next/server'
import { createReadStream, statSync, existsSync } from 'fs'
import { join } from 'path'

// Явно указываем, что этот route динамический (использует request.headers)
export const dynamic = 'force-dynamic'

/** URL видео в Supabase Storage (или любой CDN). Если задан — стримим через API (без редиректа, чтобы плеер стабильно работал). */
const WELCOME_VIDEO_URL = process.env.WELCOME_VIDEO_URL

export async function GET(request: NextRequest) {
  // Если задан URL видео — проксируем стрим (редирект часто ломает <video> и CORS)
  if (WELCOME_VIDEO_URL?.startsWith('http')) {
    const range = request.headers.get('range')
    const headers: Record<string, string> = {}
    if (range) headers['Range'] = range
    const res = await fetch(WELCOME_VIDEO_URL, { headers })
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Video unavailable', status: res.status },
        { status: res.status === 404 ? 404 : 502 }
      )
    }
    const contentType = res.headers.get('content-type') || 'video/mp4'
    const contentLength = res.headers.get('content-length')
    const acceptRanges = res.headers.get('accept-ranges') || 'bytes'
    const contentRange = res.headers.get('content-range')
    const outHeaders: Record<string, string> = {
      'Content-Type': contentType,
      'Accept-Ranges': acceptRanges,
      'Cache-Control': 'public, max-age=3600',
    }
    if (contentLength) outHeaders['Content-Length'] = contentLength
    if (contentRange) outHeaders['Content-Range'] = contentRange
    return new NextResponse(res.body, {
      status: res.status,
      headers: outHeaders,
    })
  }

  try {
    const filePath = join(process.cwd(), 'public', 'welcome-video.mp4')

    if (!existsSync(filePath)) {
      return NextResponse.json(
        {
          error: 'Video file not found',
          hint: 'Add welcome-video.mp4 to public/ or set WELCOME_VIDEO_URL to your Supabase Storage URL',
          path: filePath,
        },
        { status: 404 }
      )
    }

    // Проверяем, существует ли файл
    const stats = statSync(filePath)
    
    // Получаем диапазон запроса (для поддержки range requests)
    const range = request.headers.get('range')
    
    if (range) {
      // Поддержка range requests для видео
      const parts = range.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1
      const chunksize = end - start + 1
      
      const file = createReadStream(filePath, { start, end })
      const head = {
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize.toString(),
        'Content-Type': 'video/mp4',
      }
      
      return new NextResponse(file as any, {
        status: 206,
        headers: head,
      })
    } else {
      // Полный файл
      const file = createReadStream(filePath)
      return new NextResponse(file as any, {
        headers: {
          'Content-Type': 'video/mp4',
          'Content-Length': stats.size.toString(),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    }
  } catch (error: any) {
    console.error('Error serving video:', error)
    if (error.code === 'ENOENT') {
      return NextResponse.json(
        { error: 'Video file not found', path: join(process.cwd(), 'public', 'welcome-video.mp4') },
        { status: 404 }
      )
    }
    // Логируем только в development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in welcome-video API:', error)
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

