const https = require('https')
const fs = require('fs')
const path = require('path')

const fontsDir = path.join(process.cwd(), 'public', 'fonts')

// Создаем директорию если её нет
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true })
}

// URL для скачивания DejaVu Sans
const fontUrls = {
  normal: 'https://github.com/dejavu-fonts/dejavu-fonts/raw/master/ttf/DejaVuSans.ttf',
  bold: 'https://github.com/dejavu-fonts/dejavu-fonts/raw/master/ttf/DejaVuSans-Bold.ttf'
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Редирект
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject)
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`))
        return
      }
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        resolve()
      })
    }).on('error', (err) => {
      fs.unlink(dest, () => {})
      reject(err)
    })
  })
}

async function main() {
  console.log('📥 Скачиваю шрифты DejaVu Sans...')
  
  try {
    const normalPath = path.join(fontsDir, 'DejaVuSans.ttf')
    const boldPath = path.join(fontsDir, 'DejaVuSans-Bold.ttf')
    
    if (!fs.existsSync(normalPath)) {
      console.log('Скачиваю DejaVuSans.ttf...')
      await downloadFile(fontUrls.normal, normalPath)
      console.log('✅ DejaVuSans.ttf скачан')
    } else {
      console.log('✅ DejaVuSans.ttf уже существует')
    }
    
    if (!fs.existsSync(boldPath)) {
      console.log('Скачиваю DejaVuSans-Bold.ttf...')
      await downloadFile(fontUrls.bold, boldPath)
      console.log('✅ DejaVuSans-Bold.ttf скачан')
    } else {
      console.log('✅ DejaVuSans-Bold.ttf уже существует')
    }
    
    console.log('✅ Все шрифты готовы!')
  } catch (error) {
    console.error('❌ Ошибка при скачивании шрифтов:', error.message)
    process.exit(1)
  }
}

main()

