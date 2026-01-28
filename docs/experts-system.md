# Система управления экспертами

## Описание

Система автоматически подставляет фото и имя экспертов (гинеколог, нутрициолог, маммолог) во все места, где они нужны: статьи, блоги, видео, контент и т.д.

## Как это работает

### 1. База данных экспертов

Все эксперты хранятся в файле `lib/experts.ts`. Каждый эксперт имеет:
- `id` - уникальный идентификатор
- `name` - имя и фамилия
- `role` - должность/специализация
- `avatar` - путь к фото (в папке `public/`)
- `category` - категория (`gynecologist`, `mammologist`, `nutritionist`)
- `bio` - краткая биография (опционально)

### 2. Автоматическая подстановка

Система автоматически подставляет эксперта по категории контента:

```typescript
import { getExpertByCategory } from '@/lib/experts'

// В статье с категорией 'nutritionist' автоматически подставится нутрициолог
const expert = getExpertByCategory('nutritionist')
```

### 3. Где используется

- **BlogListing** - список статей в журнале
- **ArticleHeader** - заголовок статьи с автором
- **app/blog/[slug]/page.tsx** - динамические страницы статей
- **app/blog/aging-i-menopauza-5-pravil-vechnoy-molodosti/page.tsx** - статические страницы статей

## Как добавить нового эксперта

1. Добавьте фото эксперта в папку `public/experts/` (например, `public/experts/ivanov-ivan.jpg`)

2. Откройте `lib/experts.ts` и добавьте нового эксперта:

```typescript
{
  id: 'ivanov-ivan',
  name: 'Иванов Иван',
  role: 'Гинеколог-эндокринолог',
  avatar: '/experts/ivanov-ivan.jpg',
  category: 'gynecologist',
  bio: 'Специалист по менопаузе',
}
```

3. Система автоматически начнет использовать этого эксперта во всех местах, где нужна категория `gynecologist`

## Как изменить фото существующего эксперта

1. Замените фото в папке `public/experts/` (или укажите новый путь)
2. Обновите поле `avatar` в `lib/experts.ts`
3. Изменения применятся автоматически во всех местах

## Функции для работы с экспертами

### `getExpertByCategory(category)`
Получить эксперта по категории контента.

```typescript
const expert = getExpertByCategory('gynecologist')
// Вернет эксперта с category: 'gynecologist'
```

### `getExpertById(id)`
Получить эксперта по ID.

```typescript
const expert = getExpertById('shamugia-natia')
```

### `getExpertByName(name)`
Получить эксперта по имени.

```typescript
const expert = getExpertByName('Шамугия Натия')
```

### `getExpertsByCategory(category)`
Получить всех экспертов определенной категории.

```typescript
const experts = getExpertsByCategory('gynecologist')
// Вернет массив всех гинекологов
```

### `getAllExperts()`
Получить всех экспертов.

```typescript
const allExperts = getAllExperts()
```

## Примеры использования

### В компоненте статьи

```typescript
import { getExpertByCategory } from '@/lib/experts'

const article = {
  category: 'nutritionist',
  // ...
}

const expert = getExpertByCategory(article.category as ExpertCategory)
const author = expert ? {
  name: expert.name,
  role: expert.role,
  avatar: expert.avatar,
} : defaultAuthor
```

### В списке статей

```typescript
const articles = [
  {
    category: 'gynecologist',
    author: (() => {
      const expert = getExpertByCategory('gynecologist')
      return expert || defaultAuthor
    })(),
  }
]
```

## Важные замечания

1. **Фото должны быть в формате JPG/PNG** и оптимизированы для веба
2. **Путь к фото** должен начинаться с `/` (относительно папки `public/`)
3. **Категории** должны точно соответствовать: `gynecologist`, `mammologist`, `nutritionist`
4. **Fallback**: Если эксперт не найден, используется значение по умолчанию из данных статьи

## Текущие эксперты

- **Шамугия Натия** - Гинеколог-эндокринолог (`gynecologist`)
- **Пучкова Ольга** - Маммолог-онколог (`mammologist`)
- **Климкова Марина** - Эксперт-нутрициолог (`nutritionist`)

## Добавление фото

Для добавления фото экспертов:

1. Поместите фото в `public/experts/`
2. Обновите поле `avatar` в `lib/experts.ts`
3. Рекомендуемые размеры: 400x400px, квадратное, хорошее качество

