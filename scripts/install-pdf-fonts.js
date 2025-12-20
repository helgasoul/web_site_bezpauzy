#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const https = require('https')

// Определяем корень проекта (где находится package.json)
// Используем __dirname (директория скрипта) и поднимаемся на уровень вверх
const scriptDir = __dirname
const projectRoot = path.resolve(scriptDir, '..')
const fontsDir = path.join(projectRoot, 'public', 'fonts')

console.log(`📁 Корень проекта: ${projectRoot}`)
console.log(`📁 Папка шрифтов: ${fontsDir}`)
const fontUrls = {
  'DejaVuSans.ttf': 'https://github.com/dejavu-fonts/dejavu-fonts/raw/master/ttf/DejaVuSans.ttf',
  'DejaVuSans-Bold.ttf': 'https://github.com/dejavu-fonts/dejavu-fonts/raw/master/ttf/DejaVuSans-Bold.ttf',
}

function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath)
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`))
        return
      }
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        resolve()
      })
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}) // Удаляем частично скачанный файл
      reject(err)
    })
  })
}

async function main() {
  console.log('📦 Установка кириллических шрифтов для PDF...\n')

  // Создаем папку fonts
  if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true })
    console.log(`✅ Создана папка: ${fontsDir}`)
  }

  // Скачиваем шрифты
  for (const [filename, url] of Object.entries(fontUrls)) {
    const filePath = path.join(fontsDir, filename)
    
    if (fs.existsSync(filePath)) {
      console.log(`⏭️  Шрифт уже установлен: ${filename}`)
      continue
    }

    try {
      console.log(`⬇️  Скачиваю ${filename}...`)
      await downloadFile(url, filePath)
      const stats = fs.statSync(filePath)
      console.log(`✅ Установлен: ${filename} (${(stats.size / 1024).toFixed(1)} KB)`)
    } catch (error) {
      console.error(`❌ Ошибка при скачивании ${filename}:`, error.message)
      process.exit(1)
    }
  }

  console.log('\n✅ Все шрифты установлены!')
  console.log(`📁 Расположение: ${fontsDir}`)
}

main().catch((error) => {
  console.error('❌ Критическая ошибка:', error)
  process.exit(1)
})

