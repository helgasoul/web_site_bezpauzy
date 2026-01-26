#!/usr/bin/env node

/**
 * Скрипт для конвертации The Pause Life Lab Checklist из DOCX в Markdown/JSON
 * для дальнейшей обработки и создания PDF
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

async function convertChecklist() {
  try {
    // Путь к файлу (используем относительный путь от корня проекта)
    const filePath = path.join(
      process.cwd(),
      'litrature',
      'Загруженные в Без|паузы',
      'Imaging in Management of Breast Diseases Volume 2, Disease-Based Approach 2025_split',
      'The_Pause_Life_Lab_Checklist.docx'
    )

    console.log(`📄 Читаю файл: ${filePath}`)

    if (!fs.existsSync(filePath)) {
      throw new Error(`Файл не найден: ${filePath}`)
    }

    // Читаем файл
    const dataBuffer = fs.readFileSync(filePath)

    // Конвертируем DOCX в HTML для сохранения структуры
    const htmlResult = await mammoth.convertToHtml({ buffer: dataBuffer })
    const html = htmlResult.value

    // Также извлекаем чистый текст
    const textResult = await mammoth.extractRawText({ buffer: dataBuffer })
    const text = textResult.value

    // Создаём выходную папку
    const outputDir = path.join(process.cwd(), 'litrature', 'converted')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    // Сохраняем HTML
    const htmlPath = path.join(outputDir, 'frax-checklist-raw.html')
    fs.writeFileSync(htmlPath, html, 'utf-8')
    console.log(`✅ HTML сохранён: ${htmlPath}`)

    // Сохраняем текст
    const textPath = path.join(outputDir, 'frax-checklist-raw.txt')
    fs.writeFileSync(textPath, text, 'utf-8')
    console.log(`✅ Текст сохранён: ${textPath}`)

    // Показываем первые 2000 символов для предварительного просмотра
    console.log('\n📋 Предварительный просмотр (первые 2000 символов):')
    console.log('='.repeat(80))
    console.log(text.substring(0, 2000))
    console.log('='.repeat(80))

    return { html, text }
  } catch (error) {
    console.error('❌ Ошибка при конвертации:', error.message)
    throw error
  }
}

// Запускаем
convertChecklist()
  .then(() => {
    console.log('\n✅ Конвертация завершена!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Ошибка:', error)
    process.exit(1)
  })

