# Bundle Size Optimization Guide

## Текущее состояние

### Большие chunks (> 250KB):
- `4615-*.js`: 514.13 KB ⚠️
- `1826-*.js`: 411.51 KB ⚠️

## Причины больших chunks

### 1. Большие библиотеки
- **framer-motion** (~100KB): Используется в 107+ компонентах
- **@react-pdf/renderer** (~200KB): Используется в 11 PDF компонентах
- **@supabase/supabase-js** (~150KB): Используется везде
- **lucide-react** (~50KB): Используется везде

### 2. Отсутствие code splitting
- Все компоненты загружаются сразу
- PDF компоненты загружаются даже когда не нужны
- Большие компоненты не используют dynamic imports

## Рекомендации по оптимизации

### Приоритет 1: PDF компоненты (высокий приоритет) ✅

PDF компоненты используются только при генерации PDF через API, но могут попадать в bundle из-за импортов.

**Проверка выполнена:**
- ✅ PDF компоненты используются только на сервере (API routes)
- ✅ PDF компоненты НЕ импортируются в клиентских компонентах
- ✅ Все PDF компоненты находятся в `lib/pdf/` и используются только в `app/api/`
- ✅ `@react-pdf/renderer` не попадает в клиентский bundle

**Вывод:** PDF компоненты уже оптимизированы правильно! ✅

### Приоритет 2: Framer Motion (средний приоритет) ✅

Framer Motion используется везде, но можно оптимизировать:

**Реализовано:**
1. ✅ Заменены простые анимации (opacity, y, scale) на CSS transitions с Intersection Observer
2. ✅ Добавлены CSS классы `.fade-in`, `.scale-in` для анимаций при появлении
3. ✅ Создана утилита `initFadeInAnimations()` для управления анимациями
4. ✅ Оптимизированы компоненты `SocialProof` и `Testimonials`
5. ✅ Добавлен dynamic import для `AskEvaWidget` (компонент ниже fold)

**Результат:**
- Уменьшен размер bundle за счет удаления framer-motion из некоторых компонентов
- Улучшена производительность за счет нативных CSS анимаций
- Сохранена функциональность анимаций при появлении элементов

**Пример:**
```typescript
// Вместо
import { motion } from 'framer-motion'

// Использовать dynamic import для компонентов ниже fold
const MotionComponent = dynamic(() => import('./MotionComponent'), {
  ssr: false
})
```

### Приоритет 3: Lucide React (низкий приоритет) ✅

Lucide React уже оптимизирован для tree-shaking, но можно проверить:

**Проверка выполнена:**
- ✅ Все импорты используют именованные импорты (не `import *`)
- ✅ Исправлен `CategoryCard.tsx`: заменен `import * as Icons` на конкретные импорты
- ✅ Создан маппинг иконок для динамического выбора с сохранением tree-shaking

**Результат:**
- Tree-shaking работает правильно
- В bundle попадают только используемые иконки
- Улучшена производительность за счет правильных импортов

**Правильно:**
```typescript
import { Download, Loader2 } from 'lucide-react'
```

**Неправильно:**
```typescript
import * as Icons from 'lucide-react'
```

### Приоритет 4: Dynamic Imports для больших компонентов ✅

Компоненты, которые не нужны на первой загрузке:

1. ✅ **Community Dashboard** - добавлен dynamic import (403.72 KB → lazy loaded)
2. ⏳ **Quiz компоненты** - загружать только при переходе на страницу квиза
3. ✅ **PDF download buttons** - уже используют API
4. ✅ **AskEvaWidget** - добавлен dynamic import на нескольких страницах

**Реализовано:**
- ✅ `app/community/dashboard/page.tsx` - использует dynamic import для `CommunityDashboard`
- ✅ Добавлен loading state для лучшего UX
- ✅ `ssr: false` для компонентов с client-side state

**Пример:**
```typescript
// app/quiz/mrs/page.tsx
import dynamic from 'next/dynamic'

const MRSQuizInterface = dynamic(() => import('@/components/quiz/MRSQuizInterface'), {
  loading: () => <div>Загрузка...</div>,
  ssr: false
})
```

## Целевые показатели

- **JavaScript chunks**: < 250KB каждый
- **First Load JS**: < 100KB
- **Total bundle size**: < 500KB (gzipped)

## Мониторинг

Используйте команды:
```bash
npm run perf:bundle  # Визуальный анализ
npm run perf:check   # Быстрая проверка
npm run perf:quick   # Проверка без сборки
```

## Следующие шаги

1. ✅ Проверить импорты PDF компонентов
2. ⏳ Добавить dynamic imports для quiz компонентов
3. ✅ Оптимизировать framer-motion (заменить простые анимации на CSS)
   - ✅ `HeroSection` - заменен framer-motion на CSS-анимации
   - ✅ `SocialProof` - уже использует CSS-анимации
   - ✅ `Testimonials` - уже использует CSS-анимации
4. ✅ Проверить tree-shaking для всех библиотек
5. ✅ Добавить dynamic imports для компонентов ниже fold на главной странице
   - ✅ `CommunitySection`, `LatestArticles`, `BookTeaser`, `HowItWorks`, `Testimonials`, `CTASection`
6. ⏳ Оптимизировать chunk 449 (412.45 KB)
   - ⏳ Проверить, что входит в этот chunk
   - ⏳ Оптимизировать импорты Supabase (если возможно)
   - ⏳ Проверить, можно ли разделить на более мелкие chunks
   - ⏳ Использовать dynamic imports для больших компонентов в layout

