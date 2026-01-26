import { Font } from '@react-pdf/renderer'
import fs from 'fs'
import path from 'path'

/**
 * Регистрирует шрифты с поддержкой кириллицы для @react-pdf/renderer
 * Использует Noto Sans из Google Fonts (CDN) - отлично поддерживает кириллицу
 */
export function registerCyrillicFonts(): string | null {
  try {
    // Сначала пробуем использовать локальные шрифты
    const fontNormalPath = path.join(process.cwd(), 'public', 'fonts', 'DejaVuSans.ttf')
    const fontBoldPath = path.join(process.cwd(), 'public', 'fonts', 'DejaVuSans-Bold.ttf')

    const normalExists = fs.existsSync(fontNormalPath)
    const boldExists = fs.existsSync(fontBoldPath)
    
    if (normalExists && boldExists) {
      const normalStats = fs.statSync(fontNormalPath)
      const boldStats = fs.statSync(fontBoldPath)
      
      // Проверяем, что файлы не пустые (минимум 1KB)
      if (normalStats.size > 1024 && boldStats.size > 1024) {
        const fontNormal = fs.readFileSync(fontNormalPath)
        const fontBold = fs.readFileSync(fontBoldPath)

        Font.register({
          family: 'DejaVuSans',
          fonts: [
            {
              src: fontNormal as any,
              fontWeight: 'normal',
            },
            {
              src: fontBold as any,
              fontWeight: 'bold',
            },
          ],
        })

        console.log('✅ Шрифты DejaVu Sans зарегистрированы (локальные)')
        return 'DejaVuSans'
      }
    }
    
    // Если локальные шрифты не найдены, используем Noto Sans из Google Fonts
    // @react-pdf/renderer поддерживает загрузку шрифтов по URL
    try {
      Font.register({
        family: 'NotoSans',
        fonts: [
          {
            src: 'https://fonts.gstatic.com/s/notosans/v36/o-0IIpQlx3QUlC5A4PNr4zRAW_0.woff2',
            fontWeight: 'normal',
          },
          {
            src: 'https://fonts.gstatic.com/s/notosans/v36/o-0NIpQlx3QUlC5A4PNjXhFlY9aA.woff2',
            fontWeight: 'bold',
          },
        ],
      })
      console.log('✅ Шрифты Noto Sans зарегистрированы (из Google Fonts CDN)')
      return 'NotoSans'
    } catch (cdnError) {
      console.warn('⚠️ Не удалось загрузить шрифты из CDN:', cdnError)
      // Fallback на Times-Roman
      return null
    }
  } catch (error) {
    console.error('❌ Ошибка регистрации шрифтов:', error)
    // Fallback на Times-Roman (может частично поддерживать кириллицу)
    return 'Times-Roman'
  }
}

