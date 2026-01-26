import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { getResourceBySlug } from '@/lib/supabase/resources'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { logger } from '@/lib/logger'

/**
 * GET /api/resources/[slug]/download
 * Прямое скачивание бесплатных гайдов (без токенов, неограниченное количество раз)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> | { slug: string } }
) {
  try {
    // Next.js 14 может возвращать Promise для params
    const resolvedParams = typeof params === 'object' && 'then' in params 
      ? await params 
      : params as { slug: string }
    
    const { slug } = resolvedParams

    if (!slug) {
      logger.error('Slug is missing in request params')
      return NextResponse.json(
        { error: 'Slug не указан' },
        { status: 400 }
      )
    }

    // Получаем ресурс по slug
    const resource = await getResourceBySlug(slug)
    if (!resource) {
      logger.error(`Resource not found for slug: ${slug}`)
      return NextResponse.json(
        { error: `Ресурс не найден: ${slug}` },
        { status: 404 }
      )
    }

    logger.debug(`Found resource: ${resource.title}, isPaid: ${resource.isPaid}, epubFilePath: ${resource.epubFilePath}, pdfFilePath: ${resource.pdfFilePath}`)

    // Проверяем, что ресурс бесплатный
    if (resource.isPaid) {
      return NextResponse.json(
        { error: 'Этот ресурс платный. Используйте токен для скачивания.' },
        { status: 403 }
      )
    }

    // Проверяем, что ресурс опубликован
    if (!resource.published) {
      return NextResponse.json(
        { error: 'Ресурс недоступен' },
        { status: 404 }
      )
    }

    // Получаем путь к файлу
    // Для бесплатных гайдов файл находится в public/guides/
    const filePath = resource.epubFilePath || resource.pdfFilePath
    if (!filePath) {
      logger.error(`No file path found for resource: ${resource.slug}`)
      return NextResponse.json(
        { error: 'Файл не найден в базе данных' },
        { status: 404 }
      )
    }

    // Убираем ведущий слэш для работы с файловой системой
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath

    // Путь к файлу в файловой системе
    // public/guides/файл.epub -> public/guides/файл.epub
    const fullPath = join(process.cwd(), 'public', cleanPath)

    logger.debug(`Attempting to read file from path: ${fullPath}`)
    logger.debug(`File exists: ${existsSync(fullPath)}`)

    // Проверяем существование файла
    if (!existsSync(fullPath)) {
      logger.error(`File not found at path: ${fullPath}`)
      logger.error(`Clean path: ${cleanPath}`)
      logger.error(`Original file path from DB: ${filePath}`)
      return NextResponse.json(
        { 
          error: 'Файл не найден на сервере',
          path: fullPath,
          cleanPath: cleanPath,
          originalPath: filePath
        },
        { status: 404 }
      )
    }

    try {
      // Читаем файл из файловой системы
      const fileBuffer = await readFile(fullPath)
      logger.debug(`Successfully read file: ${fullPath}, size: ${fileBuffer.length} bytes`)

      // Определяем MIME тип по расширению
      const isEPUB = filePath.toLowerCase().endsWith('.epub')
      const contentType = isEPUB ? 'application/epub+zip' : 'application/pdf'

      // Формируем имя файла для скачивания
      const title = resource.title || 'guide'
      const safeFilename = title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') || 'guide'
      const encodedFilename = encodeURIComponent(title)
      const extension = isEPUB ? '.epub' : '.pdf'

      // Увеличиваем счетчик скачиваний (необязательно, но полезно для аналитики)
      const supabase = createServiceRoleClient()
      try {
        await supabase.rpc('increment_resource_download_count', {
          resource_id: resource.id,
        })
      } catch (countError) {
        // Не прерываем скачивание, если не удалось обновить счетчик
        logger.error('Error incrementing download count:', countError)
      }

      // Возвращаем файл
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Length': fileBuffer.length.toString(),
          'Content-Disposition': `attachment; filename="${safeFilename}${extension}"; filename*=UTF-8''${encodedFilename}${extension}`,
          'Cache-Control': 'public, max-age=3600', // Кэшируем на 1 час для бесплатных гайдов
        },
      })
    } catch (fileError: any) {
      logger.error('Error reading file:', fileError)
      logger.error(`File path attempted: ${fullPath}`)
      logger.error(`Original file path from DB: ${filePath}`)
      return NextResponse.json(
        { 
          error: 'Ошибка при чтении файла',
          details: fileError.message,
          path: fullPath
        },
        { status: 500 }
      )
    }
  } catch (error: any) {
    logger.error('Error in free download API:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
