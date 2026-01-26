import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Маппинг ID гайдов на имена файлов
const guideFiles: Record<string, { filename: string, displayName: string }> = {
  'anti-inflammatory-nutrition': {
    filename: 'anti-inflammatory-nutrition.pdf',
    displayName: 'Гайд по противовоспалительному питанию.pdf'
  },
  'sleep-improvement': {
    filename: 'Гайд_по_улучшению_сна_в_менопаузе.pdf',
    displayName: 'Гайд по улучшению сна в менопаузе.pdf'
  },
  'hot-flashes-management': {
    filename: 'Гайд_по_управлению_приливами.pdf',
    displayName: 'Гайд по управлению приливами.pdf'
  },
  'bone-health': {
    filename: 'Гайд_по_здоровью_костей_в_менопаузе.pdf',
    displayName: 'Гайд по здоровью костей в менопаузе.pdf'
  },
  // Добавьте другие гайды здесь
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ guideId: string }> | { guideId: string } }
) {
  try {
    // В Next.js 15 params может быть Promise
    const resolvedParams = await Promise.resolve(params)
    const { guideId } = resolvedParams

    // Проверяем, есть ли готовый PDF файл для этого гайда
    const guideFile = guideFiles[guideId]
    
    if (!guideFile) {
      return NextResponse.json(
        { error: 'Гайд не найден' },
        { status: 404 }
      )
    }

    // Путь к PDF файлу в папке public/guides
    const filePath = join(process.cwd(), 'public', 'guides', guideFile.filename)
    
    // Пробуем прочитать файл через fs
    if (existsSync(filePath)) {
      try {
        const fileBuffer = readFileSync(filePath)
        console.log(`✅ Файл прочитан через fs: ${guideFile.filename}, размер: ${fileBuffer.length} байт`)
        
        // Возвращаем PDF файл
        // Преобразуем Buffer в Uint8Array для совместимости с NextResponse
        return new NextResponse(new Uint8Array(fileBuffer), {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${guideFile.displayName}"`,
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        })
      } catch (fileError: any) {
        console.error(`❌ Ошибка при чтении файла через fs: ${fileError?.message}`)
      }
    }
    
    // Если файл не найден через fs, но доступен через Next.js static serving,
    // получаем его через внутренний fetch (только в development)
    // В production файл должен быть доступен через fs
    try {
      const baseUrl = request.nextUrl.origin
      const staticUrl = `${baseUrl}/guides/${guideFile.filename}`
      console.log(`📎 Пробую получить файл через статический URL: ${staticUrl}`)
      
      // Используем абсолютный URL для fetch (не через request.url, чтобы избежать циклов)
      const response = await fetch(staticUrl, {
        headers: {
          'Accept': 'application/pdf',
        },
      })
      
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer()
        const fileBuffer = Buffer.from(new Uint8Array(arrayBuffer)) as Buffer
        console.log(`✅ Файл получен через статический URL, размер: ${fileBuffer.length} байт`)
        
        // Преобразуем Buffer в Uint8Array для совместимости с NextResponse
        return new NextResponse(new Uint8Array(fileBuffer), {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${guideFile.displayName}"`,
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        })
      }
    } catch (fetchError: any) {
      console.error(`❌ Ошибка при получении файла через fetch: ${fetchError?.message}`)
    }
    
    // Если ничего не помогло, возвращаем 404
    return NextResponse.json(
      { 
        error: 'Файл гайда не найден',
        details: process.env.NODE_ENV === 'development' 
          ? `Файл не найден. Ожидаемый путь: ${filePath}` 
          : undefined
      },
      { status: 404 }
    )
  } catch (error: any) {
    console.error('❌ Ошибка при загрузке гайда:', error)
    return NextResponse.json(
      { 
        error: 'Ошибка при загрузке гайда',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    )
  }
}

