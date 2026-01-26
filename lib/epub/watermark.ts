import AdmZip from 'adm-zip'
import { XMLParser, XMLBuilder } from 'fast-xml-parser'

interface WatermarkData {
  email: string
  name?: string | null
  purchaseId: string
  purchaseDate: string
  downloadToken: string
}

interface EPUBMetadata {
  title?: string
  creator?: string
  description?: string
  identifier?: string
  language?: string
  [key: string]: any
}

/**
 * Генерация персонализированного EPUB с watermark
 * 
 * EPUB структура:
 * - mimetype (файл, указывающий тип EPUB)
 * - META-INF/container.xml
 * - OEBPS/content.opf (метаданные и манифест)
 * - OEBPS/*.xhtml (контент)
 * - images/ (изображения)
 */
export async function generatePersonalizedEPUB(
  baseEPUBBuffer: Buffer | Buffer<ArrayBufferLike>,
  watermarkData: WatermarkData
): Promise<Buffer> {
  try {
    // Распаковываем EPUB (это ZIP архив)
    const zip = new AdmZip(baseEPUBBuffer)
    const zipEntries = zip.getEntries()

    // Находим файл content.opf (обычно в OEBPS/ или в корне)
    let contentOpfEntry = zipEntries.find(
      (entry) => entry.entryName.endsWith('content.opf') || entry.entryName.endsWith('.opf')
    )

    if (!contentOpfEntry) {
      console.warn('⚠️ [EPUB] content.opf не найден, ищем любой .opf файл')
      contentOpfEntry = zipEntries.find((entry) => entry.entryName.endsWith('.opf'))
    }

    if (!contentOpfEntry) {
      console.error('❌ [EPUB] Не найден .opf файл для модификации metadata')
      // Возвращаем оригинальный файл, если не можем найти metadata
      return baseEPUBBuffer
    }

    // Читаем и парсим content.opf
    // Важно: используем 'utf-8' для правильной обработки кириллицы в XML
    const opfContent = contentOpfEntry.getData().toString('utf-8')
    
    // Проверяем, что файл действительно в UTF-8
    if (!opfContent.includes('<?xml') && !opfContent.includes('encoding')) {
      console.warn('⚠️ [EPUB] content.opf может быть не в UTF-8')
    }
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseAttributeValue: true,
      trimValues: true,
    })
    const opf = parser.parse(opfContent)

    // Модифицируем metadata
    if (!opf.package) {
      console.error('❌ [EPUB] Неверная структура content.opf: отсутствует package')
      console.log('📋 [EPUB] Структура opf:', Object.keys(opf))
      return baseEPUBBuffer
    }

    // Инициализируем metadata, если его нет
    if (!opf.package.metadata) {
      console.warn('⚠️ [EPUB] metadata отсутствует, создаю новую структуру')
      opf.package.metadata = {
        'dc:identifier': [],
        'dc:date': [],
        'meta': [],
      }
    }

    // Безопасно получаем существующие значения
    const getArray = (value: any): any[] => {
      if (Array.isArray(value)) return value
      if (value && typeof value === 'object') return [value]
      if (value) return [{ '#text': value }]
      return []
    }

    // Добавляем watermark информацию в metadata
    const existingIdentifiers = getArray(opf.package.metadata['dc:identifier'])
    const existingDates = getArray(opf.package.metadata['dc:date'])
    const existingMeta = getArray(opf.package.metadata.meta)

    const watermarkInfo = {
      'dc:identifier': [
        ...existingIdentifiers,
        {
          '@_id': 'watermark-id',
          '#text': `purchase-${watermarkData.purchaseId}`,
        },
      ],
      'dc:date': [
        ...existingDates,
        {
          '@_event': 'watermark',
          '#text': watermarkData.purchaseDate,
        },
      ],
      'meta': [
        ...existingMeta,
        {
          '@_name': 'watermark:email',
          '@_content': watermarkData.email,
        },
        {
          '@_name': 'watermark:purchase-id',
          '@_content': watermarkData.purchaseId,
        },
        {
          '@_name': 'watermark:download-token',
          '@_content': watermarkData.downloadToken,
        },
        {
          '@_name': 'watermark:name',
          '@_content': watermarkData.name || watermarkData.email,
        },
        {
          '@_name': 'watermark:purchase-date',
          '@_content': watermarkData.purchaseDate,
        },
      ],
    }

    // Обновляем metadata, сохраняя остальные поля
    opf.package.metadata = {
      ...opf.package.metadata,
      'dc:identifier': watermarkInfo['dc:identifier'],
      'dc:date': watermarkInfo['dc:date'],
      'meta': watermarkInfo['meta'],
    }

    // Конвертируем обратно в XML
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      format: true,
      suppressEmptyNode: false,
    })

    // Убеждаемся, что XML объявление присутствует с правильной кодировкой
    // UTF-8 критичен для поддержки кириллицы
    let xmlDeclaration = '<?xml version="1.0" encoding="UTF-8"?>\n'
    const newOpfContent = xmlDeclaration + builder.build(opf)

    // Обновляем файл в архиве
    // Важно: используем 'utf-8' encoding при создании Buffer для XML
    // Это гарантирует правильную обработку кириллицы
    const opfBuffer = Buffer.from(newOpfContent, 'utf-8')
    zip.updateFile(contentOpfEntry.entryName, opfBuffer)

    // Также добавляем watermark информацию в первый XHTML файл (если есть)
    // Это будет видно при открытии книги
    const firstXhtmlEntry = zipEntries.find(
      (entry) =>
        entry.entryName.endsWith('.xhtml') ||
        (entry.entryName.endsWith('.html') && !entry.entryName.includes('nav'))
    )

    if (firstXhtmlEntry && firstXhtmlEntry.entryName.includes('OEBPS')) {
      try {
        // Читаем XHTML файл с правильной кодировкой UTF-8
        // Это критично для поддержки кириллицы в watermark
        const xhtmlContent = firstXhtmlEntry.getData().toString('utf-8')
        const xhtmlParser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: '@_',
          parseAttributeValue: false,
          trimValues: true,
          preserveOrder: false,
        })
        const xhtml = xhtmlParser.parse(xhtmlContent)

        // Добавляем watermark div в начало body
        if (xhtml.html && xhtml.html.body) {
          const watermarkDiv = {
            div: {
              '@_class': 'watermark',
              '@_style': 'position: fixed; top: 0; left: 0; width: 100%; text-align: center; background: rgba(0,0,0,0.05); padding: 5px; font-size: 10px; color: #999; z-index: 9999;',
              '#text': `Купил: ${watermarkData.name || watermarkData.email} (${new Date(watermarkData.purchaseDate).toLocaleDateString('ru-RU')})`,
            },
          }

          // Вставляем watermark в начало body
          if (Array.isArray(xhtml.html.body)) {
            xhtml.html.body = [watermarkDiv, ...xhtml.html.body]
          } else if (typeof xhtml.html.body === 'object') {
            xhtml.html.body = [watermarkDiv, xhtml.html.body]
          } else {
            // Если body - это строка, оборачиваем в массив
            xhtml.html.body = [watermarkDiv, { '#text': xhtml.html.body }]
          }

          const xhtmlBuilder = new XMLBuilder({
            ignoreAttributes: false,
            attributeNamePrefix: '@_',
            format: true,
            suppressEmptyNode: false,
          })

          const newXhtmlContent = xmlDeclaration + xhtmlBuilder.build(xhtml)
          // Важно: используем 'utf-8' encoding при создании Buffer для XHTML
          // Это гарантирует правильную обработку кириллицы в watermark
          const xhtmlBuffer = Buffer.from(newXhtmlContent, 'utf-8')
          zip.updateFile(firstXhtmlEntry.entryName, xhtmlBuffer)
        }
      } catch (xhtmlError) {
        console.warn('⚠️ [EPUB] Не удалось добавить watermark в XHTML:', xhtmlError)
        // Продолжаем без XHTML watermark
      }
    }

    // Генерируем новый EPUB buffer
    // Важно: toBuffer() создает бинарный буфер без перекодировки
    // Это критично для сохранения правильной кодировки всех файлов в архиве
    const newEPUBBuffer = zip.toBuffer()

    // Проверяем, что новый файл валидный ZIP архив
    if (newEPUBBuffer.length < 2 || newEPUBBuffer[0] !== 0x50 || newEPUBBuffer[1] !== 0x4B) {
      console.error('❌ [EPUB] Созданный EPUB не является валидным ZIP архивом')
      // Возвращаем оригинальный файл, если что-то пошло не так
      return baseEPUBBuffer
    }

    console.log('✅ [EPUB] Персонализированный EPUB создан:', {
      originalSize: baseEPUBBuffer.length,
      newSize: newEPUBBuffer.length,
      email: watermarkData.email,
      purchaseId: watermarkData.purchaseId,
      isValidZIP: newEPUBBuffer[0] === 0x50 && newEPUBBuffer[1] === 0x4B,
    })

    return newEPUBBuffer
  } catch (error: any) {
    console.error('❌ [EPUB] Ошибка при генерации персонализированного EPUB:', {
      error: error?.message,
      stack: error?.stack,
    })
    // В случае ошибки возвращаем оригинальный файл
    return baseEPUBBuffer
  }
}

