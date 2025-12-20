#!/usr/bin/env node

/**
 * Скрипт для конвертации DOCX файлов в Markdown
 * 
 * Использование:
 *   node scripts/docx-to-markdown.js <путь-к-docx-файлу> [выходная-папка]
 */

const fs = require('fs')
const path = require('path')

// Проверяем, установлена ли библиотека mammoth
let mammoth
try {
  mammoth = require('mammoth')
} catch (error) {
  console.error('❌ Ошибка: библиотека mammoth не установлена.')
  console.error('📦 Установите её командой: npm install mammoth')
  process.exit(1)
}

function formatAsMarkdown(html, filename) {
  const title = filename.replace(/\.docx$/i, '').replace(/_/g, ' ')
  const date = new Date().toISOString().split('T')[0]
  
  let markdown = `# ${title}\n\n`
  markdown += `**Дата конвертации:** ${date}\n\n`
  markdown += `---\n\n`
  
  // Конвертируем HTML в Markdown (простая версия)
  // Удаляем HTML теги и оставляем текст
  let text = html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n#### $1\n\n')
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    .replace(/<ul[^>]*>/gi, '\n')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<ol[^>]*>/gi, '\n')
    .replace(/<\/ol>/gi, '\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '') // Удаляем все остальные HTML теги
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n') // Убираем множественные переносы строк
  
  markdown += text
  
  return markdown
}

async function convertDOCXToMarkdown(docxPath, outputDir) {
  try {
    // Проверяем существование файла
    if (!fs.existsSync(docxPath)) {
      throw new Error(`Файл не найден: ${docxPath}`)
    }
    
    // Проверяем, что это DOCX
    if (!docxPath.toLowerCase().endsWith('.docx')) {
      throw new Error('Файл должен иметь расширение .docx')
    }
    
    console.log(`📄 Читаю DOCX: ${docxPath}`)
    
    // Читаем файл
    const dataBuffer = fs.readFileSync(docxPath)
    
    // Конвертируем DOCX в HTML
    const result = await mammoth.convertToHtml({ buffer: dataBuffer })
    const html = result.value
    
    // Создаём выходную папку, если её нет
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
      console.log(`📁 Создана папка: ${outputDir}`)
    }
    
    // Формируем имя выходного файла
    const filename = path.basename(docxPath, '.docx')
    const outputPath = path.join(outputDir, `${filename}.md`)
    
    // Форматируем в markdown
    const markdown = formatAsMarkdown(html, filename)
    
    // Сохраняем
    fs.writeFileSync(outputPath, markdown, 'utf-8')
    console.log(`✅ Сохранено: ${outputPath}`)
    
    return outputPath
  } catch (error) {
    console.error(`❌ Ошибка при конвертации ${docxPath}:`, error.message)
    throw error
  }
}

// Основная функция
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log(`
📄 Конвертер DOCX в Markdown

Использование:
  node scripts/docx-to-markdown.js <путь-к-docx> [выходная-папка]

Примеры:
  # Конвертировать один файл
  node scripts/docx-to-markdown.js "Diet in menopause.docx" "litrature/metabolism_text"
    `)
    process.exit(0)
  }
  
  const inputPath = args[0]
  const outputDir = args[1] || 'litrature/converted'
  
  try {
    await convertDOCXToMarkdown(inputPath, outputDir)
    console.log('✅ Готово!')
  } catch (error) {
    console.error('❌ Ошибка:', error.message)
    process.exit(1)
  }
}

// Запускаем
main()

