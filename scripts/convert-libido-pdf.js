#!/usr/bin/env node

/**
 * Временный скрипт для конвертации конкретного PDF файла
 * Использует абсолютный путь для обхода проблем с кодировкой
 */

const fs = require('fs')
const path = require('path')
const pdfParse = require('pdf-parse')

const workspaceRoot = process.cwd()

// Относительные пути
const pdfRelativePath = 'litrature/Загруженные в Без|паузы/Imaging in Management of Breast Diseases Volume 2, Disease-Based Approach 2025_split/16.0_pp_98_104_Libido_and_Sexual_Function_in_the_Menopause.pdf'
const outputRelativePath = 'litrature/16.0_Libido_and_Sexual_Function_in_the_Menopause.md'

const pdfPath = path.resolve(workspaceRoot, pdfRelativePath)
const outputPath = path.resolve(workspaceRoot, outputRelativePath)

async function convert() {
  try {
    console.log('Looking for PDF at:', pdfPath)
    console.log('File exists:', fs.existsSync(pdfPath))
    
    if (!fs.existsSync(pdfPath)) {
      console.error('❌ PDF file not found!')
      console.error('Please check the path:', pdfPath)
      process.exit(1)
    }

    const dataBuffer = fs.readFileSync(pdfPath)
    console.log('PDF file size:', dataBuffer.length, 'bytes')
    
    const data = await pdfParse(dataBuffer)
    const text = data.text
    
    console.log('Extracted text length:', text.length, 'characters')
    
    // Базовая конвертация в markdown
    let markdown = `# Libido and Sexual Function in the Menopause\n\n`
    
    const lines = text.split('\n')
    let markdownLines = []
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      
      if (!line) {
        if (markdownLines[markdownLines.length - 1] !== '') {
          markdownLines.push('')
        }
        continue
      }
      
      // Простое определение заголовков
      if (line === line.toUpperCase() && line.length > 3 && line.length < 100 && !line.match(/^\d+$/)) {
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
    markdown = markdown.replace(/\n{3,}/g, '\n\n')
    
    // Сохраняем результат
    fs.writeFileSync(outputPath, markdown, 'utf-8')
    console.log(`✅ Конвертировано: ${pdfPath}`)
    console.log(`✅ Сохранено: ${outputPath}`)
    console.log(`✅ Markdown length: ${markdown.length} characters`)
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

convert()

