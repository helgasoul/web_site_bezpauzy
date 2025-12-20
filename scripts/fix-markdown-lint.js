const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'litrature/Загруженные в Без|паузы/anti_inflammatory_nutrition_guide_women_ru.md');

let content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');
const result = [];
let headingCounts = {};

// Исправляем MD032: добавляем пустую строку перед списками
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();
  const isList = trimmed.match(/^[-*]\s/);
  
  // Исправляем MD024: дублирующиеся заголовки
  if (trimmed.match(/^###?\s/)) {
    const headingText = trimmed;
    if (headingCounts[headingText]) {
      headingCounts[headingText]++;
      // Добавляем номер к дублирующемуся заголовку
      const match = trimmed.match(/^(###?\s)(.+)$/);
      if (match) {
        result.push(`${match[1]}${match[2]} (${headingCounts[headingText]})`);
        continue;
      }
    } else {
      headingCounts[headingText] = 1;
    }
  }
  
  if (isList && i > 0) {
    const prevLine = lines[i - 1].trim();
    // Если предыдущая строка не пустая и не список и не заголовок и не разделитель
    if (prevLine && 
        !prevLine.match(/^[-*]\s/) && 
        !prevLine.match(/^#+\s/) &&
        !prevLine.match(/^---$/) &&
        !prevLine.match(/^\.\.\.$/)) {
      // Добавляем пустую строку перед списком
      if (result.length > 0 && result[result.length - 1].trim() !== '') {
        result.push('');
      }
    }
  }
  
  result.push(line);
}

content = result.join('\n');

// Исправляем MD047: файл должен заканчиваться одной пустой строкой
if (!content.endsWith('\n')) {
  content += '\n';
} else {
  // Убираем лишние пустые строки в конце
  content = content.replace(/\n+$/, '\n');
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Исправления применены');

