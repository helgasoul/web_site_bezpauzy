# Без |Паузы — Веб-сайт

Премиальный веб-сайт в стиле "научного гламура" для женщин 40+ в менопаузе.

## Технологии

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (кастомная дизайн-система)
- **Supabase** (база данных и аутентификация)
- **Framer Motion** (анимации)
- **Lucide React** (иконки)

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Запуск dev-сервера

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## Структура проекта

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Корневой layout
│   ├── page.tsx           # Главная страница
│   └── globals.css        # Глобальные стили
├── components/            # React компоненты
│   ├── layout/           # Layout компоненты (Header, Footer)
│   ├── home/              # Компоненты главной страницы
│   └── ui/                # UI компоненты (Button, Card, etc.)
├── lib/                   # Утилиты и хелперы
│   └── utils.ts          # Утилиты (cn, etc.)
└── public/                # Статические файлы
```

## Дизайн-система

Цвета, типографика и spacing определены в `tailwind.config.ts` согласно PRD:

- **Primary Purple**: `#8B7FD6`
- **Ocean Wave**: `#7DD3E0` → `#A8E6F0`
- **Deep Navy**: `#3D4461`
- **Lavender BG**: `#E8E5F2`

## Следующие шаги

1. Настроить Supabase интеграцию
2. Создать страницы блога
3. Добавить страницу книги
4. Интегрировать Telegram бота
5. Настроить SEO

## Документация

Подробная документация проекта находится в `website_prd.md`.