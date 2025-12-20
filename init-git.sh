#!/bin/bash

# Скрипт для инициализации Git и первого коммита
# Запустите этот скрипт из директории проекта: bash init-git.sh

set -e

echo "🚀 Инициализация Git репозитория..."

# Удаляем старые репозитории, если они есть
rm -rf ~/.git
rm -rf ~/Documents/.git

# Инициализируем Git в текущей директории
git init
git branch -M main

# Подключаем удаленный репозиторий
git remote add origin https://github.com/helgasoul/web_site_bezpauzy.git 2>/dev/null || \
git remote set-url origin https://github.com/helgasoul/web_site_bezpauzy.git

echo "✓ Git инициализирован"
echo "✓ Удаленный репозиторий подключен"

# Проверяем подключение
echo ""
echo "📡 Проверка подключения к GitHub:"
git remote -v

# Добавляем все файлы
echo ""
echo "📦 Добавление файлов..."
git add .

# Создаем первый коммит
echo ""
echo "💾 Создание первого коммита..."
git commit -m "Initial commit: Website with authentication system v1.0.0

- Added registration and login system with username/password
- Added Telegram ID linking via deep links
- Added user dashboard with quiz results history
- Added chat integration with Eva AI assistant
- Database migrations for authentication system
- RLS policies for menohub_users table
- Components: RegisterModal, WebsiteLoginModal, TelegramLinkModal
- API routes for auth, chat, quiz results
- Versioning system with CHANGELOG.md"

echo ""
echo "✅ Коммит создан!"
echo ""
echo "📤 Для отправки на GitHub выполните:"
echo "   git push -u origin main"
echo ""
echo "⚠️  Если на GitHub уже есть файлы, сначала выполните:"
echo "   git pull origin main --allow-unrelated-histories"
echo "   git push -u origin main"

