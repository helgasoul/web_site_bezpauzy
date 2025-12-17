#!/bin/bash

# Скрипт для настройки git и подключения к GitHub

echo "Настройка git репозитория..."

# Инициализация git
git init
git branch -M main

# Добавление всех файлов проекта
git add package.json tsconfig.json next.config.js tailwind.config.ts postcss.config.js .eslintrc.json .gitignore README.md SETUP.md
git add app/ components/ lib/ next-env.d.ts

# Первый commit
git commit -m "Initial commit: Setup Next.js project with TypeScript, Tailwind CSS, and design system

- Configure Next.js 14 with App Router
- Setup TypeScript and Tailwind CSS with custom design system
- Create homepage with all sections (Hero, Social Proof, Articles, etc.)
- Add Header and Footer components
- Setup Supabase integration structure
- Add UI components (Button)
- Configure fonts (Montserrat, Inter, Playfair Display)
- Setup project structure following PRD specifications"

# Подключение к GitHub
git remote add origin https://github.com/helgasoul/web_site_bezpauzy.git

echo ""
echo "✅ Git настроен!"
echo ""
echo "Теперь выполните:"
echo "  git push -u origin main"
echo ""
echo "Или если нужно обновить существующий README:"
echo "  git pull origin main --allow-unrelated-histories"
echo "  git push -u origin main"



