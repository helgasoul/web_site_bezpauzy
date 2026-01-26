import { NextRequest, NextResponse } from 'next/server'
import { createReadStream, statSync } from 'fs'
import { join } from 'path'

// Явно указываем, что этот route динамический (использует request.headers)
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const filePath = join(process.cwd(), 'public', 'welcome-video.mp4')
    
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

