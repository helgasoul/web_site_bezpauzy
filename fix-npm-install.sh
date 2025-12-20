#!/bin/bash

# Скрипт для решения проблем с установкой npm пакетов

echo "🔧 Решение проблем с установкой npm пакетов..."
echo ""

# 1. Очистка кеша npm
echo "1️⃣ Очистка кеша npm..."
npm cache clean --force
echo "✅ Кеш очищен"
echo ""

# 2. Увеличение таймаута
echo "2️⃣ Настройка таймаутов..."
npm config set fetch-timeout 600000
npm config set fetch-retry-mintimeout 20000
npm config set fetch-retry-maxtimeout 120000
echo "✅ Таймауты увеличены"
echo ""

# 3. Проверка registry
echo "3️⃣ Проверка npm registry..."
CURRENT_REGISTRY=$(npm config get registry)
echo "Текущий registry: $CURRENT_REGISTRY"
echo ""

# 4. Попытка установки с увеличенным таймаутом
echo "4️⃣ Установка зависимостей..."
echo "Это может занять несколько минут..."
echo ""

npm install --prefer-offline --no-audit

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Зависимости успешно установлены!"
else
    echo ""
    echo "⚠️ Установка не завершена. Попробуйте:"
    echo "   npm install --legacy-peer-deps"
    echo "   или"
    echo "   npm install --network-timeout=600000"
fi







