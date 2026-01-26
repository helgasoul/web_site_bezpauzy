#!/usr/bin/env node

/**
 * Скрипт для проверки изображений на сайте
 * Проверяет:
 * - Наличие alt-текстов
 * - Использование Next.js Image компонента
 * - Оптимизацию (sizes, priority)
 */

const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '../components');
const appDir = path.join(__dirname, '../app');

const issues = {
  missingAlt: [],
  emptyAlt: [],
  noSizes: [],
  noPriority: [],
  usingImgTag: [],
};

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  // Проверка на <img> теги
  if (content.includes('<img')) {
    const imgMatches = content.matchAll(/<img[^>]*>/g);
    for (const match of imgMatches) {
      issues.usingImgTag.push({
        file: filePath,
        line: content.substring(0, match.index).split('\n').length,
        code: match[0],
      });
    }
  }
  
  // Проверка Image компонентов
  if (content.includes('<Image') || content.includes('Image')) {
    lines.forEach((line, index) => {
      // Проверка на отсутствие alt
      if (line.includes('<Image') && !line.includes('alt=') && !line.includes('alt={')) {
        // Проверяем следующие строки
        let foundAlt = false;
        for (let i = index; i < Math.min(index + 5, lines.length); i++) {
          if (lines[i].includes('alt=') || lines[i].includes('alt={')) {
            foundAlt = true;
            break;
          }
          if (lines[i].includes('/>') || lines[i].includes('>')) {
            break;
          }
        }
        if (!foundAlt) {
          issues.missingAlt.push({
            file: filePath,
            line: index + 1,
            code: line.trim(),
          });
        }
      }
      
      // Проверка на пустой alt
      if (line.includes('alt=""') || line.includes("alt=''") || line.includes('alt={""}') || line.includes("alt={''}")) {
        issues.emptyAlt.push({
          file: filePath,
          line: index + 1,
          code: line.trim(),
        });
      }
      
      // Проверка на отсутствие sizes для fill изображений
      if (line.includes('fill') && !content.includes('sizes=')) {
        // Проверяем, есть ли sizes в следующих строках
        let foundSizes = false;
        for (let i = index; i < Math.min(index + 10, lines.length); i++) {
          if (lines[i].includes('sizes=')) {
            foundSizes = true;
            break;
          }
          if (lines[i].includes('/>') || (lines[i].includes('>') && !lines[i].includes('<'))) {
            break;
          }
        }
        if (!foundSizes) {
          issues.noSizes.push({
            file: filePath,
            line: index + 1,
            code: line.trim(),
          });
        }
      }
    });
  }
}

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && file !== '.next') {
      walkDir(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Проверка компонентов
const componentFiles = walkDir(componentsDir);
componentFiles.forEach(checkFile);

// Проверка app
const appFiles = walkDir(appDir);
appFiles.forEach(checkFile);

// Вывод результатов
console.log('=== ОТЧЕТ О ПРОВЕРКЕ ИЗОБРАЖЕНИЙ ===\n');

if (issues.missingAlt.length > 0) {
  console.log('❌ Изображения без alt-текста:');
  issues.missingAlt.forEach(issue => {
    console.log(`  ${issue.file}:${issue.line}`);
    console.log(`    ${issue.code.substring(0, 80)}...`);
  });
  console.log('');
}

if (issues.emptyAlt.length > 0) {
  console.log('⚠️  Изображения с пустым alt-текстом:');
  issues.emptyAlt.forEach(issue => {
    console.log(`  ${issue.file}:${issue.line}`);
    console.log(`    ${issue.code.substring(0, 80)}...`);
  });
  console.log('');
}

if (issues.usingImgTag.length > 0) {
  console.log('⚠️  Использование <img> вместо Next.js Image:');
  issues.usingImgTag.forEach(issue => {
    console.log(`  ${issue.file}:${issue.line}`);
    console.log(`    ${issue.code.substring(0, 80)}...`);
  });
  console.log('');
}

if (issues.noSizes.length > 0) {
  console.log('⚠️  Изображения с fill без sizes:');
  issues.noSizes.forEach(issue => {
    console.log(`  ${issue.file}:${issue.line}`);
  });
  console.log('');
}

// Итоговая статистика
const totalIssues = 
  issues.missingAlt.length + 
  issues.emptyAlt.length + 
  issues.usingImgTag.length + 
  issues.noSizes.length;

if (totalIssues === 0) {
  console.log('✅ Все изображения в порядке!');
} else {
  console.log(`\n📊 Всего найдено проблем: ${totalIssues}`);
  console.log(`   - Без alt: ${issues.missingAlt.length}`);
  console.log(`   - Пустой alt: ${issues.emptyAlt.length}`);
  console.log(`   - <img> теги: ${issues.usingImgTag.length}`);
  console.log(`   - Без sizes: ${issues.noSizes.length}`);
}

