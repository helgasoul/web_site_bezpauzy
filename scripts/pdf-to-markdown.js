#!/usr/bin/env node

/**
 * Скрипт для конвертации PDF в Markdown
 * Использование: node scripts/pdf-to-markdown.js <path-to-pdf> [output-path]
 */

const fs = require('fs')
const path = require('path')

// Попробуем использовать pdf-parse, если установлен
let pdfParse

try {
  pdfParse = require('pdf-parse')
} catch (e) {
  console.error('Библиотека pdf-parse не установлена. Устанавливаю...')
  console.error('Пожалуйста, выполните: npm install pdf-parse')
  process.exit(1)
}

async function convertPdfToMarkdown(pdfPath, outputPath) {
  try {
    // Читаем PDF файл
    const dataBuffer = fs.readFileSync(pdfPath)
    
    // Парсим PDF
    const data = await pdfParse(dataBuffer)
    
    // Получаем текст
    const text = data.text
    
    // Базовая конвертация в markdown
    // Разбиваем на параграфы и форматируем
    let markdown = `# ${path.basename(pdfPath, '.pdf')}\n\n`
    
    // Разбиваем текст на строки и обрабатываем
    const lines = text.split('\n')
    let markdownLines = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      if (!line) {
        // Пустая строка - добавляем разрыв параграфа
        if (markdownLines[markdownLines.length - 1] !== '') {
          markdownLines.push('')
        }
        continue
      }
      
      // Простое определение заголовков (строки ВСЕ ЗАГЛАВНЫЕ БУКВЫ)
      if (line === line.toUpperCase() && line.length > 3 && line.length < 100 && !line.match(/^\d+$/)) {
        // Это может быть заголовок
        if (i > 0 && markdownLines[markdownLines.length - 1] !== '') {
          markdownLines.push('')
        }
        markdownLines.push(`## ${line}`)
        markdownLines.push('')
      } else {
        markdownLines.push(line)
      }
    }
    
    markdown += markdownLines.join('\n')
    
    // Убираем лишние пустые строки
    markdown = markdown.replace(/\n{3,}/g, '\n\n')
    
    // Сохраняем результат
    if (outputPath) {
      fs.writeFileSync(outputPath, markdown, 'utf-8')
      console.log(`✅ Конвертировано: ${pdfPath} -> ${outputPath}`)
    } else {
      // Выводим в stdout
      console.log(markdown)
    }
    
    return markdown
  } catch (error) {
    console.error(`❌ Ошибка при конвертации ${pdfPath}:`, error.message)
    throw error
  }
}

// Основная функция
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length < 1) {
    console.error('Использование: node scripts/pdf-to-markdown.js <path-to-pdf> [output-path]')
    process.exit(1)
  }
  
  const pdfPath = args[0]
  const outputPath = args[1] || pdfPath.replace(/\.pdf$/i, '.md')
  
  if (!fs.existsSync(pdfPath)) {
    console.error(`❌ Файл не найден: ${pdfPath}`)
    process.exit(1)
  }
  
  await convertPdfToMarkdown(pdfPath, outputPath)
}

main().catch(error => {
  console.error('Критическая ошибка:', error)
  process.exit(1)
})

