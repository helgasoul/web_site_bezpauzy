#!/usr/bin/env node

/**
 * Скрипт для анализа bundle size
 * Использование: node scripts/analyze-bundle.js
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('📦 Анализ bundle size...\n')

try {
  // Запускаем build
  console.log('1. Запуск production build...')
  execSync('npm run build', { stdio: 'inherit' })

  // Проверяем размер .next директории
  const nextDir = path.join(process.cwd(), '.next')
  if (fs.existsSync(nextDir)) {
    const { size } = getDirectorySize(nextDir)
    console.log(`\n2. Размер .next директории: ${formatBytes(size)}`)
  }

  // Проверяем размер public директории
  const publicDir = path.join(process.cwd(), 'public')
  if (fs.existsSync(publicDir)) {
    const { size, files } = getDirectorySize(publicDir)
    console.log(`\n3. Размер public директории: ${formatBytes(size)}`)
    console.log(`   Файлов: ${files}`)
    
    // Показываем самые большие файлы
    const largeFiles = getLargeFiles(publicDir)
    if (largeFiles.length > 0) {
      console.log('\n4. Самые большие файлы в public/:')
      largeFiles.slice(0, 10).forEach(({ file, size }) => {
        console.log(`   ${file}: ${formatBytes(size)}`)
      })
    }
  }

  console.log('\n✅ Анализ завершен!')
  console.log('\n💡 Для детального анализа используйте:')
  console.log('   ANALYZE=true npm run build')
} catch (error) {
  console.error('❌ Ошибка при анализе:', error.message)
  process.exit(1)
}

function getDirectorySize(dirPath) {
  let totalSize = 0
  let fileCount = 0

  function walkDir(currentPath) {
    const files = fs.readdirSync(currentPath)

    files.forEach((file) => {
      const filePath = path.join(currentPath, file)
      const stat = fs.statSync(filePath)

      if (stat.isDirectory()) {
        walkDir(filePath)
      } else {
        totalSize += stat.size
        fileCount++
      }
    })
  }

  walkDir(dirPath)
  return { size: totalSize, files: fileCount }
}

function getLargeFiles(dirPath, threshold = 100 * 1024) {
  const largeFiles = []

  function walkDir(currentPath) {
    const files = fs.readdirSync(currentPath)

    files.forEach((file) => {
      const filePath = path.join(currentPath, file)
      const stat = fs.statSync(filePath)

      if (stat.isDirectory()) {
        walkDir(filePath)
      } else if (stat.size > threshold) {
        largeFiles.push({
          file: path.relative(process.cwd(), filePath),
          size: stat.size,
        })
      }
    })
  }

  walkDir(dirPath)
  return largeFiles.sort((a, b) => b.size - a.size)
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

