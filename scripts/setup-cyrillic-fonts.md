# Настройка кириллических шрифтов для jsPDF

## Проблема
jsPDF 3.x требует конвертации TTF шрифтов через специальный конвертер. Простое добавление TTF файлов не работает.

## Решение

### Шаг 1: Конвертация шрифтов

1. Откройте конвертер: https://raw.githack.com/parallax/jsPDF/master/fontconverter/fontconverter.html
2. Загрузите шрифты:
   - DejaVuSans.ttf (normal)
   - DejaVuSans-Bold.ttf (bold)
3. Скачайте сгенерированные JavaScript файлы
4. Сохраните их в `lib/pdf/fonts/`:
   - `dejavu-sans-normal.js`
   - `dejavu-sans-bold.js`

### Шаг 2: Импорт шрифтов

Импортируйте шрифты в `lib/pdf/cyrillic-fonts.ts` перед использованием.

### Альтернатива: Использовать готовые конвертированные шрифты

Можно найти готовые конвертированные шрифты DejaVu Sans для jsPDF в интернете.

