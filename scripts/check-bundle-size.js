#!/usr/bin/env node

/**
 * Простой скрипт для проверки bundle size
 * Анализирует вывод npm run build
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('📦 Проверка bundle size...\n')

// Проверяем, есть ли уже собранный проект
const nextDir = path.join(process.cwd(), '.next')
if (!fs.existsSync(nextDir)) {
  console.log('⚠️  Проект еще не собран. Запускаю build...\n')
  try {
    execSync('npm run build', { stdio: 'inherit' })
  } catch (error) {
    console.error('❌ Ошибка при сборке:', error.message)
    process.exit(1)
  }
}

// Анализируем .next/static
const staticDir = path.join(nextDir, 'static')
if (fs.existsSync(staticDir)) {
  console.log('\n📊 Анализ bundle size:\n')
  
  // Анализируем chunks
  const chunksDir = path.join(staticDir, 'chunks')
  if (fs.existsSync(chunksDir)) {
    const chunks = analyzeDirectory(chunksDir)
    console.log('📦 JavaScript chunks:')
    chunks.forEach(({ name, size, formatted }) => {
      const isLarge = size > 250 * 1024 // 250KB
      const icon = isLarge ? '⚠️ ' : '✅'
      console.log(`   ${icon} ${name}: ${formatted}`)
      if (isLarge) {
        console.log(`      ⚠️  Превышает 250KB! Рекомендуется оптимизация.`)
      }
    })
    
    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0)
    const totalFormatted = formatBytes(totalSize)
    console.log(`\n   📊 Общий размер chunks: ${totalFormatted}`)
  }
  
  // Анализируем CSS
  const cssFiles = findFiles(staticDir, /\.css$/)
  if (cssFiles.length > 0) {
    console.log('\n🎨 CSS файлы:')
    cssFiles.forEach(({ name, size, formatted }) => {
      console.log(`   ${name}: ${formatted}`)
    })
  }
  
  // Проверяем размеры страниц
  console.log('\n📄 Размеры страниц:')
  const pagesDir = path.join(nextDir, 'server', 'app')
  if (fs.existsSync(pagesDir)) {
    const pageSizes = analyzePageSizes(pagesDir)
    pageSizes.forEach(({ page, size, formatted }) => {
      console.log(`   ${page}: ${formatted}`)
    })
  }
}

console.log('\n✅ Анализ завершен!')
console.log('\n💡 Рекомендации:')
console.log('   - JavaScript chunks должны быть < 250KB каждый')
console.log('   - Используйте dynamic imports для больших компонентов')
console.log('   - Проверьте, не импортируете ли вы всю библиотеку вместо отдельных функций')
console.log('   - Используйте tree-shaking для уменьшения размера')

function analyzeDirectory(dirPath) {
  const files = []
  
  function walkDir(currentPath) {
    const items = fs.readdirSync(currentPath)
    
    items.forEach((item) => {
      const itemPath = path.join(currentPath, item)
      const stat = fs.statSync(itemPath)
      
      if (stat.isDirectory()) {
        walkDir(itemPath)
      } else if (item.endsWith('.js') || item.endsWith('.js.map')) {
        const relativePath = path.relative(dirPath, itemPath)
        files.push({
          name: relativePath,
          size: stat.size,
          formatted: formatBytes(stat.size),
        })
      }
    })
  }
  
  walkDir(dirPath)
  return files.sort((a, b) => b.size - a.size)
}

function findFiles(dirPath, pattern) {
  const files = []
  
  function walkDir(currentPath) {
    const items = fs.readdirSync(currentPath)
    
    items.forEach((item) => {
      const itemPath = path.join(currentPath, item)
      const stat = fs.statSync(itemPath)
      
      if (stat.isDirectory()) {
        walkDir(itemPath)
      } else if (pattern.test(item)) {
        files.push({
          name: item,
          size: stat.size,
          formatted: formatBytes(stat.size),
        })
      }
    })
  }
  
  walkDir(dirPath)
  return files.sort((a, b) => b.size - a.size)
}

function analyzePageSizes(pagesDir) {
  const pages = []
  
  function walkDir(currentPath, relativePath = '') {
    const items = fs.readdirSync(currentPath)
    
    items.forEach((item) => {
      const itemPath = path.join(currentPath, item)
      const stat = fs.statSync(itemPath)
      
      if (stat.isDirectory()) {
        const newRelativePath = relativePath ? `${relativePath}/${item}` : item
        walkDir(itemPath, newRelativePath)
      } else if (item.endsWith('.js')) {
        const pageName = relativePath || 'root'
        pages.push({
          page: `/${pageName}`,
          size: stat.size,
          formatted: formatBytes(stat.size),
        })
      }
    })
  }
  
  walkDir(pagesDir)
  return pages.sort((a, b) => b.size - a.size)
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

