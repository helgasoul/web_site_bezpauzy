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
    
    // Добавляем шрифты в Virtual File System
    if (typeof doc.addFileToVFS !== 'function') {
      console.error('❌ doc.addFileToVFS не является функцией')
      return
    }
    
    doc.addFileToVFS('DejaVuSans.ttf', fontBase64)
    doc.addFileToVFS('DejaVuSans-Bold.ttf', fontBoldBase64)
    console.log('✅ Шрифты добавлены в VFS')
    
    // Регистрируем шрифты
    // В jsPDF 3.x синтаксис: addFont(fileName, fontName, fontStyle)
    if (typeof doc.addFont !== 'function') {
      console.error('❌ doc.addFont не является функцией')
      return
    }
    
    doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal')
    doc.addFont('DejaVuSans-Bold.ttf', 'DejaVuSans', 'bold')
    console.log('✅ Шрифты зарегистрированы через addFont')
    
    // Проверяем, что шрифты зарегистрированы
    try {
      const fonts = doc.getFontList()
      console.log('📋 Все доступные шрифты:', Object.keys(fonts || {}))
      
      const hasDejaVu = fonts && (
        fonts['DejaVuSans'] || 
        Object.keys(fonts).some(key => key.toLowerCase().includes('dejavu'))
      )
      
      if (hasDejaVu) {
        console.log('✅ Шрифт DejaVuSans успешно зарегистрирован')
      } else {
        console.warn('⚠️ Шрифт DejaVuSans не найден в списке после addFont')
        console.warn('   Доступные шрифты:', Object.keys(fonts || {}))
      }
    } catch (e) {
      console.warn('⚠️ Не удалось проверить список шрифтов:', e)
    }
  } catch (error) {
    console.error('Ошибка регистрации шрифтов:', error)
    // Не бросаем ошибку, чтобы продолжить с fallback
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
        
        fontNormal = fontNormalBuffer.toString('base64')
        fontBold = fontBoldBuffer.toString('base64')
        
        console.log(`✅ Шрифты загружены: Normal (${fontNormal.length} байт), Bold (${fontBold.length} байт)`)
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
      const fonts = doc.getFontList()
      console.log('📋 Доступные шрифты после регистрации:', Object.keys(fonts || {}).filter(k => k.toLowerCase().includes('dejavu') || k === 'DejaVuSans'))
    } catch (e) {
      console.warn('⚠️ Не удалось получить список шрифтов:', e)
    }
  } catch (error) {
    console.error('❌ Ошибка инициализации кириллических шрифтов:', error)
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
    // Пробуем использовать DejaVuSans
    const fontName = 'DejaVuSans'
    const fontStyle = options?.fontStyle || 'normal'
    
    // Пробуем установить DejaVuSans напрямую
    // Если шрифт зарегистрирован, setFont не выбросит ошибку
    try {
      doc.setFont(fontName, fontStyle)
      // Если дошли сюда, шрифт установлен успешно
    } catch (fontError) {
      console.warn(`⚠️ Не удалось установить ${fontName} (${fontStyle}):`, fontError)
      // Если не удалось установить шрифт, проверяем через getFontList
      try {
        const fonts = doc.getFontList()
        const hasDejaVu = fonts && (
          fonts[fontName] || 
          Object.keys(fonts).some(key => key.toLowerCase().includes('dejavu'))
        )
        
        if (hasDejaVu) {
          // Пробуем еще раз с правильным именем
          const fontKey = Object.keys(fonts).find(key => key.toLowerCase().includes('dejavu'))
          if (fontKey) {
            doc.setFont(fontKey, fontStyle)
          } else {
            throw new Error('Шрифт найден, но не удалось установить')
          }
        } else {
          throw new Error('Шрифт не найден в списке')
        }
      } catch (e) {
        // Fallback на helvetica (кириллица не будет работать)
        console.warn('⚠️ DejaVuSans не доступен, используем helvetica (кириллица не будет работать):', e)
        console.warn('   Доступные шрифты:', Object.keys(doc.getFontList() || {}))
        doc.setFont('helvetica', fontStyle)
      }
    }
    
    if (options?.fontSize) {
      doc.setFontSize(options.fontSize)
    }
    
    // Выводим текст
    if (options?.maxWidth) {
      const lines = doc.splitTextToSize(text, options.maxWidth)
      lines.forEach((line: string, index: number) => {
        doc.text(line, x, y + (index * 6), options)
      })
    } else {
      doc.text(text, x, y, options)
    }
  } catch (error) {
    console.warn('Ошибка вывода текста, используем fallback:', error)
    // Fallback: заменяем кириллицу на латиницу
    const latinText = text.replace(/[^\x00-\x7F]/g, '?')
    doc.setFont('helvetica', options?.fontStyle || 'normal')
    if (options?.fontSize) {
      doc.setFontSize(options.fontSize)
    }
    doc.text(latinText, x, y, options)
  }
}

