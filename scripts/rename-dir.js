#!/usr/bin/env node

/**
 * Скрипт для переименования директории
 */

const fs = require('fs')
const path = require('path')

const oldName = 'litrature/Загруженные в Без|паузы'
const newName = 'litrature/Загруженные в Без-паузы'

const oldPath = path.resolve(oldName)
const newPath = path.resolve(newName)

console.log('Попытка переименовать:')
console.log('  От:', oldPath)
console.log('  К: ', newPath)
console.log()

try {
  // Проверяем существование
  if (!fs.existsSync(oldPath)) {
    console.log('❌ Старая директория не найдена:', oldPath)
    
    // Показываем что есть
    const litraturePath = path.resolve('litrature')
    if (fs.existsSync(litraturePath)) {
      console.log('\nДиректории в litrature:')
      const items = fs.readdirSync(litraturePath)
      items.forEach(item => {
        const itemPath = path.join(litraturePath, item)
        if (fs.statSync(itemPath).isDirectory()) {
          console.log('  -', item)
        }
      })
    }
    process.exit(1)
  }
  
  // Проверяем, существует ли новая
  if (fs.existsSync(newPath)) {
    console.log('⚠️  Новая директория уже существует:', newPath)
    console.log('Переименование не выполнено.')
    process.exit(0)
  }
  
  // Переименовываем
  fs.renameSync(oldPath, newPath)
  console.log('✅ Успешно переименовано!')
  console.log('   От:', oldName)
  console.log('   К: ', newName)
  
} catch (error) {
  console.error('❌ Ошибка:', error.message)
  process.exit(1)
}

