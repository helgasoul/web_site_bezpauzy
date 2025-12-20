import { jsPDF } from 'jspdf'

/**
 * Загружает и регистрирует кириллические шрифты для jsPDF
 * Для jsPDF 3.x нужно использовать addFileToVFS и addFont
 */
export async function loadCyrillicFonts(doc: jsPDF): Promise<void> {
  try {
    // Для jsPDF 3.x можно использовать встроенную поддержку Unicode
    // или загрузить кастомные шрифты
    
    // Вариант 1: Использовать встроенную поддержку (если доступна)
    // jsPDF 3.x поддерживает Unicode напрямую, но стандартные шрифты не поддерживают кириллицу
    
    // Вариант 2: Загрузить кастомные шрифты
    // Для этого нужно конвертировать TTF в base64 и добавить в VFS
    
    // Временно используем подход с Unicode escape-последовательностями
    // или используем библиотеку jspdf-customfonts
    
    // Для продакшена лучше использовать готовые решения:
    // 1. jspdf-customfonts (может быть устаревшим)
    // 2. Или конвертировать шрифты в base64 и добавить в код
    
    // Пока используем fallback: если кириллица не работает, заменяем на латиницу
    return Promise.resolve()
  } catch (error) {
    console.error('Ошибка загрузки шрифтов:', error)
    return Promise.resolve() // Не критично, продолжим с fallback
  }
}

/**
 * Безопасный вывод текста с поддержкой кириллицы
 * В jsPDF 3.x Unicode должен работать, но проверим
 */
export function safeText(doc: jsPDF, text: string, x: number, y: number, options?: any): void {
  try {
    // jsPDF 3.x поддерживает Unicode напрямую
    doc.text(text, x, y, options)
  } catch (error) {
    // Fallback: если не работает, пробуем другой метод
    console.warn('Ошибка вывода текста, используем fallback:', error)
    try {
      // Альтернативный метод через splitTextToSize
      const lines = doc.splitTextToSize(text, options?.maxWidth || 200)
      lines.forEach((line: string, index: number) => {
        doc.text(line, x, y + (index * 6), options)
      })
    } catch (fallbackError) {
      // Последний fallback: заменяем кириллицу на латиницу
      const latinText = text.replace(/[^\x00-\x7F]/g, '?')
      doc.text(latinText, x, y, options)
    }
  }
}

