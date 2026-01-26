import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { generatePersonalizedEPUB } from '@/lib/epub/watermark'
import { logger } from '@/lib/logger'

/**
 * GET /api/book/download/[token]
 * Скачивание EPUB книги по уникальному токену
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

    const supabase = createServiceRoleClient()

    // Находим заказ по токену
    const { data: order, error: findError } = await supabase
      .from('menohub_book_orders')
      .select('*')
      .eq('download_token', token)
      .single()

    if (findError || !order) {
      return NextResponse.json(
        { error: 'Ссылка недействительна или истекла' },
        { status: 404 }
      )
    }

    // Книга доступна только в цифровом формате

    // Проверяем статус оплаты
    if (order.status !== 'paid') {
      return NextResponse.json(
        { error: 'Оплата не завершена' },
        { status: 403 }
      )
    }

    // Проверяем срок действия токена
    if (order.download_token_expires_at) {
      const expiresAt = new Date(order.download_token_expires_at)
      if (expiresAt < new Date()) {
        return NextResponse.json(
          { error: 'Срок действия ссылки истек' },
          { status: 403 }
        )
      }
    }

    // Проверяем лимит скачиваний
    const maxDownloads = order.max_downloads || 10
    if (order.download_count >= maxDownloads) {
      return NextResponse.json(
        { error: 'Достигнут лимит скачиваний' },
        { status: 403 }
      )
    }

    // Увеличиваем счетчик скачиваний
    const { error: updateError } = await supabase
      .from('menohub_book_orders')
      .update({
        download_count: (order.download_count || 0) + 1,
        last_downloaded_at: new Date().toISOString(),
      })
      .eq('id', order.id)

    if (updateError) {
      logger.error('Error updating download count:', updateError)
      // Не прерываем скачивание, если не удалось обновить счетчик
    }

    // Получаем путь к файлу
    const epubFilePath = order.epub_file_path || 'epub-files/menopauza-novoe-videnie.epub'

    // Извлекаем bucket и path из epub_file_path
    // Формат: 'epub-files/book.epub'
    const [bucket, ...pathParts] = epubFilePath.split('/')
    const filePath = pathParts.join('/')

    if (!bucket || !filePath) {
      return NextResponse.json(
        { error: 'Неверный путь к файлу' },
        { status: 500 }
      )
    }

    // Загружаем файл из Supabase Storage
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
    const arrayBuffer = await fileData.arrayBuffer()
    const buffer = Buffer.from(new Uint8Array(arrayBuffer)) as Buffer

    logger.debug('📦 [Book Download] Файл загружен:', {
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
    if (buffer.length < 2 || buffer[0] !== 0x50 || buffer[1] !== 0x4B) {
      logger.error('⚠️ [Book Download] Файл не является валидным EPUB/ZIP архивом')
      // Не прерываем, возможно файл правильный, но проверка строгая
    }

    // Генерация персонализированного EPUB с watermark
    let finalBuffer: Buffer = buffer

    try {
      finalBuffer = await generatePersonalizedEPUB(buffer, {
        email: order.email,
        name: order.name,
        purchaseId: order.id,
        purchaseDate: order.paid_at || order.created_at,
        downloadToken: token,
      })

      logger.debug('✅ [Book Download] Персонализированный EPUB создан:', {
        originalSize: buffer.length,
        personalizedSize: finalBuffer.length,
        email: order.email,
      })
    } catch (watermarkError: any) {
      logger.error('⚠️ [Book Download] Ошибка при создании персонализированного EPUB:', {
        error: watermarkError?.message,
        stack: watermarkError?.stack,
      })
      // В случае ошибки используем оригинальный файл
      finalBuffer = buffer
    }

    // Формируем имя файла для скачивания
    const fileName = `Менопауза-Новое-видение-${order.name || 'book'}.epub`
    
    // Кодируем имя файла для Content-Disposition (поддержка кириллицы)
    const encodedFileName = encodeURIComponent(fileName)
    const asciiFileName = `menopauza-novoe-videnie.epub` // Fallback для старых браузеров

    // Возвращаем файл
    // Конвертируем Buffer в Uint8Array для NextResponse
    const responseBody = new Uint8Array(finalBuffer)
    return new NextResponse(responseBody, {
      status: 200,
      headers: {
        'Content-Type': 'application/epub+zip',
        'Content-Disposition': `attachment; filename="${asciiFileName}"; filename*=UTF-8''${encodedFileName}`,
        'Content-Length': finalBuffer.length.toString(),
        'Content-Transfer-Encoding': 'binary',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error: any) {
    logger.error('[Book Download] Ошибка:', {
      message: error?.message,
      stack: error?.stack,
    })
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

