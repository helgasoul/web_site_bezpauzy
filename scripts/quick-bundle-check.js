#!/usr/bin/env node

/**
 * Быстрая проверка bundle size (без сборки)
 * Проверяет существующую .next директорию
 */

const fs = require('fs')
const path = require('path')

console.log('📦 Быстрая проверка bundle size...\n')

const nextDir = path.join(process.cwd(), '.next')

if (!fs.existsSync(nextDir)) {
  console.log('⚠️  Директория .next не найдена.')
  console.log('💡 Запустите сначала: npm run build')
  process.exit(1)
}

// Проверяем размер .next/static/chunks
const chunksDir = path.join(nextDir, 'static', 'chunks')
if (fs.existsSync(chunksDir)) {
  console.log('📊 JavaScript chunks:\n')
  
  const chunks = []
  
  function walkDir(currentPath) {
    const items = fs.readdirSync(currentPath)
    items.forEach((item) => {
      const itemPath = path.join(currentPath, item)
      const stat = fs.statSync(itemPath)
      if (stat.isDirectory()) {
        walkDir(itemPath)
      } else if (item.endsWith('.js') && !item.endsWith('.map')) {
        chunks.push({
          name: path.relative(chunksDir, itemPath),
          size: stat.size,
        })
      }
    })
  }
  
  walkDir(chunksDir)
  
  chunks.sort((a, b) => b.size - a.size)
  
  let hasLargeChunks = false
  chunks.forEach((chunk) => {
    const formatted = formatBytes(chunk.size)
    const isLarge = chunk.size > 250 * 1024
    if (isLarge) hasLargeChunks = true
    const icon = isLarge ? '⚠️ ' : '✅'
    console.log(`   ${icon} ${chunk.name}: ${formatted}`)
    if (isLarge) {
      console.log(`      ⚠️  Превышает 250KB! Рекомендуется оптимизация.`)
    }
  })
  
  const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0)
  console.log(`\n   📊 Общий размер chunks: ${formatBytes(totalSize)}`)
  
  if (hasLargeChunks) {
    console.log('\n⚠️  Обнаружены большие chunks (> 250KB)')
    console.log('💡 Рекомендации:')
    console.log('   - Используйте dynamic imports для больших компонентов')
    console.log('   - Проверьте, не импортируете ли вы всю библиотеку')
    console.log('   - Используйте code splitting')
  } else {
    console.log('\n✅ Все chunks в пределах нормы (< 250KB)')
  }
} else {
  console.log('⚠️  Директория chunks не найдена.')
  console.log('💡 Запустите сначала: npm run build')
}

// Проверяем CSS
const cssFiles = []
function findCSS(dir) {
  const items = fs.readdirSync(dir)
  items.forEach((item) => {
    const itemPath = path.join(dir, item)
    const stat = fs.statSync(itemPath)
    if (stat.isDirectory()) {
      findCSS(itemPath)
    } else if (item.endsWith('.css')) {
      cssFiles.push({
        name: path.relative(nextDir, itemPath),
        size: stat.size,
      })
    }
  })
}

if (fs.existsSync(nextDir)) {
  findCSS(nextDir)
  if (cssFiles.length > 0) {
    console.log('\n🎨 CSS файлы:')
    cssFiles.forEach((file) => {
      console.log(`   ${file.name}: ${formatBytes(file.size)}`)
    })
  }
}

console.log('\n✅ Проверка завершена!')
console.log('\n💡 Для детального визуального анализа используйте:')
console.log('   npm run perf:bundle')

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

