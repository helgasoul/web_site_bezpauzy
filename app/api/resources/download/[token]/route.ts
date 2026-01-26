import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { generatePersonalizedEPUB } from '@/lib/epub/watermark'
import { logger } from '@/lib/logger'

/**
 * GET /api/resources/download/[token]
 * Скачивание EPUB по уникальному токену
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> | { token: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params)
    const { token } = resolvedParams

    if (!token) {
      return NextResponse.json(
        { error: 'Токен не предоставлен' },
        { status: 400 }
      )
    }

    // Используем service role для доступа к приватному Storage bucket
    const supabase = createServiceRoleClient()

    // Находим покупку по токену
    const { data: purchase, error: findError } = await supabase
      .from('menohub_resource_purchases')
      .select(`
        *,
        resource:menohub_resources(*)
      `)
      .eq('download_token', token)
      .single()

    if (findError || !purchase) {
      return NextResponse.json(
        { error: 'Ссылка недействительна или истекла' },
        { status: 404 }
      )
    }

    // Проверяем статус оплаты
    if (purchase.status !== 'paid') {
      return NextResponse.json(
        { error: 'Оплата не завершена' },
        { status: 403 }
      )
    }

    // Проверяем срок действия токена
    const expiresAt = new Date(purchase.download_token_expires_at)
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Срок действия ссылки истек' },
        { status: 403 }
      )
    }

    // Проверяем лимит скачиваний
    if (purchase.download_count >= purchase.max_downloads) {
      return NextResponse.json(
        { error: 'Достигнут лимит скачиваний' },
        { status: 403 }
      )
    }

    // Увеличиваем счетчик скачиваний
    const { error: updateError } = await supabase
      .from('menohub_resource_purchases')
      .update({
        download_count: purchase.download_count + 1,
        last_downloaded_at: new Date().toISOString(),
      })
      .eq('id', purchase.id)

    if (updateError) {
      logger.error('Error updating download count:', updateError)
      // Не прерываем скачивание, если не удалось обновить счетчик
    }

    // Получаем ресурс - может быть массивом или объектом
    const resource = Array.isArray(purchase.resource) 
      ? purchase.resource[0] 
      : purchase.resource
    
    if (!resource || !resource.epub_file_path) {
      return NextResponse.json(
        { error: 'EPUB файл не найден' },
        { status: 404 }
      )
    }

    // Извлекаем bucket и path из epub_file_path
    // Формат: 'epub-files/anti-inflammatory-nutrition.epub'
    const [bucket, ...pathParts] = resource.epub_file_path.split('/')
    const filePath = pathParts.join('/')

    if (!bucket || !filePath) {
      return NextResponse.json(
        { error: 'Неверный путь к файлу' },
        { status: 500 }
      )
    }

    // Загружаем файл из Supabase Storage
    // Используем service role для доступа к приватному bucket
    // Важно: .download() возвращает Blob с бинарными данными
    // НЕ используем transform - это может перекодировать файл
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucket)
      .download(filePath)

    if (downloadError || !fileData) {
      logger.error('Error downloading EPUB from Storage:', downloadError)
      return NextResponse.json(
        { error: 'Ошибка при загрузке файла' },
        { status: 500 }
      )
    }

    // Конвертируем Blob в Buffer (бинарный формат)
    // Важно: arrayBuffer() возвращает бинарные данные БЕЗ перекодировки
    // Это критично для EPUB файлов - они должны оставаться бинарными
    const arrayBuffer = await fileData.arrayBuffer()
    
    // Создаем Buffer из ArrayBuffer
    // Buffer.from(ArrayBuffer) автоматически создает бинарный буфер
    // НЕ указываем encoding - это бинарные данные!
    const buffer = Buffer.from(new Uint8Array(arrayBuffer)) as Buffer
    
    logger.debug('📦 [Download] Файл загружен:', {
      size: buffer.length,
      isZIP: buffer[0] === 0x50 && buffer[1] === 0x4B,
      firstBytes: buffer.slice(0, 4).toString('hex'),
    })

    // Проверяем, что файл не пустой
    if (buffer.length === 0) {
      return NextResponse.json(
        { error: 'EPUB файл пуст или поврежден' },
        { status: 500 }
      )
    }

    // Проверяем, что это действительно EPUB (должен начинаться с ZIP сигнатуры)
    // EPUB - это ZIP архив, должен начинаться с PK (0x50 0x4B)
    if (buffer.length < 2 || buffer[0] !== 0x50 || buffer[1] !== 0x4B) {
      logger.error('⚠️ [Download] Файл не является валидным EPUB/ZIP архивом')
      // Не прерываем, возможно файл правильный, но проверка строгая
    }

    // Генерация персонализированного EPUB с watermark
    let finalBuffer: Buffer = buffer
    
    try {
      finalBuffer = await generatePersonalizedEPUB(buffer, {
        email: purchase.email,
        name: purchase.name,
        purchaseId: purchase.id,
        purchaseDate: purchase.paid_at || purchase.created_at,
        downloadToken: token,
      })
      
      logger.debug('✅ [Download] Персонализированный EPUB создан:', {
        originalSize: buffer.length,
        personalizedSize: finalBuffer.length,
        email: purchase.email,
      })
    } catch (watermarkError: any) {
      logger.error('⚠️ [Download] Ошибка при создании персонализированного EPUB:', {
        error: watermarkError?.message,
        stack: watermarkError?.stack,
      })
      // В случае ошибки используем оригинальный файл
      finalBuffer = buffer
    }

    // Формируем имя файла для скачивания
    // HTTP заголовки не поддерживают Unicode напрямую, поэтому:
    // 1. filename - ASCII fallback для старых браузеров
    // 2. filename* - UTF-8 encoded для современных браузеров (RFC 5987)
    const title = resource.title || 'guide'
    const safeFilename = title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') || 'guide'
    const encodedFilename = encodeURIComponent(title)

    // Возвращаем EPUB файл как бинарные данные
    // Конвертируем Buffer в Uint8Array для NextResponse
    const responseBody = new Uint8Array(finalBuffer)
    return new NextResponse(responseBody, {
      status: 200,
      headers: {
        'Content-Type': 'application/epub+zip',
        'Content-Length': finalBuffer.length.toString(),
        'Content-Disposition': `attachment; filename="${safeFilename}.epub"; filename*=UTF-8''${encodedFilename}.epub`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        // Явно указываем, что это бинарные данные
        'Content-Transfer-Encoding': 'binary',
      },
    })
  } catch (error: any) {
    logger.error('Error in download API:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

