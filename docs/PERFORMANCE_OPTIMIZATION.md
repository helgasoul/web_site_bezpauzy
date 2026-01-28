# Оптимизация производительности и Core Web Vitals

## Текущий статус

✅ **Реализовано:**
- Оптимизация изображений (WebP, AVIF)
- Font optimization (next/font/google с display: swap)
- Компрессия включена
- Security headers оптимизированы
- DNS prefetch для шрифтов

⚠️ **Требует проверки:**
- Lighthouse аудит
- Core Web Vitals метрики
- Bundle size анализ

## Core Web Vitals

### Целевые показатели

| Метрика | Цель | Критично |
|---------|------|----------|
| **LCP** (Largest Contentful Paint) | < 2.5s | < 4.0s |
| **FID** (First Input Delay) | < 100ms | < 300ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | < 0.25 |
| **FCP** (First Contentful Paint) | < 1.8s | < 3.0s |
| **TTFB** (Time to First Byte) | < 600ms | < 800ms |

## Оптимизации

### 1. Изображения

**Уже реализовано:**
- ✅ Использование `next/image` компонента
- ✅ Автоматическая конвертация в WebP/AVIF
- ✅ Lazy loading по умолчанию
- ✅ Responsive sizes

**Рекомендации:**
- Используйте `priority` для изображений выше fold
- Указывайте `sizes` для всех изображений
- Оптимизируйте размеры изображений перед загрузкой

**Пример:**
```tsx
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={630}
  priority // Для изображений выше fold
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
/>
```

### 2. Шрифты

**Уже реализовано:**
- ✅ next/font/google с display: swap
- ✅ Preload для критических шрифтов
- ✅ Subset optimization (latin, cyrillic)

**Рекомендации:**
- Используйте только необходимые веса шрифтов
- Рассмотрите использование font-display: optional для некритических шрифтов

### 3. JavaScript Bundle

**Рекомендации:**
- Используйте dynamic imports для компонентов ниже fold
- Анализируйте bundle size с помощью `npm run build`
- Используйте code splitting для больших библиотек

**Пример динамического импорта:**
```tsx
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Загрузка...</p>,
  ssr: false, // Если компонент не нужен для SSR
})
```

### 4. CSS

**Уже реализовано:**
- ✅ Tailwind CSS (только используемые классы)
- ✅ Experimental optimizeCss в next.config.js

**Рекомендации:**
- Избегайте больших CSS файлов
- Используйте CSS-in-JS только при необходимости

### 5. Server-Side Rendering

**Уже реализовано:**
- ✅ Next.js App Router (SSR по умолчанию)
- ✅ Server Components где возможно

**Рекомендации:**
- Используйте Server Components для статического контента
- Используйте Client Components только когда нужна интерактивность

## Мониторинг

### Lighthouse Audit

Запустите Lighthouse аудит:

```bash
# В Chrome DevTools
# 1. Откройте DevTools (F12)
# 2. Перейдите на вкладку Lighthouse
# 3. Выберите категории (Performance, SEO, Accessibility)
# 4. Нажмите "Generate report"
```

Или используйте CLI:

```bash
npm install -g lighthouse
lighthouse https://bezpauzy.com --view
```

### Bundle Size Analysis

```bash
npm run build
# Проверьте вывод на размеры bundle
```

### Web Vitals в Production

Метрики автоматически отслеживаются через:
- Google Search Console (Core Web Vitals report)
- Google Analytics (если настроен)
- Real User Monitoring (RUM) инструменты

## Чек-лист оптимизации

### Перед деплоем

- [ ] Lighthouse score > 90 (Desktop), > 85 (Mobile)
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Все изображения оптимизированы
- [ ] Bundle size проверен
- [ ] Критические ресурсы предзагружены
- [ ] Неиспользуемый код удален

### Регулярная проверка

- [ ] Еженедельный Lighthouse аудит
- [ ] Мониторинг Core Web Vitals в Search Console
- [ ] Анализ bundle size после добавления зависимостей
- [ ] Проверка скорости загрузки на медленных соединениях

## Инструменты

### Анализ производительности

1. **Lighthouse** - встроен в Chrome DevTools
2. **WebPageTest** - https://www.webpagetest.org/
3. **PageSpeed Insights** - https://pagespeed.web.dev/
4. **Next.js Bundle Analyzer** - для анализа bundle size

### Bundle Analyzer ✅

**Уже установлен и настроен!**

Запуск:

```bash
npm run perf:bundle
```

Или:

```bash
ANALYZE=true npm run build
```

После завершения сборки автоматически откроется браузер с интерактивной визуализацией bundle size.

## Дополнительные оптимизации

### 1. CDN

Рекомендуется использовать CDN для статических ресурсов:
- Изображения
- Шрифты
- CSS/JS файлы

### 2. Кэширование

Настройте кэширование для:
- Статических ресурсов (1 год)
- HTML страниц (revalidate)
- API responses (где возможно)

### 3. Prefetching

Используйте `<Link prefetch>` для важных страниц:

```tsx
<Link href="/blog" prefetch>
  Блог
</Link>
```

## Проблемы и решения

### Медленный LCP

**Причины:**
- Большие изображения
- Медленный сервер
- Блокирующие ресурсы

**Решения:**
- Оптимизируйте изображения
- Используйте priority для hero изображений
- Предзагружайте критический CSS
- Используйте CDN

### Высокий CLS

**Причины:**
- Изображения без размеров
- Динамический контент
- Шрифты без fallback

**Решения:**
- Всегда указывайте width/height для изображений
- Используйте aspect-ratio для контейнеров
- Используйте font-display: swap

### Медленный FID

**Причины:**
- Большой JavaScript bundle
- Долгие задачи в main thread
- Неоптимизированные обработчики событий

**Решения:**
- Code splitting
- Lazy loading компонентов
- Оптимизация обработчиков событий
- Использование Web Workers для тяжелых задач

