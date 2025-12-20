# Настройка кириллических шрифтов для PDF

## Что было сделано

1. ✅ Создана утилита `lib/pdf/cyrillic-fonts.ts` для загрузки и регистрации кириллических шрифтов
2. ✅ Обновлен `lib/pdf/generate-quiz-pdf.ts` для использования кириллических шрифтов
3. ✅ Обновлены API routes для работы с async функциями генерации PDF

## Требования

Для правильной работы кириллицы в PDF нужны шрифты DejaVu Sans:
- `public/fonts/DejaVuSans.ttf` (обычный)
- `public/fonts/DejaVuSans-Bold.ttf` (жирный)

## Установка шрифтов

### Автоматическая установка (рекомендуется)

Выполните в терминале из корня проекта:

```bash
mkdir -p public/fonts
cd public/fonts
curl -L -o DejaVuSans.ttf "https://github.com/dejavu-fonts/dejavu-fonts/raw/master/ttf/DejaVuSans.ttf"
curl -L -o DejaVuSans-Bold.ttf "https://github.com/dejavu-fonts/dejavu-fonts/raw/master/ttf/DejaVuSans-Bold.ttf"
```

### Ручная установка

1. Скачайте шрифты DejaVu Sans с [GitHub](https://github.com/dejavu-fonts/dejavu-fonts)
2. Создайте папку `public/fonts/` в корне проекта
3. Скопируйте файлы:
   - `DejaVuSans.ttf`
   - `DejaVuSans-Bold.ttf`

## Как это работает

1. **На клиенте (браузер)**: Шрифты загружаются через `fetch` из `/fonts/DejaVuSans.ttf`
2. **На сервере (API routes)**: Шрифты читаются из файловой системы `public/fonts/`
3. Шрифты конвертируются в base64 и регистрируются в jsPDF через `addFileToVFS` и `addFont`
4. Все тексты выводятся через функцию `safeText`, которая автоматически использует DejaVuSans

## Fallback

Если шрифты не найдены, используется fallback:
- На клиенте: кириллица может отображаться как `?`
- На сервере: кириллица заменяется на `?`

## Проверка

После установки шрифтов проверьте:
1. Запустите `npm run dev`
2. Пройдите квиз и нажмите "Скачать результаты (PDF)"
3. Откройте PDF и убедитесь, что кириллица отображается правильно

## Примечания

- Шрифты DejaVu Sans поддерживают кириллицу, латиницу и многие другие языки
- Размер каждого шрифта: ~290KB
- Шрифты лицензированы под Bitstream Vera License (свободная лицензия)

