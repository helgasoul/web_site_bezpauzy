/**
 * Скрипт для проверки регистрации шрифтов в jsPDF
 * Запускается при генерации PDF для диагностики
 */

const fs = require('fs')
const path = require('path')

const fontNormalPath = path.join(process.cwd(), 'public', 'fonts', 'DejaVuSans.ttf')
const fontBoldPath = path.join(process.cwd(), 'public', 'fonts', 'DejaVuSans-Bold.ttf')

console.log('🔍 Проверка шрифтов для PDF:')
console.log(`   Normal: ${fontNormalPath}`)
console.log(`   Exists: ${fs.existsSync(fontNormalPath)}`)
if (fs.existsSync(fontNormalPath)) {
  const stats = fs.statSync(fontNormalPath)
  console.log(`   Size: ${stats.size} bytes`)
}

console.log(`   Bold: ${fontBoldPath}`)
console.log(`   Exists: ${fs.existsSync(fontBoldPath)}`)
if (fs.existsSync(fontBoldPath)) {
  const stats = fs.statSync(fontBoldPath)
  console.log(`   Size: ${stats.size} bytes`)
}

if (fs.existsSync(fontNormalPath) && fs.existsSync(fontBoldPath)) {
  console.log('✅ Оба шрифта найдены')
  
  // Проверяем, что это валидные TTF файлы
  const normalBuffer = fs.readFileSync(fontNormalPath)
  const boldBuffer = fs.readFileSync(fontBoldPath)
  
  // TTF файлы начинаются с определенных байтов
  const ttfSignature = Buffer.from([0x00, 0x01, 0x00, 0x00])
  const otfSignature = Buffer.from([0x4F, 0x54, 0x54, 0x4F])
  
  const normalStart = normalBuffer.slice(0, 4)
  const boldStart = boldBuffer.slice(0, 4)
  
  console.log(`   Normal signature: ${normalStart.toString('hex')}`)
  console.log(`   Bold signature: ${boldStart.toString('hex')}`)
  
  if (normalStart.equals(ttfSignature) || normalStart.equals(otfSignature)) {
    console.log('✅ Normal шрифт - валидный TTF/OTF')
  } else {
    console.warn('⚠️ Normal шрифт - возможно, не TTF/OTF')
  }
  
  if (boldStart.equals(ttfSignature) || boldStart.equals(otfSignature)) {
    console.log('✅ Bold шрифт - валидный TTF/OTF')
  } else {
    console.warn('⚠️ Bold шрифт - возможно, не TTF/OTF')
  }
} else {
  console.error('❌ Шрифты не найдены!')
  process.exit(1)
}

