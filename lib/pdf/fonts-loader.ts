import { Font } from '@react-pdf/renderer'
import fs from 'fs'
import path from 'path'

// Кеш для отслеживания зарегистрированных шрифтов
let registeredFontFamily: string | null = null
let registrationInProgress = false

/**
 * Регистрирует шрифты PT Sans с поддержкой кириллицы для @react-pdf/renderer
 * Использует локальные файлы шрифтов из public/fonts
 * Регистрируется как 'NotoSans' для совместимости с существующими PDF компонентами
 */
export async function registerCyrillicFonts(): Promise<string> {
  // Если шрифты уже зарегистрированы, возвращаем имя семейства
  if (registeredFontFamily === 'NotoSans') {
    return 'NotoSans'
  }

  // Если регистрация уже идет, ждем
  if (registrationInProgress) {
    // Ждем немного и проверяем снова
    await new Promise(resolve => setTimeout(resolve, 100))
    if (registeredFontFamily === 'NotoSans') {
      return 'NotoSans'
    }
  }

  registrationInProgress = true

  try {
    console.log('📥 Загружаю PT Sans из локальных файлов...')
    
    // Пути к локальным шрифтам PT Sans
    const fontsDir = path.join(process.cwd(), 'public', 'fonts', 'Host_Grotesk,PT_Sans', 'PT_Sans')
    const normalFontPath = path.join(fontsDir, 'PTSans-Regular.ttf')
    const boldFontPath = path.join(fontsDir, 'PTSans-Bold.ttf')
    const italicFontPath = path.join(fontsDir, 'PTSans-Italic.ttf')
    const boldItalicFontPath = path.join(fontsDir, 'PTSans-BoldItalic.ttf')
    
    console.log('   Путь Regular:', normalFontPath)
    console.log('   Путь Bold:', boldFontPath)
    
    // Читаем файлы шрифтов
    const [normalFont, boldFont, italicFont, boldItalicFont] = await Promise.all([
      fs.promises.readFile(normalFontPath).catch((error) => {
        console.error('   ❌ Ошибка чтения Regular:', error.message)
        throw error
      }),
      fs.promises.readFile(boldFontPath).catch((error) => {
        console.error('   ❌ Ошибка чтения Bold:', error.message)
        throw error
      }),
      fs.promises.readFile(italicFontPath).catch(() => {
        // Если italic нет, используем regular
        return fs.promises.readFile(normalFontPath)
      }),
      fs.promises.readFile(boldItalicFontPath).catch(() => {
        // Если bold italic нет, используем bold
        return fs.promises.readFile(boldFontPath)
      }),
    ])
    
    console.log('   ✅ Regular загружен:', normalFont.length, 'байт')
    console.log('   ✅ Bold загружен:', boldFont.length, 'байт')

    // Проверяем формат загруженных шрифтов
    const normalHeader = normalFont.slice(0, 4)
    const isValidTTF = 
      (normalHeader[0] === 0x00 && normalHeader[1] === 0x01 && normalHeader[2] === 0x00 && normalHeader[3] === 0x00) ||
      normalHeader.toString('ascii', 0, 4) === 'OTTO' ||
      normalHeader.toString('ascii', 0, 4) === 'ttcf'
    
    if (!isValidTTF) {
      throw new Error('Font file is not a valid TTF file')
    }

    // Преобразуем Buffer в base64 data URL для @react-pdf/renderer
    // @react-pdf/renderer ожидает строку в формате data URL, а не Buffer
    const normalFontDataUrl = `data:font/ttf;base64,${normalFont.toString('base64')}`
    const boldFontDataUrl = `data:font/ttf;base64,${boldFont.toString('base64')}`
    const italicFontDataUrl = `data:font/ttf;base64,${italicFont.toString('base64')}`
    const boldItalicFontDataUrl = `data:font/ttf;base64,${boldItalicFont.toString('base64')}`

    // Регистрируем шрифт как 'NotoSans' для совместимости с существующими компонентами
    try {
      Font.register({
        family: 'NotoSans',
        fonts: [
          {
            src: normalFontDataUrl,
            fontWeight: 'normal',
            fontStyle: 'normal',
          },
          {
            src: boldFontDataUrl,
            fontWeight: 'bold',
            fontStyle: 'normal',
          },
          {
            src: italicFontDataUrl,
            fontWeight: 'normal',
            fontStyle: 'italic',
          },
          {
            src: boldItalicFontDataUrl,
            fontWeight: 'bold',
            fontStyle: 'italic',
          },
        ],
      })

      console.log('✅ Шрифты PT Sans зарегистрированы как NotoSans (из локальных файлов)')
      registeredFontFamily = 'NotoSans'
      
      // Даем немного времени на завершение регистрации
      await new Promise(resolve => setTimeout(resolve, 50))
      
      return 'NotoSans'
    } catch (registerError: any) {
      if (registerError.message && registerError.message.includes('already registered')) {
        console.log('✅ Шрифты NotoSans уже зарегистрированы')
        registeredFontFamily = 'NotoSans'
        return 'NotoSans'
      }
      throw registerError
    }
  } catch (error: any) {
    console.error('❌ Ошибка регистрации шрифтов:', error.message)
    console.error('   Stack:', error.stack)
    throw error
  } finally {
    registrationInProgress = false
  }
}
