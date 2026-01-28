#!/bin/bash
# Убирает большие файлы из истории ветки auth-flow-fix, чтобы пуш прошёл на GitHub.
# Запускай из корня проекта, находясь на ветке auth-flow-fix.

set -e
echo "Текущая ветка: $(git branch --show-current)"
echo "Удаляю большие файлы из истории..."

# Удаляем из истории public/welcome-video.mp4 и всю папку litrature/
git filter-branch --force --index-filter '
  git rm -rf --cached --ignore-unmatch "public/welcome-video.mp4" 2>/dev/null || true
  git rm -rf --cached --ignore-unmatch "litrature" 2>/dev/null || true
  true
' --prune-empty -- auth-flow-fix

echo "Готово. Теперь сделай: git push -u origin auth-flow-fix --force"
