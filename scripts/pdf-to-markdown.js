#!/usr/bin/env node

/**
 * Скрипт для конвертации PDF файлов в Markdown
 * 
 * Использование:
 *   node scripts/pdf-to-markdown.js <путь-к-pdf-файлу> [выходная-папка]
 *   node scripts/pdf-to-markdown.js "litrature/Загруженные в Без|паузы/..." "litrature/zgt_text"
 * 
 * Или для конвертации всех PDF в папке:
 *   node scripts/pdf-to-markdown.js "litrature/Загруженные в Без|паузы/" "litrature/zgt_text" --all
 */

const fs = require('fs')
const path = require('path')

// Проверяем, установлена ли библиотека pdf-parse
let pdfParse
try {
  pdfParse = require('pdf-parse')
  // Проверяем, является ли это функцией или нужно использовать по-другому
  if (typeof pdfParse !== 'function') {
    // Если это объект с методом, пробуем использовать напрямую
    pdfParse = pdfParse.default || pdfParse
  }
} catch (error) {
  console.error('❌ Ошибка: библиотека pdf-parse не установлена.')
  console.error('📦 Установите её командой: npm install pdf-parse')
  process.exit(1)
}

async function extractTextFromPDF(pdfPath) {
  try {
    const dataBuffer = fs.readFileSync(pdfPath)
    // pdf-parse работает как функция
    const data = await pdfParse(dataBuffer)
    return {
      text: data.text || '',
      numPages: data.npages || data.numPages || 0,
      info: data.info || {},
      metadata: data.metadata || {},
    }
  } catch (error) {
    throw new Error(`Ошибка при чтении PDF: ${error.message}`)
  }
}

function formatAsMarkdown(text, filename, metadata = {}) {
  const title = filename.replace(/\.pdf$/i, '').replace(/_/g, ' ')
  const date = new Date().toISOString().split('T')[0]
  
  let markdown = `# ${title}\n\n`
  
  if (metadata.title) {
    markdown += `## Источник\n${metadata.title}\n\n`
  }
  
  if (metadata.author) {
    markdown += `**Автор:** ${metadata.author}\n\n`
  }
  
  if (metadata.creationDate) {
    markdown += `**Дата создания:** ${metadata.creationDate}\n\n`
  }
  
  markdown += `**Дата конвертации:** ${date}\n\n`
  markdown += `---\n\n`
  
  // Форматируем текст
  const lines = text.split('\n').filter(line => line.trim())
  let formattedText = ''
  let inList = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    if (!line) {
      if (inList) {
        formattedText += '\n'
        inList = false
      } else {
        formattedText += '\n\n'
      }
      continue
    }
    
    // Определяем заголовки (если строка короткая и в верхнем регистре или содержит ключевые слова)
    if (line.length < 100 && (
      line === line.toUpperCase() ||
      /^(Глава|Раздел|Часть|Введение|Заключение|Список литературы)/i.test(line)
    )) {
      if (inList) {
        formattedText += '\n'
        inList = false
      }
      formattedText += `## ${line}\n\n`
      continue
    }
    
    // Определяем подзаголовки
    if (line.length < 80 && /^[А-ЯЁ]/.test(line) && !line.endsWith('.') && !line.endsWith(',')) {
      if (inList) {
        formattedText += '\n'
        inList = false
      }
      formattedText += `### ${line}\n\n`
      continue
    }
    
    // Определяем списки
    if (/^[-•*]\s/.test(line) || /^\d+[\.\)]\s/.test(line)) {
      if (!inList) {
        formattedText += '\n'
      }
      formattedText += `${line}\n`
      inList = true
      continue
    }
    
    // Обычный текст
    if (inList) {
      formattedText += '\n'
      inList = false
    }
    
    // Разбиваем длинные строки на абзацы
    if (line.length > 200) {
      const sentences = line.split(/[.!?]\s+/)
      formattedText += sentences.join('. ') + '\n\n'
    } else {
      formattedText += `${line}\n\n`
    }
  }
  
  markdown += formattedText
  
  return markdown
}

async function convertPDFToMarkdown(pdfPath, outputDir) {
  try {
    // Проверяем существование файла
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`Файл не найден: ${pdfPath}`)
    }
    
    // Проверяем, что это PDF
    if (!pdfPath.toLowerCase().endsWith('.pdf')) {
      throw new Error('Файл должен иметь расширение .pdf')
    }
    
    console.log(`📄 Читаю PDF: ${pdfPath}`)
    
    // Извлекаем текст
    const pdfData = await extractTextFromPDF(pdfPath)
    console.log(`✅ Извлечено ${pdfData.numPages} страниц`)
    
    // Создаём выходную папку, если её нет
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
      console.log(`📁 Создана папка: ${outputDir}`)
    }
    
    // Формируем имя выходного файла
    const filename = path.basename(pdfPath, '.pdf')
    const outputPath = path.join(outputDir, `${filename}.md`)
    
    // Форматируем в markdown
    const markdown = formatAsMarkdown(
      pdfData.text,
      filename,
      {
        title: pdfData.info?.Title || filename,
        author: pdfData.info?.Author,
        creationDate: pdfData.info?.CreationDate,
      }
    )
    
    // Сохраняем
    fs.writeFileSync(outputPath, markdown, 'utf-8')
    console.log(`✅ Сохранено: ${outputPath}`)
    
    return outputPath
  } catch (error) {
    console.error(`❌ Ошибка при конвертации ${pdfPath}:`, error.message)
    throw error
  }
}

async function convertAllPDFsInDirectory(inputDir, outputDir) {
  try {
    const files = fs.readdirSync(inputDir)
    const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'))
    
    if (pdfFiles.length === 0) {
      console.log('⚠️  PDF файлы не найдены в указанной папке')
      return
    }
    
    console.log(`📚 Найдено ${pdfFiles.length} PDF файлов`)
    console.log('')
    
    for (let i = 0; i < pdfFiles.length; i++) {
      const file = pdfFiles[i]
      const pdfPath = path.join(inputDir, file)
      
      console.log(`[${i + 1}/${pdfFiles.length}] Обрабатываю: ${file}`)
      
      try {
        await convertPDFToMarkdown(pdfPath, outputDir)
        console.log('')
      } catch (error) {
        console.error(`⚠️  Пропущен файл ${file}: ${error.message}\n`)
      }
    }
    
    console.log('✅ Конвертация завершена!')
  } catch (error) {
    console.error('❌ Ошибка:', error.message)
    process.exit(1)
  }
}

// Основная функция
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log(`
📄 Конвертер PDF в Markdown

Использование:
  node scripts/pdf-to-markdown.js <путь-к-pdf> [выходная-папка]
  node scripts/pdf-to-markdown.js <папка-с-pdf> <выходная-папка> --all

Примеры:
  # Конвертировать один файл
  node scripts/pdf-to-markdown.js "litrature/Загруженные в Без|паузы/file.pdf" "litrature/zgt_text"
  
  # Конвертировать все PDF в папке
  node scripts/pdf-to-markdown.js "litrature/Загруженные в Без|паузы/" "litrature/zgt_text" --all
    `)
    process.exit(0)
  }
  
  const inputPath = args[0]
  const outputDir = args[1] || 'litrature/converted'
  const convertAll = args.includes('--all')
  
  try {
    const stats = fs.statSync(inputPath)
    
    if (stats.isDirectory()) {
      if (!convertAll) {
        console.error('❌ Для конвертации папки используйте флаг --all')
        console.error('   Пример: node scripts/pdf-to-markdown.js "папка" "выход" --all')
        process.exit(1)
      }
      await convertAllPDFsInDirectory(inputPath, outputDir)
    } else if (stats.isFile()) {
      await convertPDFToMarkdown(inputPath, outputDir)
      console.log('✅ Готово!')
    } else {
      throw new Error('Указанный путь не является файлом или папкой')
    }
  } catch (error) {
    console.error('❌ Ошибка:', error.message)
    process.exit(1)
  }
}

// Запускаем
main()

