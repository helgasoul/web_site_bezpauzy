import { jsPDF } from 'jspdf'

/**
 * Регистрирует кириллические шрифты в jsPDF
 * Для jsPDF 3.x используем addFileToVFS и addFont
 * 
 * Шрифты должны быть загружены как base64 строки
 */

// Base64-encoded DejaVu Sans (normal) - минимальная версия для кириллицы
// В продакшене лучше загружать полные шрифты из файлов
const DEJAVU_SANS_BASE64 = '' // Будет заполнено при загрузке

// Base64-encoded DejaVu Sans (bold)
const DEJAVU_SANS_BOLD_BASE64 = '' // Будет заполнено при загрузке

/**
 * Загружает шрифт из файла и конвертирует в base64
 * Работает только на клиенте (браузер)
 */
export async function loadFontAsBase64(fontPath: string): Promise<string> {
  if (typeof window === 'undefined') {
    // На сервере эта функция не должна вызываться
    // Используется другой подход в initCyrillicFonts
    throw new Error('loadFontAsBase64 работает только на клиенте')
  }

  try {
    const response = await fetch(fontPath)
    const blob = await response.blob()
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        // Убираем префикс data:application/octet-stream;base64,
        const base64Data = base64.split(',')[1] || base64
        resolve(base64Data)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Ошибка загрузки шрифта:', error)
    throw error
  }
}

/**
 * Регистрирует DejaVu Sans шрифты в jsPDF
 * @param doc - экземпляр jsPDF
 * @param fontBase64 - base64 строка шрифта (normal)
 * @param fontBoldBase64 - base64 строка шрифта (bold)
 */
export function registerDejaVuFonts(
  doc: jsPDF,
  fontBase64: string,
  fontBoldBase64: string
): void {
  try {
    console.log('📦 Регистрирую шрифты DejaVu Sans...')
    console.log(`   - Размер normal: ${fontBase64.length} символов`)
    console.log(`   - Размер bold: ${fontBoldBase64.length} символов`)
    
    // Проверяем, что шрифты не пустые
    if (!fontBase64 || fontBase64.length < 100) {
      console.error('❌ Шрифт normal слишком маленький или пустой')
      return
    }
    if (!fontBoldBase64 || fontBoldBase64.length < 100) {
      console.error('❌ Шрифт bold слишком маленький или пустой')
      return
    }
    
    // Для jsPDF 3.x используем правильный API
    const docInternal = (doc as any).internal || doc
    
    // ВАЖНО: В jsPDF 3.x TTF файлы нужно конвертировать через специальный конвертер
    // Но мы можем попробовать использовать addFileToVFS и addFont напрямую
    // Если это не работает, нужно использовать конвертированные шрифты
    
    // Вариант 1: Через doc напрямую (стандартный способ для jsPDF 3.x)
    let vfsAdded = false
    if (typeof (doc as any).addFileToVFS === 'function') {
      try {
        (doc as any).addFileToVFS('DejaVuSans.ttf', fontBase64)
        (doc as any).addFileToVFS('DejaVuSans-Bold.ttf', fontBoldBase64)
        vfsAdded = true
        console.log('✅ Шрифты добавлены в VFS через doc.addFileToVFS')
      } catch (e: any) {
        console.warn('⚠️ Ошибка addFileToVFS через doc:', e?.message || e)
      }
    }
    
    // Вариант 2: Через internal API
    if (!vfsAdded && docInternal && typeof docInternal.addFileToVFS === 'function') {
      try {
        docInternal.addFileToVFS('DejaVuSans.ttf', fontBase64)
        docInternal.addFileToVFS('DejaVuSans-Bold.ttf', fontBoldBase64)
        vfsAdded = true
        console.log('✅ Шрифты добавлены в VFS через internal API')
      } catch (e: any) {
        console.warn('⚠️ Ошибка addFileToVFS через internal:', e?.message || e)
      }
    }
    
    if (!vfsAdded) {
      console.error('❌ Не удалось добавить шрифты в VFS')
      console.error('   Возможно, нужна конвертация через fontconverter')
      return
    }
    
    // Регистрируем шрифты через addFont
    // В jsPDF 3.x синтаксис: addFont(fileName, fontName, fontStyle)
    
    // Регистрируем normal шрифт
    let normalRegistered = false
    const addNormalMethods = [
      () => {
        (doc as any).addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal')
        console.log('✅ DejaVuSans normal зарегистрирован через doc.addFont')
      },
      () => {
        if (docInternal?.addFont) {
          docInternal.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal')
          console.log('✅ DejaVuSans normal зарегистрирован через internal.addFont')
        }
      },
    ]
    
    for (const method of addNormalMethods) {
      try {
        method()
        normalRegistered = true
        break
      } catch (e: any) {
        console.warn(`⚠️ Ошибка регистрации normal:`, e?.message || e)
        continue
      }
    }
    
    if (!normalRegistered) {
      console.error('❌ Не удалось зарегистрировать DejaVuSans normal')
      console.error('   Возможно, TTF файл нужно конвертировать через fontconverter')
    }
    
    // Регистрируем bold шрифт
    let boldRegistered = false
    const addBoldMethods = [
      () => {
        (doc as any).addFont('DejaVuSans-Bold.ttf', 'DejaVuSans', 'bold')
        console.log('✅ DejaVuSans bold зарегистрирован через doc.addFont')
      },
      () => {
        if (docInternal?.addFont) {
          docInternal.addFont('DejaVuSans-Bold.ttf', 'DejaVuSans', 'bold')
          console.log('✅ DejaVuSans bold зарегистрирован через internal.addFont')
        }
      },
    ]
    
    for (const method of addBoldMethods) {
      try {
        method()
        boldRegistered = true
        break
      } catch (e: any) {
        console.warn(`⚠️ Ошибка регистрации bold:`, e?.message || e)
        continue
      }
    }
    
    if (!boldRegistered) {
      console.error('❌ Не удалось зарегистрировать DejaVuSans bold')
    }
    
    // Проверяем результат
    try {
      const getFontListMethod = docInternal?.getFontList || (doc as any).getFontList
      if (typeof getFontListMethod === 'function') {
        const fonts = getFontListMethod.call(docInternal || doc)
        if (fonts) {
          const fontKeys = Object.keys(fonts)
          console.log('📋 Все доступные шрифты:', fontKeys.slice(0, 10))
          
          const hasDejaVu = fontKeys.some(key => 
            key.toLowerCase().includes('dejavu') || 
            key === 'DejaVuSans'
          )
          
          if (hasDejaVu) {
            const dejaVuKey = fontKeys.find(key => key.toLowerCase().includes('dejavu') || key === 'DejaVuSans')
            console.log(`✅ Шрифт DejaVuSans найден: ${dejaVuKey}`)
          } else {
            console.warn('⚠️ Шрифт DejaVuSans не найден в списке')
            console.warn('   Это означает, что регистрация не удалась')
            console.warn('   Возможно, нужно использовать конвертированные шрифты через fontconverter')
          }
        }
      }
    } catch (e) {
      console.warn('⚠️ Не удалось проверить список шрифтов:', e)
    }
  } catch (error) {
    console.error('❌ Критическая ошибка регистрации шрифтов:', error)
    console.error('   Stack:', (error as Error).stack)
  }
}

/**
 * Инициализирует кириллические шрифты для jsPDF
 * Работает на клиенте (браузер) и на сервере (Next.js API routes)
 */
export async function initCyrillicFonts(doc: jsPDF): Promise<void> {
  try {
    let fontNormal: string
    let fontBold: string

    if (typeof window !== 'undefined') {
      // На клиенте: загружаем шрифты из public/fonts
      fontNormal = await loadFontAsBase64('/fonts/DejaVuSans.ttf')
      fontBold = await loadFontAsBase64('/fonts/DejaVuSans-Bold.ttf')
    } else {
      // На сервере: загружаем шрифты из файловой системы
      const fs = await import('fs')
      const path = await import('path')
      
      const fontNormalPath = path.join(process.cwd(), 'public', 'fonts', 'DejaVuSans.ttf')
      const fontBoldPath = path.join(process.cwd(), 'public', 'fonts', 'DejaVuSans-Bold.ttf')
      
      console.log(`🔍 Проверяю шрифты на сервере:`)
      console.log(`   - Путь к DejaVuSans.ttf: ${fontNormalPath}`)
      console.log(`   - Существует: ${fs.existsSync(fontNormalPath)}`)
      console.log(`   - Путь к DejaVuSans-Bold.ttf: ${fontBoldPath}`)
      console.log(`   - Существует: ${fs.existsSync(fontBoldPath)}`)
      
      if (fs.existsSync(fontNormalPath) && fs.existsSync(fontBoldPath)) {
        const fontNormalBuffer = fs.readFileSync(fontNormalPath)
        const fontBoldBuffer = fs.readFileSync(fontBoldPath)
        
        // Проверяем, что это валидные TTF файлы
        const ttfSignature = Buffer.from([0x00, 0x01, 0x00, 0x00])
        const otfSignature = Buffer.from([0x4F, 0x54, 0x54, 0x4F])
        const normalStart = fontNormalBuffer.slice(0, 4)
        const boldStart = fontBoldBuffer.slice(0, 4)
        
        console.log(`   - Normal signature: ${normalStart.toString('hex')}`)
        console.log(`   - Bold signature: ${boldStart.toString('hex')}`)
        
        if (!normalStart.equals(ttfSignature) && !normalStart.equals(otfSignature)) {
          console.warn('⚠️ Normal шрифт может быть невалидным TTF/OTF')
        }
        if (!boldStart.equals(ttfSignature) && !boldStart.equals(otfSignature)) {
          console.warn('⚠️ Bold шрифт может быть невалидным TTF/OTF')
        }
        
        fontNormal = fontNormalBuffer.toString('base64')
        fontBold = fontBoldBuffer.toString('base64')
        
        console.log(`✅ Шрифты загружены: Normal (${fontNormal.length} символов base64), Bold (${fontBold.length} символов base64)`)
        console.log(`   Размеры файлов: Normal (${fontNormalBuffer.length} байт), Bold (${fontBoldBuffer.length} байт)`)
      } else {
        console.error('❌ Шрифты не найдены в public/fonts, используем fallback')
        console.error(`   - DejaVuSans.ttf: ${fontNormalPath} (exists: ${fs.existsSync(fontNormalPath)})`)
        console.error(`   - DejaVuSans-Bold.ttf: ${fontBoldPath} (exists: ${fs.existsSync(fontBoldPath)})`)
        return // Пропускаем регистрацию, будет использован fallback
      }
    }
    
    // Регистрируем шрифты
    console.log('📝 Регистрирую шрифты в jsPDF...')
    registerDejaVuFonts(doc, fontNormal, fontBold)
    
    // Проверяем результат регистрации
    try {
      const docInternal = (doc as any).internal || doc
      const getFontListMethod = docInternal.getFontList || (doc as any).getFontList
      if (typeof getFontListMethod === 'function') {
        const fonts = getFontListMethod.call(docInternal || doc)
        if (fonts) {
          const fontKeys = Object.keys(fonts)
          const dejaVuFonts = fontKeys.filter(k => k.toLowerCase().includes('dejavu') || k === 'DejaVuSans')
          console.log('📋 Доступные шрифты после регистрации:', dejaVuFonts.length > 0 ? dejaVuFonts : 'не найдены')
          if (dejaVuFonts.length === 0) {
            console.warn('⚠️ DejaVuSans не найден в списке шрифтов')
            console.warn('   Все доступные шрифты:', fontKeys.slice(0, 10))
          } else {
            console.log(`✅ DejaVuSans найден! Используем: ${dejaVuFonts[0]}`)
          }
        } else {
          console.warn('⚠️ getFontList() вернул null или undefined')
        }
      }
    } catch (e) {
      console.warn('⚠️ Не удалось получить список шрифтов:', e)
    }
  } catch (error) {
    console.error('❌ Ошибка инициализации кириллических шрифтов:', error)
    console.error('   Stack:', (error as Error).stack)
    // Не критично, продолжим с fallback
  }
}

/**
 * Безопасный вывод текста с поддержкой кириллицы
 * Использует DejaVuSans если доступен, иначе fallback
 */
export function safeText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  options?: {
    align?: 'left' | 'center' | 'right' | 'justify'
    maxWidth?: number
    fontSize?: number
    fontStyle?: 'normal' | 'bold'
  }
): void {
  try {
    const fontName = 'DejaVuSans'
    const fontStyle = options?.fontStyle || 'normal'
    
    // Пробуем найти зарегистрированный шрифт
    let actualFontName: string | null = null
    const docInternal = (doc as any).internal || doc
    
    try {
      const getFontListMethod = docInternal.getFontList || (doc as any).getFontList
      if (typeof getFontListMethod === 'function') {
        const fonts = getFontListMethod.call(docInternal || doc)
        if (fonts) {
          const fontKeys = Object.keys(fonts)
          const dejaVuKey = fontKeys.find(key => 
            key.toLowerCase().includes('dejavu') || 
            key === 'DejaVuSans'
          )
          
          if (dejaVuKey) {
            actualFontName = dejaVuKey
          }
        }
      }
    } catch (e) {
      // Игнорируем ошибку проверки
    }
    
    // Устанавливаем шрифт - пробуем разные способы
    const setFontMethods = [
      () => doc.setFont(actualFontName || fontName, fontStyle),
      () => docInternal.setFont(actualFontName || fontName, fontStyle),
      () => (doc as any).setFont(actualFontName || fontName, fontStyle),
    ]
    
    let fontSet = false
    for (const method of setFontMethods) {
      try {
        method()
        fontSet = true
        break
      } catch (e) {
        continue
      }
    }
    
    // Если не удалось установить DejaVuSans, используем helvetica
    if (!fontSet) {
      try {
        doc.setFont('helvetica', fontStyle)
        console.warn('⚠️ Используем helvetica вместо DejaVuSans (кириллица не будет работать)')
      } catch (e) {
        // Игнорируем
      }
    }
    
    if (options?.fontSize) {
      doc.setFontSize(options.fontSize)
    }
    
    // Выводим текст
    try {
      if (options?.maxWidth) {
        const lines = doc.splitTextToSize(text, options.maxWidth)
        lines.forEach((line: string, index: number) => {
          doc.text(line, x, y + (index * 6), options)
        })
      } else {
        doc.text(text, x, y, options)
      }
    } catch (textError: any) {
      // Если ошибка связана с кодировкой, пробуем другой подход
      if (textError.message && textError.message.includes('encoding')) {
        console.warn('⚠️ Ошибка кодировки, пробуем альтернативный метод')
        // Пробуем использовать внутренний API для вывода текста
        try {
          const textMethod = docInternal.text || (doc as any).text
          if (options?.maxWidth) {
            const lines = doc.splitTextToSize(text, options.maxWidth)
            lines.forEach((line: string, index: number) => {
              textMethod.call(docInternal || doc, line, x, y + (index * 6), options)
            })
          } else {
            textMethod.call(docInternal || doc, text, x, y, options)
          }
        } catch (altError) {
          throw textError // Пробрасываем оригинальную ошибку
        }
      } else {
        throw textError
      }
    }
  } catch (error: any) {
    console.error('❌ Критическая ошибка в safeText:', error)
    // Последний fallback: заменяем кириллицу на знаки вопроса
    const latinText = text.replace(/[^\x00-\x7F]/g, '?')
    try {
      doc.setFont('helvetica', options?.fontStyle || 'normal')
      if (options?.fontSize) {
        doc.setFontSize(options.fontSize)
      }
      if (options?.maxWidth) {
        const lines = doc.splitTextToSize(latinText, options.maxWidth)
        lines.forEach((line: string, index: number) => {
          doc.text(line, x, y + (index * 6), options)
        })
      } else {
        doc.text(latinText, x, y, options)
      }
    } catch (fallbackError) {
      console.error('❌ Даже fallback не сработал:', fallbackError)
    }
  }
}

